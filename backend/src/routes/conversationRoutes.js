import express from 'express';
import { getConversations, getConversation, createConversation } from '../controllers/conversationController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate, conversationValidation } from '../utils/validators.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getConversations);
router.get('/:conversationId', getConversation);
router.post('/', validate(conversationValidation), createConversation);

export default router;

