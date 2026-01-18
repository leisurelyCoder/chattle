import * as messageService from '../services/messageService.js';
import * as conversationService from '../services/conversationService.js';

export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    await conversationService.verifyConversationParticipant(conversationId, req.user.id);
    
    const result = await messageService.getMessages(conversationId, req.user.id, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    const conversation = await conversationService.verifyConversationParticipant(conversationId, req.user.id);
    
    const receiverId = conversation.participant1Id === req.user.id
      ? conversation.participant2Id
      : conversation.participant1Id;

    const message = await messageService.createMessage(
      conversationId,
      req.user.id,
      receiverId,
      content
    );

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

