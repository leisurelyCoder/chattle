<template>
  <div class="relative">
    <input
      v-model="searchQuery"
      @input="handleSearch"
      type="text"
      placeholder="Search users..."
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
    
    <div v-if="searchResults.length > 0 || isSearching" class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
      <div v-if="isSearching" class="p-4 text-center text-gray-500">
        Searching...
      </div>
      <div
        v-for="user in searchResults"
        :key="user.id"
        @click="selectUser(user)"
        class="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center space-x-3"
      >
        <div class="relative">
          <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {{ user.username.charAt(0).toUpperCase() }}
          </div>
          <div 
            v-if="user.isOnline"
            class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
          ></div>
        </div>
        <div class="flex-1">
          <h3 class="text-sm font-semibold text-gray-900">{{ user.username }}</h3>
          <p class="text-xs text-gray-500">{{ user.email }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
// Simple debounce implementation
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
import api from '@/services/api.js';
import { useChatStore } from '@/stores/chatStore';
import socketService from '@/services/socketService.js';

const chatStore = useChatStore();

const searchQuery = ref('');
const searchResults = ref([]);
const isSearching = ref(false);
const allUsers = ref([]);

const handleSearch = debounce(() => {
  const query = searchQuery.value.trim();
  
  if (query.length === 0) {
    searchResults.value = [];
    return;
  }

  // Use local filtering from allUsers for instant results
  filterSearchResults();
  
  // Also do API search for more comprehensive results
  isSearching.value = true;
  api.get('/users/search', {
    params: { q: query }
  }).then(response => {
    // Merge API results with local results, avoiding duplicates
    const apiResults = response.data;
    const localResults = searchResults.value;
    const merged = [...localResults];
    
    apiResults.forEach(apiUser => {
      if (!merged.find(u => u.id === apiUser.id)) {
        merged.push(apiUser);
      }
    });
    
    searchResults.value = merged;
  }).catch(error => {
    console.error('Error searching users:', error);
  }).finally(() => {
    isSearching.value = false;
  });
}, 300);

const selectUser = async (user) => {
  searchQuery.value = '';
  searchResults.value = [];
  await chatStore.createOrSelectConversation(user.id);
};

const fetchAllUsers = async () => {
  try {
    const response = await api.get('/users/all');
    allUsers.value = response.data;
    // Update search results if search is active
    if (searchQuery.value.trim().length > 0) {
      filterSearchResults();
    }
  } catch (error) {
    console.error('Error fetching all users:', error);
  }
};

const filterSearchResults = () => {
  const query = searchQuery.value.trim().toLowerCase();
  if (query.length === 0) {
    searchResults.value = [];
    return;
  }
  searchResults.value = allUsers.value.filter(user =>
    user.username.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  );
};

const handleUserOnline = (data) => {
  // Update user in allUsers list
  const userIndex = allUsers.value.findIndex(u => u.id === data.userId);
  if (userIndex >= 0) {
    allUsers.value[userIndex].isOnline = true;
  } else {
    // New user came online, fetch all users to get the new user
    fetchAllUsers();
  }
  // Update search results if search is active
  if (searchQuery.value.trim().length > 0) {
    filterSearchResults();
  }
};

const handleUserOffline = (data) => {
  const userIndex = allUsers.value.findIndex(u => u.id === data.userId);
  if (userIndex >= 0) {
    allUsers.value[userIndex].isOnline = false;
  }
  // Update search results if search is active
  if (searchQuery.value.trim().length > 0) {
    filterSearchResults();
  }
};

onMounted(async () => {
  await fetchAllUsers();
  // Listen for user online/offline events
  socketService.on('user_online', handleUserOnline);
  socketService.on('user_offline', handleUserOffline);
});

onUnmounted(() => {
  socketService.off('user_online', handleUserOnline);
  socketService.off('user_offline', handleUserOffline);
});
</script>

