<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './stores/authStore';
import { useSocketStore } from './stores/socketStore';

const authStore = useAuthStore();
const socketStore = useSocketStore();

onMounted(() => {
  authStore.init();
  socketStore.setupSocketListeners();
});
</script>

