import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api.js';
import socketService from '../services/socketService.js';

export const useChatStore = defineStore('chat', () => {
  const conversations = ref([]);
  const activeConversation = ref(null);
  const messages = ref([]);
  const typingUsers = ref(new Map());
  const onlineUsers = ref(new Set());
  const isLoading = ref(false);
  const hasMoreMessages = ref(false);
  const currentPage = ref(1);

  const getConversationById = computed(() => {
    return (id) => conversations.value.find(conv => conv.id === id);
  });

  const getMessagesByConversation = computed(() => {
    return (conversationId) => {
      if (!activeConversation.value || activeConversation.value.id !== conversationId) {
        return [];
      }
      return messages.value;
    };
  });

  const getUnreadCount = computed(() => {
    return (conversationId) => {
      const conversation = conversations.value.find(c => c.id === conversationId);
      return conversation?.unreadCount || 0;
    };
  });

  const fetchConversations = async () => {
    try {
      isLoading.value = true;
      const response = await api.get('/conversations');
      // Sort conversations by lastMessageAt (most recent first)
      const sortedConversations = (response.data || []).sort((a, b) => {
        const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return timeB - timeA; // Descending order (newest first)
      });
      conversations.value = sortedConversations;
      
      // Populate onlineUsers set with users who are online
      conversations.value.forEach(conv => {
        if (conv.participant.isOnline === true) {
          onlineUsers.value.add(conv.participant.id);
        }
      });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const selectConversation = async (conversationId) => {
    try {
      // Clear messages first to show loading state
      messages.value = [];
      currentPage.value = 1;
      
      const conversation = conversations.value.find(c => c.id === conversationId);
      if (!conversation) {
        await fetchConversations();
      }

      // Set active conversation
      activeConversation.value = conversations.value.find(c => c.id === conversationId);

      if (activeConversation.value) {
        // Persist active conversation to localStorage
        localStorage.setItem('activeConversationId', conversationId);
        socketService.emit('join_conversation', { conversationId });
        
        // Fetch messages - this will populate messages.value
        await fetchMessages(conversationId, 1);
      } else {
        console.warn('Conversation not found:', conversationId);
      }
    } catch (error) {
      console.error('Error selecting conversation:', error);
      // Even if there's an error, try to show the conversation if it exists
      if (conversationId) {
        const conv = conversations.value.find(c => c.id === conversationId);
        if (conv) {
          activeConversation.value = conv;
        }
      }
    }
  };

  const fetchMessages = async (conversationId, page = 1) => {
    try {
      const response = await api.get(`/conversations/${conversationId}/messages`, {
        params: { page, limit: 50 }
      });

      if (response.data && response.data.messages) {
        // Ensure messages are properly formatted - handle both camelCase and snake_case
        const formattedMessages = response.data.messages.map(msg => ({
          id: msg.id,
          conversationId: msg.conversationId || msg.conversation_id,
          senderId: msg.senderId || msg.sender_id,
          receiverId: msg.receiverId || msg.receiver_id,
          content: msg.content,
          deliveryStatus: msg.deliveryStatus || msg.delivery_status || 'sent',
          createdAt: msg.createdAt || msg.created_at || new Date().toISOString(),
          isOptimistic: false
        })).filter(msg => msg.id); // Filter out any invalid messages

        if (page === 1) {
          messages.value = formattedMessages;
        } else {
          messages.value = [...formattedMessages, ...messages.value];
        }

        hasMoreMessages.value = response.data.pagination?.hasMore || false;
        currentPage.value = page;
      } else {
        console.warn('No messages in response:', response.data);
        if (page === 1) {
          messages.value = [];
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (page === 1) {
        messages.value = [];
      }
      throw error;
    }
  };

  const sendMessage = async (content) => {
    if (!activeConversation.value || !content.trim()) {
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      conversationId: activeConversation.value.id,
      senderId: JSON.parse(localStorage.getItem('user')).id,
      receiverId: activeConversation.value.participant.id,
      content: content.trim(),
      deliveryStatus: 'sent',
      createdAt: new Date().toISOString(),
      isOptimistic: true
    };

    messages.value.push(tempMessage);

    // Update conversation's last message in the list
    const conversation = conversations.value.find(c => c.id === activeConversation.value.id);
    if (conversation) {
      conversation.lastMessage = {
        id: tempId,
        content: content.trim(),
        createdAt: tempMessage.createdAt
      };
      conversation.lastMessageAt = tempMessage.createdAt;
      // Move conversation to top (most recent first)
      const index = conversations.value.indexOf(conversation);
      if (index > 0) {
        conversations.value.splice(index, 1);
        conversations.value.unshift(conversation);
      }
    }

    try {
      socketService.emit('send_message', {
        conversationId: activeConversation.value.id,
        content: content.trim()
      });
    } catch (error) {
      messages.value = messages.value.filter(m => m.id !== tempId);
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const addMessage = (message) => {
    if (!message || !message.id) {
      console.warn('Invalid message received:', message);
      return;
    }

    // Ensure message is properly formatted
    const formattedMessage = {
      id: message.id,
      conversationId: message.conversationId || message.conversation_id,
      senderId: message.senderId || message.sender_id,
      receiverId: message.receiverId || message.receiver_id,
      content: message.content || '',
      deliveryStatus: message.deliveryStatus || message.delivery_status || 'sent',
      createdAt: message.createdAt || message.created_at || new Date().toISOString(),
      isOptimistic: false
    };

    // Update conversation's last message if this is a new message
    const conversation = conversations.value.find(c => c.id === formattedMessage.conversationId);
    if (conversation) {
      // Only update if this message is newer than the current last message
      const currentLastMessageTime = conversation.lastMessageAt ? new Date(conversation.lastMessageAt).getTime() : 0;
      const newMessageTime = new Date(formattedMessage.createdAt).getTime();
      
      if (newMessageTime >= currentLastMessageTime) {
        conversation.lastMessage = {
          id: formattedMessage.id,
          content: formattedMessage.content,
          createdAt: formattedMessage.createdAt
        };
        conversation.lastMessageAt = formattedMessage.createdAt;
        // Move conversation to top (most recent first)
        const index = conversations.value.indexOf(conversation);
        if (index > 0) {
          conversations.value.splice(index, 1);
          conversations.value.unshift(conversation);
        }
      }
    }

    const existingIndex = messages.value.findIndex(m => m.id === formattedMessage.id);
    if (existingIndex >= 0) {
      // Update existing message, preserving better delivery status
      const existing = messages.value[existingIndex];
      const statusOrder = { sent: 0, delivered: 1, read: 2 };
      const existingOrder = statusOrder[existing.deliveryStatus] || 0;
      const newOrder = statusOrder[formattedMessage.deliveryStatus] || 0;
      messages.value[existingIndex] = { 
        ...formattedMessage, 
        // Keep better delivery status
        deliveryStatus: newOrder > existingOrder ? formattedMessage.deliveryStatus : existing.deliveryStatus
      };
    } else {
      const optimisticIndex = messages.value.findIndex(m => 
        m.isOptimistic && 
        m.content === formattedMessage.content &&
        Math.abs(new Date(m.createdAt).getTime() - new Date(formattedMessage.createdAt).getTime()) < 5000
      );
      if (optimisticIndex >= 0) {
        messages.value[optimisticIndex] = formattedMessage;
      } else {
        // Insert message in correct chronological order (oldest first)
        const insertIndex = messages.value.findIndex(m => 
          new Date(m.createdAt) > new Date(formattedMessage.createdAt)
        );
        if (insertIndex >= 0) {
          messages.value.splice(insertIndex, 0, formattedMessage);
        } else {
          messages.value.push(formattedMessage);
        }
      }
    }
  };

  const updateMessageStatus = (messageId, status) => {
    const message = messages.value.find(m => m.id === messageId);
    if (message) {
      // Only update to better status (sent < delivered < read)
      const statusOrder = { sent: 0, delivered: 1, read: 2 };
      const currentOrder = statusOrder[message.deliveryStatus] || 0;
      const newOrder = statusOrder[status] || 0;
      if (newOrder > currentOrder) {
        message.deliveryStatus = status;
      }
    }
  };

  const markAsRead = async (messageIds) => {
    if (!activeConversation.value || messageIds.length === 0) {
      return;
    }

    try {
      socketService.emit('mark_read', {
        conversationId: activeConversation.value.id,
        messageIds
      });

      messageIds.forEach(id => {
        updateMessageStatus(id, 'read');
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const setTypingUser = (userId, conversationId, isTyping) => {
    const key = `${conversationId}-${userId}`;
    if (isTyping) {
      typingUsers.value.set(key, { userId, conversationId, timestamp: Date.now() });
    } else {
      typingUsers.value.delete(key);
    }
  };

  const setUserOnline = (userId, isOnline) => {
    if (isOnline) {
      onlineUsers.value.add(userId);
    } else {
      onlineUsers.value.delete(userId);
    }
  };

  const createOrSelectConversation = async (participantId) => {
    try {
      const response = await api.post('/conversations', {
        participantId
      });

      const conversation = response.data;
      const existingIndex = conversations.value.findIndex(c => c.id === conversation.id);
      
      if (existingIndex >= 0) {
        // Update existing conversation
        conversations.value[existingIndex] = conversation;
        // Move to top if it has a last message
        if (conversation.lastMessageAt) {
          conversations.value.splice(existingIndex, 1);
          conversations.value.unshift(conversation);
        }
      } else {
        // Add new conversation to the top
        conversations.value.unshift(conversation);
        // Update online status
        if (conversation.participant.isOnline === true) {
          onlineUsers.value.add(conversation.participant.id);
        }
      }

      await selectConversation(conversation.id);
      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };

  const restoreActiveConversation = async () => {
    const savedConversationId = localStorage.getItem('activeConversationId');
    if (savedConversationId) {
      // Make sure conversations are loaded first
      if (conversations.value.length === 0) {
        await fetchConversations();
      }
      
      // Check if conversation exists in the list
      let conversation = conversations.value.find(c => c.id === savedConversationId);
      
      // If not found, try to fetch it directly
      if (!conversation) {
        try {
          const response = await api.get(`/conversations/${savedConversationId}`);
          conversation = response.data;
          // Add to conversations list if it exists
          if (conversation) {
            conversations.value.unshift(conversation);
          }
        } catch (error) {
          console.error('Error fetching saved conversation:', error);
          localStorage.removeItem('activeConversationId');
          return;
        }
      }
      
      if (conversation) {
        await selectConversation(savedConversationId);
      } else {
        localStorage.removeItem('activeConversationId');
      }
    }
  };

  const reset = () => {
    conversations.value = [];
    activeConversation.value = null;
    messages.value = [];
    typingUsers.value.clear();
    onlineUsers.value.clear();
    isLoading.value = false;
    hasMoreMessages.value = false;
    currentPage.value = 1;
    localStorage.removeItem('activeConversationId');
  };

  return {
    conversations,
    activeConversation,
    messages,
    typingUsers,
    onlineUsers,
    isLoading,
    hasMoreMessages,
    currentPage,
    getConversationById,
    getMessagesByConversation,
    getUnreadCount,
    fetchConversations,
    selectConversation,
    fetchMessages,
    sendMessage,
    addMessage,
    updateMessageStatus,
    markAsRead,
    setTypingUser,
    setUserOnline,
    createOrSelectConversation,
    restoreActiveConversation,
    reset
  };
});

