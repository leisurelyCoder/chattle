<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- Header -->
    <div v-if="activeConversation" class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="relative">
          <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {{ activeConversation.participant.username.charAt(0).toUpperCase() }}
          </div>
          <div v-if="isOnline" class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div>
          <h3 class="font-semibold text-gray-900">{{ activeConversation.participant.username }}</h3>
          <p class="text-xs text-gray-500">
            <span v-if="isOnline">Online</span>
            <span v-else>Offline</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div 
      ref="messagesContainer" 
      class="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      @scroll="handleScroll"
    >
      <div v-if="hasMoreMessages && !isLoading" class="text-center">
        <button 
          @click="loadMoreMessages" 
          class="text-blue-500 text-sm hover:text-blue-600"
        >
          Load older messages
        </button>
      </div>

      <div v-for="message in messages" :key="message.id" class="flex" :class="isOwnMessage(message) ? 'justify-end' : 'justify-start'">
        <MessageBubble :message="message" :is-own="isOwnMessage(message)" />
      </div>

      <TypingIndicator v-if="typingUsers.size > 0" :users="Array.from(typingUsers.values())" />
    </div>

    <!-- Input -->
    <MessageInput 
      v-if="activeConversation"
      @send="handleSendMessage"
      @typing-start="handleTypingStart"
      @typing-stop="handleTypingStop"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import MessageBubble from './MessageBubble.vue';
import MessageInput from './MessageInput.vue';
import TypingIndicator from './TypingIndicator.vue';
import socketService from '@/services/socketService.js';

const chatStore = useChatStore();
const authStore = useAuthStore();

const messagesContainer = ref(null);
const shouldAutoScroll = ref(true);
const isLoading = ref(false);

const activeConversation = computed(() => chatStore.activeConversation);
const messages = computed(() => chatStore.messages);
const typingUsers = computed(() => {
  if (!activeConversation.value) return new Map();
  const filtered = new Map();
  chatStore.typingUsers.forEach((value, key) => {
    if (key.startsWith(`${activeConversation.value.id}-`)) {
      filtered.set(key, value);
    }
  });
  return filtered;
});

const isOnline = computed(() => {
  if (!activeConversation.value) return false;
  const participantId = activeConversation.value.participant.id;
  // Check both onlineUsers Set and participant's isOnline property
  return chatStore.onlineUsers.has(participantId) || 
         activeConversation.value.participant.isOnline === true;
});

const hasMoreMessages = computed(() => chatStore.hasMoreMessages);

const isOwnMessage = (message) => {
  return message.senderId === authStore.user?.id;
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value && shouldAutoScroll.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const handleScroll = () => {
  if (!messagesContainer.value) return;
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value;
  shouldAutoScroll.value = scrollHeight - scrollTop - clientHeight < 100;
};

const loadMoreMessages = async () => {
  if (isLoading.value || !hasMoreMessages.value || !activeConversation.value) return;
  
  isLoading.value = true;
  const currentScrollHeight = messagesContainer.value?.scrollHeight || 0;
  
  try {
    await chatStore.fetchMessages(activeConversation.value.id, chatStore.currentPage + 1);
    
    nextTick(() => {
      if (messagesContainer.value) {
        const newScrollHeight = messagesContainer.value.scrollHeight;
        messagesContainer.value.scrollTop = newScrollHeight - currentScrollHeight;
      }
    });
  } catch (error) {
    console.error('Error loading more messages:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleSendMessage = async (content) => {
  try {
    await chatStore.sendMessage(content);
    scrollToBottom();
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

const handleTypingStart = () => {
  if (activeConversation.value) {
    socketService.emit('typing_start', { conversationId: activeConversation.value.id });
  }
};

const handleTypingStop = () => {
  if (activeConversation.value) {
    socketService.emit('typing_stop', { conversationId: activeConversation.value.id });
  }
};

watch(messages, (newMessages) => {
  // Scroll when messages change
  if (newMessages.length > 0) {
    // Small delay to ensure DOM is updated
    setTimeout(() => {
      scrollToBottom();
    }, 150);
  }
  
  // Mark messages as read when viewing them
  if (activeConversation.value && newMessages.length > 0) {
    const unreadMessages = newMessages.filter(msg => 
      msg.receiverId === authStore.user?.id && 
      msg.deliveryStatus !== 'read'
    );
    if (unreadMessages.length > 0) {
      chatStore.markAsRead(unreadMessages.map(m => m.id));
    }
  }
}, { deep: true, immediate: true });

watch(activeConversation, async (newConv, oldConv) => {
  if (newConv && newConv.id !== oldConv?.id) {
    shouldAutoScroll.value = true;
    // Wait for messages to load
    await nextTick();
    // Wait a bit more for messages to be fetched and rendered
    setTimeout(() => {
      scrollToBottom();
      // Mark messages as read when conversation is selected
      if (activeConversation.value && messages.value.length > 0) {
        const unreadMessages = messages.value.filter(msg => 
          msg.receiverId === authStore.user?.id && 
          msg.deliveryStatus !== 'read'
        );
        if (unreadMessages.length > 0) {
          chatStore.markAsRead(unreadMessages.map(m => m.id));
        }
      }
    }, 500);
  }
});

onMounted(() => {
  scrollToBottom();
  // Mark messages as read on mount
  if (activeConversation.value && messages.value.length > 0) {
    const unreadMessages = messages.value.filter(msg => 
      msg.receiverId === authStore.user?.id && 
      msg.deliveryStatus !== 'read'
    );
    if (unreadMessages.length > 0) {
      chatStore.markAsRead(unreadMessages.map(m => m.id));
    }
  }
});
</script>

