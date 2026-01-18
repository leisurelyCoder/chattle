<template>
  <div class="bg-white border-t border-gray-200 px-4 py-3">
    <div class="flex items-end space-x-2">
      <textarea
        ref="textareaRef"
        v-model="message"
        @input="handleInput"
        @keydown="handleKeyDown"
        @focus="handleFocus"
        @blur="handleBlur"
        placeholder="Type a message..."
        rows="1"
        class="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        :class="message.length > 4500 ? 'border-red-300' : ''"
      ></textarea>
      <button
        @click="handleSend"
        :disabled="!canSend"
        class="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Send
      </button>
    </div>
    <div v-if="message.length > 0" class="text-xs text-gray-500 mt-1">
      {{ message.length }} / 5000 characters
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';

const emit = defineEmits(['send', 'typing-start', 'typing-stop']);

const message = ref('');
const textareaRef = ref(null);
const typingTimer = ref(null);
const isTyping = ref(false);

const canSend = computed(() => {
  return message.value.trim().length > 0 && message.value.length <= 5000;
});

const adjustTextareaHeight = () => {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto';
      textareaRef.value.style.height = `${Math.min(textareaRef.value.scrollHeight, 120)}px`;
    }
  });
};

const handleInput = () => {
  adjustTextareaHeight();
  
  if (!isTyping.value) {
    isTyping.value = true;
    emit('typing-start');
  }

  if (typingTimer.value) {
    clearTimeout(typingTimer.value);
  }

  typingTimer.value = setTimeout(() => {
    isTyping.value = false;
    emit('typing-stop');
  }, 1000);
};

const handleKeyDown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    if (canSend.value) {
      handleSend();
    }
  }
};

const handleFocus = () => {
  if (message.value.trim().length > 0 && !isTyping.value) {
    isTyping.value = true;
    emit('typing-start');
  }
};

const handleBlur = () => {
  if (typingTimer.value) {
    clearTimeout(typingTimer.value);
  }
  isTyping.value = false;
  emit('typing-stop');
};

const handleSend = () => {
  if (!canSend.value) return;

  const content = message.value.trim();
  message.value = '';
  adjustTextareaHeight();
  
  if (isTyping.value) {
    isTyping.value = false;
    emit('typing-stop');
  }

  if (typingTimer.value) {
    clearTimeout(typingTimer.value);
  }

  emit('send', content);
};

watch(message, () => {
  adjustTextareaHeight();
});
</script>

