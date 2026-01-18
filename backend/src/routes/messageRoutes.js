import express from 'express';
import { getMessages, createMessage } from '../controllers/messageController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate, messageValidation } from '../utils/validators.js';
import { sanitizeInput } from '../middleware/sanitizer.js';

const router = express.Router();

router.use(authenticate);

router.get('/:conversationId/messages', getMessages);
router.post('/:conversationId/messages',
    sanitizeInput,
    validate(messageValidation),
    createMessage
);

export default router;

