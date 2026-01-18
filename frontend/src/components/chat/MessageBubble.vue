<template>
  <div class="flex flex-col max-w-xs lg:max-w-md" :class="isOwn ? 'items-end' : 'items-start'">
    <div 
      class="px-4 py-2 rounded-lg shadow-sm"
      :class="isOwn 
        ? 'bg-blue-500 text-white rounded-br-none' 
        : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'"
    >
      <p class="text-sm whitespace-pre-wrap break-words">{{ message.content }}</p>
    </div>
    <div class="flex items-center space-x-1 mt-1 px-1" :class="isOwn ? 'flex-row-reverse space-x-reverse' : ''">
      <span class="text-xs text-gray-500">{{ formatTime(message.createdAt) }}</span>
      <span v-if="isOwn" class="text-xs">
        <svg v-if="message.deliveryStatus === 'sent'" class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
        </svg>
        <svg v-else-if="message.deliveryStatus === 'delivered'" class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
        </svg>
        <svg v-else-if="message.deliveryStatus === 'read'" class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
          <path d="M15.707 7.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L9 12.586l5.293-5.293a1 1 0 011.414 0z"/>
        </svg>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { formatDistanceToNow } from 'date-fns';

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  isOwn: {
    type: Boolean,
    default: false
  }
});

const currentTime = ref(new Date());

const formatTime = (dateString) => {
  try {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const diffInHours = (currentTime.value - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  } catch (error) {
    return '';
  }
};

// Update time every minute to refresh timestamps
let timeInterval = null;

onMounted(() => {
  timeInterval = setInterval(() => {
    currentTime.value = new Date();
  }, 60000); // Update every minute
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>

