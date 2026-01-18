import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import UserSession from '../models/UserSession.js';
import * as conversationService from '../services/conversationService.js';
import * as messageService from '../services/messageService.js';
import * as userService from '../services/userService.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  const chatNamespace = io.of('/chat');

  chatNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data.user = {
        id: user.id,
        username: user.username,
        email: user.email
      };

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return next(new Error('Token expired'));
      } else if (error.name === 'JsonWebTokenError') {
        return next(new Error('Invalid token'));
      }
      return next(new Error('Authentication failed'));
    }
  });

  chatNamespace.on('connection', async (socket) => {
    const userId = socket.data.user.id;

    try {
      await UserSession.create({
        userId,
        socketId: socket.id,
        isActive: 1
      });

      const activeSessions = await UserSession.count({
        where: { userId, isActive: 1 }
      });

      if (activeSessions === 1) {
        await userService.updateOnlineStatus(userId, true);
        // Broadcast to all connected clients, not just user's own room
        chatNamespace.emit('user_online', { userId });
      }

      socket.join(`user:${userId}`);
      socket.emit('authenticated', {
        userId: socket.data.user.id,
        username: socket.data.user.username
      });

      socket.on('join_conversation', async (data) => {
        try {
          const { conversationId } = data;
          await conversationService.verifyConversationParticipant(conversationId, userId);
          socket.join(`conversation:${conversationId}`);
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      socket.on('leave_conversation', (data) => {
        const { conversationId } = data;
        socket.leave(`conversation:${conversationId}`);
      });

      socket.on('send_message', async (data) => {
        try {
          const { conversationId, content } = data;

          if (!content || content.trim().length === 0) {
            return socket.emit('error', { message: 'Message content cannot be empty' });
          }

          const conversation = await conversationService.verifyConversationParticipant(conversationId, userId);
          const receiverId = conversation.participant1Id === userId
            ? conversation.participant2Id
            : conversation.participant1Id;

          const message = await messageService.createMessage(
            conversationId,
            userId,
            receiverId,
            content
          );

          const receiverSessions = await UserSession.findAll({
            where: { userId: receiverId, isActive: 1 }
          });

          const isReceiverOnline = receiverSessions.length > 0;

          if (isReceiverOnline) {
            await messageService.markMessagesAsDelivered([message.id], receiverId);
            message.deliveryStatus = 'delivered';
          }

          chatNamespace.to(`conversation:${conversationId}`).emit('new_message', message);

          if (isReceiverOnline) {
            socket.emit('message_delivered', {
              messageId: message.id,
              conversationId
            });
          }
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      const typingTimers = new Map();

      socket.on('typing_start', (data) => {
        const { conversationId } = data;
        socket.to(`conversation:${conversationId}`).emit('user_typing', {
          userId,
          username: socket.data.user.username,
          conversationId
        });

        const timerKey = `${conversationId}-${userId}`;
        if (typingTimers.has(timerKey)) {
          clearTimeout(typingTimers.get(timerKey));
        }

        const timer = setTimeout(() => {
          socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
            userId,
            conversationId
          });
          typingTimers.delete(timerKey);
        }, 3000);

        typingTimers.set(timerKey, timer);
      });

      socket.on('typing_stop', (data) => {
        const { conversationId } = data;
        socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
          userId,
          conversationId
        });

        const timerKey = `${conversationId}-${userId}`;
        if (typingTimers.has(timerKey)) {
          clearTimeout(typingTimers.get(timerKey));
          typingTimers.delete(timerKey);
        }
      });

      socket.on('mark_read', async (data) => {
        try {
          const { conversationId, messageIds } = data;

          if (!messageIds || messageIds.length === 0) {
            return;
          }

          await conversationService.verifyConversationParticipant(conversationId, userId);
          
          const updatedMessages = await messageService.markMessagesAsRead(messageIds, userId);

          if (updatedMessages.length > 0) {
            // Get unique sender IDs from updated messages
            const senderIds = [...new Set(updatedMessages.map(m => m.senderId).filter(Boolean))];
            
            // Emit to all senders
            senderIds.forEach(senderId => {
              chatNamespace.to(`user:${senderId}`).emit('messages_read', {
                messageIds: updatedMessages.filter(m => m.senderId === senderId).map(m => m.id),
                conversationId
              });
            });
          }
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      socket.on('disconnect', async () => {
        try {
          await UserSession.update(
            { isActive: 0 },
            { where: { socketId: socket.id } }
          );

          const activeSessions = await UserSession.count({
            where: { userId, isActive: 1 }
          });

          if (activeSessions === 0) {
            await userService.updateOnlineStatus(userId, false);
            // Broadcast to all connected clients
            chatNamespace.emit('user_offline', {
              userId,
              lastSeen: new Date()
            });
          }

          typingTimers.forEach(timer => clearTimeout(timer));
          typingTimers.clear();
        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      });
    } catch (error) {
      console.error('Socket connection error:', error);
      socket.emit('error', { message: 'Connection error' });
    }
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

