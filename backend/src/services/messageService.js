import { NotFoundError, ValidationError } from '../utils/errors.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import { formatMessageResponse } from '../utils/helpers.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

export const createMessage = async (conversationId, senderId, receiverId, content) => {
    const transaction = await sequelize.transaction();

    try {
        const conversation = await Conversation.findByPk(conversationId, { transaction });
        if (!conversation) {
            throw new NotFoundError('Conversation');
        }

        if (conversation.participant1Id !== senderId && conversation.participant2Id !== senderId) {
            throw new ValidationError('You are not a participant in this conversation');
        }

        if (senderId === receiverId) {
            throw new ValidationError('Cannot send message to yourself');
        }

        const message = await Message.create({
            conversationId,
            senderId,
            receiverId,
            content,
            deliveryStatus: 'sent'
        }, { transaction });

        conversation.lastMessageId = message.id;
        conversation.lastMessageAt = new Date();
        await conversation.save({ transaction });

        await transaction.commit();

        const messageWithRelations = await Message.findByPk(message.id, {
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'username']
                },
                {
                    model: User,
                    as: 'receiver',
                    attributes: ['id', 'username']
                }
            ]
        });

        if (!messageWithRelations) {
            throw new Error('Message not found after creation');
        }

        return formatMessageResponse(messageWithRelations);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const getMessages = async (conversationId, userId, page = 1, limit = 50) => {
    const conversation = await Conversation.findOne({
        where: {
            id: conversationId,
            [Op.or]: [
                { participant1Id: userId },
                { participant2Id: userId }
            ]
        }
    });

    if (!conversation) {
        throw new NotFoundError('Conversation');
    }

    const offset = (page - 1) * limit;

    const { count, rows: messages } = await Message.findAndCountAll({
        where: { conversationId },
        include: [
            {
                model: User,
                as: 'sender',
                attributes: ['id', 'username', 'avatarUrl']
            },
            {
                model: User,
                as: 'receiver',
                attributes: ['id', 'username', 'avatarUrl']
            }
        ],
        order: [[sequelize.literal('created_at'), 'DESC']],
        limit,
        offset
    });

    const totalPages = Math.ceil(count / limit);

    // Format messages and filter out nulls, then reverse to show oldest first
    const formattedMessages = messages
        .map(msg => formatMessageResponse(msg))
        .filter(msg => msg !== null && msg.id);
    
    // Reverse to show oldest first (since we ordered DESC)
    formattedMessages.reverse();

    return {
        messages: formattedMessages,
        pagination: {
            page,
            limit,
            total: count,
            totalPages,
            hasMore: page < totalPages
        }
    };
};

export const markMessagesAsDelivered = async (messageIds, receiverId) => {
    await Message.update(
        { deliveryStatus: 'delivered' },
        {
            where: {
                id: { [Op.in]: messageIds },
                receiverId,
                deliveryStatus: 'sent'
            }
        }
    );
};

export const markMessagesAsRead = async (messageIds, receiverId) => {
    await Message.update(
        { deliveryStatus: 'read' },
        {
            where: {
                id: { [Op.in]: messageIds },
                receiverId,
                deliveryStatus: { [Op.in]: ['sent', 'delivered'] }
            }
        }
    );

    const updatedMessages = await Message.findAll({
        where: {
            id: { [Op.in]: messageIds },
            receiverId
        }
    });

    return updatedMessages;
};

