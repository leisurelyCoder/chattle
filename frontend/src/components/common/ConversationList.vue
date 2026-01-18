<template>
  <div class="h-full overflow-y-auto bg-white">
    <div v-if="isLoading" class="p-4">
      <div class="animate-pulse space-y-4">
        <div v-for="i in 5" :key="i" class="h-16 bg-gray-200 rounded"></div>
      </div>
    </div>
    
    <div v-else-if="conversations.length === 0" class="flex items-center justify-center h-full text-gray-500">
      <div class="text-center">
        <p class="text-lg font-medium">No conversations yet</p>
        <p class="text-sm mt-2">Start a new conversation to begin chatting</p>
      </div>
    </div>

    <div v-else class="divide-y divide-gray-200">
      <div
        v-for="conversation in conversations"
        :key="conversation.id"
        @click="selectConversation(conversation.id)"
        class="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
        :class="{ 'bg-blue-50': isActive(conversation.id) }"
      >
        <div class="flex items-center space-x-3">
          <div class="relative">
            <div class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {{ conversation.participant.username.charAt(0).toUpperCase() }}
            </div>
            <div 
              v-if="isUserOnline(conversation.participant.id)"
              class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
            ></div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-gray-900 truncate">
                {{ conversation.participant.username }}
              </h3>
              <span v-if="conversation.lastMessageAt" class="text-xs text-gray-500">
                {{ formatTime(conversation.lastMessageAt) }}
              </span>
            </div>
            <p v-if="conversation.lastMessage" class="text-sm text-gray-600 truncate mt-1">
              {{ conversation.lastMessage.content }}
            </p>
            <p v-else class="text-sm text-gray-400 italic mt-1">No messages yet</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import { formatDistanceToNow } from 'date-fns';

const chatStore = useChatStore();

const conversations = computed(() => chatStore.conversations);
const isLoading = computed(() => chatStore.isLoading);
const activeConversation = computed(() => chatStore.activeConversation);

const isActive = (conversationId) => {
  return activeConversation.value?.id === conversationId;
};

const isUserOnline = (userId) => {
  // Check both the onlineUsers Set and the participant's isOnline property
  const conversation = conversations.value.find(c => c.participant.id === userId);
  return chatStore.onlineUsers.has(userId) || conversation?.participant?.isOnline === true;
};

const selectConversation = (conversationId) => {
  chatStore.selectConversation(conversationId);
};

const formatTime = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  } catch (error) {
    return '';
  }
};
</script>

