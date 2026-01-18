import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { AuthenticationError, ValidationError } from '../utils/errors.js';
import User from '../models/User.js';

export const register = async (username, email, password) => {
    const existingUser = await User.findOne({
        where: {
            [Op.or]: [
                { email },
                { username }
            ]
        }
    });

    if (existingUser) {
        if (existingUser.email === email) {
            throw new ValidationError('Email already registered');
        }
        if (existingUser.username === username) {
            throw new ValidationError('Username already taken');
        }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
        username,
        email,
        passwordHash
    });

    const accessToken = generateAccessToken(user);

    return {
        user: {
            id: user.id,
            username: user.username,
            email: user.email
        },
        accessToken
    };
};

export const login = async (email, password) => {
    const user = await User.findOne({ where: { email } });

    if (!user) {
        throw new AuthenticationError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
        user: {
            id: user.id,
            username: user.username,
            email: user.email
        },
        accessToken,
        refreshToken
    };
};

export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
            username: user.username,
            email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
    );
};

export const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
            type: 'refresh'
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
    );
};

export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        throw new AuthenticationError('Invalid refresh token');
    }
};

export const refreshAccessToken = async (refreshToken) => {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await User.findByPk(decoded.userId);
    if (!user) {
        throw new AuthenticationError('User not found');
    }

    return generateAccessToken(user);
};

