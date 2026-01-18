import { NotFoundError, ValidationError } from '../utils/errors.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import { formatConversationResponse, formatMessageResponse } from '../utils/helpers.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

export const getOrCreateConversation = async (currentUserId, participantId) => {
    if (currentUserId === participantId) {
        throw new ValidationError('Cannot create conversation with yourself');
    }

    const participant = await User.findByPk(participantId);
    if (!participant) {
        throw new NotFoundError('Participant');
    }

    let conversation = await Conversation.findOne({
        where: {
            [Op.or]: [
                {
                    participant1Id: currentUserId,
                    participant2Id: participantId
                },
                {
                    participant1Id: participantId,
                    participant2Id: currentUserId
                }
            ]
        },
        include: [
            {
                model: User,
                as: 'participant1',
                attributes: ['id', 'username', 'email', 'avatarUrl', 'isOnline', 'lastSeen']
            },
            {
                model: User,
                as: 'participant2',
                attributes: ['id', 'username', 'email', 'avatarUrl', 'isOnline', 'lastSeen']
            },
            {
                model: Message,
                as: 'lastMessage',
                include: [
                    {
                        model: User,
                        as: 'sender',
                        attributes: ['id', 'username']
                    }
                ]
            }
        ]
    });

    if (!conversation) {
        conversation = await Conversation.create({
            participant1Id: currentUserId,
            participant2Id: participantId
        });

        conversation = await Conversation.findByPk(conversation.id, {
            include: [
                {
                    model: User,
                    as: 'participant1',
                    attributes: ['id', 'username', 'email', 'avatarUrl', 'isOnline', 'lastSeen']
                },
                {
                    model: User,
                    as: 'participant2',
                    attributes: ['id', 'username', 'email', 'avatarUrl', 'isOnline', 'lastSeen']
                }
            ]
        });
    }

    return formatConversationResponse(conversation, currentUserId);
};

export const getUserConversations = async (userId) => {
    const conversations = await Conversation.findAll({
        where: {
            [Op.or]: [
                { participant1Id: userId },
                { participant2Id: userId }
            ]
        },
        include: [
            {
                model: User,
                as: 'participant1',
                attributes: ['id', 'username', 'email', 'avatarUrl', 'isOnline', 'lastSeen']
            },
            {
                model: User,
                as: 'participant2',
                attributes: ['id', 'username', 'email', 'avatarUrl', 'isOnline', 'lastSeen']
            },
            {
                model: Message,
                as: 'lastMessage',
                include: [
                    {
                        model: User,
                        as: 'sender',
                        attributes: ['id', 'username']
                    }
                ]
            }
        ],
        order: [
            [sequelize.literal('CASE WHEN last_message_at IS NULL THEN 1 ELSE 0 END'), 'ASC'],
            [sequelize.literal('last_message_at'), 'DESC'],
            [sequelize.literal('updated_at'), 'DESC']
        ]
    });

    return conversations.map(conv => formatConversationResponse(conv, userId));
};

export const getConversationById = async (conversationId, userId) => {
    const conversation = await Conversation.findOne({
        where: {
            id: conversationId,
            [Op.or]: [
                { participant1Id: userId },
                { participant2Id: userId }
            ]
        },
        include: [
            {
                model: User,
                as: 'participant1',
                attributes: ['id', 'username', 'email', 'avatarUrl', 'isOnline', 'lastSeen']
            },
            {
                model: User,
                as: 'participant2',
                attributes: ['id', 'username', 'email', 'avatarUrl', 'isOnline', 'lastSeen']
            }
        ]
    });

    if (!conversation) {
        throw new NotFoundError('Conversation');
    }

    return formatConversationResponse(conversation, userId);
};

export const verifyConversationParticipant = async (conversationId, userId) => {
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

    return conversation;
};

