<template>
  <div class="h-screen flex">
    <!-- Sidebar -->
    <div class="w-80 border-r border-gray-200 flex flex-col bg-white">
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-xl font-bold text-gray-900">Chats</h1>
          <button
            @click="authStore.logout"
            class="text-sm text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
        <UserSearch />
      </div>
      <ConversationList />
    </div>

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col">
      <div v-if="!chatStore.activeConversation" class="flex-1 flex items-center justify-center bg-gray-50">
        <div class="text-center">
          <p class="text-lg font-medium text-gray-900">Select a conversation</p>
          <p class="text-sm text-gray-500 mt-2">Choose a conversation from the sidebar or search for a user</p>
        </div>
      </div>
      <ChatWindow v-else />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { useSocketStore } from '@/stores/socketStore';
import ChatWindow from '@/components/chat/ChatWindow.vue';
import ConversationList from '@/components/common/ConversationList.vue';
import UserSearch from '@/components/common/UserSearch.vue';

const authStore = useAuthStore();
const chatStore = useChatStore();
const socketStore = useSocketStore();

onMounted(async () => {
  authStore.init();
  socketStore.setupSocketListeners();
  
  if (authStore.isAuthenticated) {
    // First restore conversation if it exists (will fetch if needed)
    const savedConversationId = localStorage.getItem('activeConversationId');
    if (savedConversationId) {
      // Try to restore first, it will fetch conversations if needed
      await chatStore.restoreActiveConversation();
    } else {
      // Only fetch if no saved conversation
      await chatStore.fetchConversations();
    }
  }
});

onUnmounted(() => {
  chatStore.reset();
});
</script>

