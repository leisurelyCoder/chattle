import { defineStore } from 'pinia';
import { ref } from 'vue';
import socketService from '../services/socketService.js';
import { useChatStore } from './chatStore.js';
import { useAuthStore } from './authStore.js';
import api from '../services/api.js';

export const useSocketStore = defineStore('socket', () => {
  const isConnected = ref(false);
  const reconnectAttempts = ref(0);

  const setupSocketListeners = () => {
    const chatStore = useChatStore();
    const authStore = useAuthStore();

    socketService.on('authenticated', (data) => {
      console.log('Socket authenticated:', data);
      isConnected.value = true;
    });

    socketService.on('new_message', async (message) => {
      const user = authStore.user;
      
      // Check if conversation exists in the list
      let conversation = chatStore.conversations.find(c => c.id === message.conversationId);
      
      // If conversation doesn't exist, fetch it
      if (!conversation) {
        try {
          const response = await api.get(`/conversations/${message.conversationId}`);
          conversation = response.data;
          // Add to conversations list at the beginning (most recent first)
          if (conversation) {
            chatStore.conversations.unshift(conversation);
            // Update online status
            if (conversation.participant.isOnline === true) {
              chatStore.setUserOnline(conversation.participant.id, true);
            }
          }
        } catch (error) {
          console.error('Error fetching conversation for new message:', error);
        }
      } else {
        // Update conversation's last message and timestamp
        conversation.lastMessage = {
          id: message.id,
          content: message.content,
          createdAt: message.createdAt
        };
        conversation.lastMessageAt = message.createdAt;
        // Move conversation to top (most recent first)
        const index = chatStore.conversations.indexOf(conversation);
        if (index > 0) {
          chatStore.conversations.splice(index, 1);
          chatStore.conversations.unshift(conversation);
        }
      }
      
      // Add message if this is the active conversation
      if (chatStore.activeConversation?.id === message.conversationId) {
        chatStore.addMessage(message);
        
        if (message.receiverId === user.id) {
          chatStore.markAsRead([message.id]);
        }
      }
    });

    socketService.on('message_delivered', (data) => {
      chatStore.updateMessageStatus(data.messageId, 'delivered');
    });

    socketService.on('messages_read', (data) => {
      data.messageIds.forEach(messageId => {
        chatStore.updateMessageStatus(messageId, 'read');
      });
    });

    socketService.on('user_typing', (data) => {
      if (chatStore.activeConversation?.id === data.conversationId) {
        chatStore.setTypingUser(data.userId, data.conversationId, true);
      }
    });

    socketService.on('user_stopped_typing', (data) => {
      if (chatStore.activeConversation?.id === data.conversationId) {
        chatStore.setTypingUser(data.userId, data.conversationId, false);
      }
    });

    socketService.on('user_online', (data) => {
      chatStore.setUserOnline(data.userId, true);
      // Update online status in conversations list
      chatStore.conversations.forEach(conv => {
        if (conv.participant.id === data.userId) {
          conv.participant.isOnline = true;
        }
      });
      // Update active conversation if it's the same user
      if (chatStore.activeConversation?.participant.id === data.userId) {
        chatStore.activeConversation.participant.isOnline = true;
      }
    });

    socketService.on('user_offline', (data) => {
      chatStore.setUserOnline(data.userId, false);
      // Update offline status in conversations list
      chatStore.conversations.forEach(conv => {
        if (conv.participant.id === data.userId) {
          conv.participant.isOnline = false;
          if (data.lastSeen) {
            conv.participant.lastSeen = data.lastSeen;
          }
        }
      });
      // Update active conversation if it's the same user
      if (chatStore.activeConversation?.participant.id === data.userId) {
        chatStore.activeConversation.participant.isOnline = false;
        if (data.lastSeen) {
          chatStore.activeConversation.participant.lastSeen = data.lastSeen;
        }
      }
    });

    socketService.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socketService.on('connect', async () => {
      isConnected.value = true;
      reconnectAttempts.value = 0;
      // Refresh conversations to get updated online status
      try {
        await chatStore.fetchConversations();
        // Restore active conversation after refresh
        await chatStore.restoreActiveConversation();
      } catch (error) {
        console.error('Error refreshing conversations on connect:', error);
      }
    });

    socketService.on('disconnect', () => {
      isConnected.value = false;
    });
  };

  return {
    isConnected,
    reconnectAttempts,
    setupSocketListeners
  };
});

