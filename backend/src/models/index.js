import User from './User.js';
import Conversation from './Conversation.js';
import Message from './Message.js';
import UserSession from './UserSession.js';

// Define all associations (centralized to avoid circular dependencies)

// User associations
User.hasMany(Conversation, { foreignKey: 'participant1Id', as: 'conversationsAsParticipant1' });
User.hasMany(Conversation, { foreignKey: 'participant2Id', as: 'conversationsAsParticipant2' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
User.hasMany(UserSession, { foreignKey: 'userId', as: 'sessions' });

// Conversation associations
Conversation.belongsTo(User, { foreignKey: 'participant1Id', as: 'participant1' });
Conversation.belongsTo(User, { foreignKey: 'participant2Id', as: 'participant2' });
Conversation.belongsTo(Message, { foreignKey: 'lastMessageId', as: 'lastMessage' });
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });

// Message associations
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// UserSession associations
UserSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export {
  User,
  Conversation,
  Message,
  UserSession
};

