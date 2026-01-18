import { body, validationResult } from 'express-validator';

export const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        const errorMessages = errors.array().map(err => ({
            field: err.path || err.param,
            message: err.msg
        }));

        return res.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: errorMessages
            }
        });
    };
};

export const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one letter and one number')
];

export const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

export const messageValidation = [
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Message content cannot be empty')
        .isLength({ max: 5000 })
        .withMessage('Message cannot exceed 5000 characters')
];

export const conversationValidation = [
    body('participantId')
        .notEmpty()
        .withMessage('Participant ID is required')
        .isUUID()
        .withMessage('Invalid participant ID format')
];

