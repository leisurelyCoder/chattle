import { Op } from 'sequelize';
import { NotFoundError } from '../utils/errors.js';
import User from '../models/User.js';
import { formatUserResponse } from '../utils/helpers.js';
import sequelize from '../config/database.js';

export const getCurrentUser = async (userId) => {
    const user = await User.findByPk(userId);

    if (!user) {
        throw new NotFoundError('User');
    }

    return formatUserResponse(user);
};

export const searchUsers = async (currentUserId, query) => {
    const users = await User.findAll({
        where: {
            id: { [Op.ne]: currentUserId },
            [Op.or]: [
                { username: { [Op.like]: `%${query}%` } },
                { email: { [Op.like]: `%${query}%` } }
            ]
        },
        limit: 20,
        attributes: ['id', 'username', 'email', 'avatarUrl', 'isOnline', 'lastSeen']
    });

    return users.map(user => formatUserResponse(user));
};

export const getAllUsers = async (currentUserId) => {
    const users = await User.findAll({
        where: {
            id: { [Op.ne]: currentUserId }
        },
        limit: 100,
        order: [[sequelize.literal('is_online'), 'DESC'], ['username', 'ASC']],
        attributes: ['id', 'username', 'email', 'avatarUrl', 'isOnline', 'lastSeen']
    });

    return users.map(user => formatUserResponse(user));
};

export const updateOnlineStatus = async (userId, isOnline) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new NotFoundError('User');
    }

    user.isOnline = isOnline ? 1 : 0;
    if (!isOnline) {
        user.lastSeen = new Date();
    }
    await user.save();

    return formatUserResponse(user);
};

