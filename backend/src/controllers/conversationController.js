import * as conversationService from '../services/conversationService.js';

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await conversationService.getUserConversations(req.user.id);
    res.json(conversations);
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const conversation = await conversationService.getConversationById(conversationId, req.user.id);
    res.json(conversation);
  } catch (error) {
    next(error);
  }
};

export const createConversation = async (req, res, next) => {
  try {
    const { participantId } = req.body;
    const conversation = await conversationService.getOrCreateConversation(req.user.id, participantId);
    res.status(201).json(conversation);
  } catch (error) {
    next(error);
  }
};

