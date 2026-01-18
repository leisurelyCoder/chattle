import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api.js';
import socketService from '../services/socketService.js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const accessToken = ref(localStorage.getItem('accessToken') || null);
  const isLoading = ref(false);

  const isAuthenticated = computed(() => !!user.value && !!accessToken.value);

  const init = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }

    if (accessToken.value && user.value) {
      socketService.connect(accessToken.value);
    }
  };

  const register = async (username, email, password) => {
    isLoading.value = true;
    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password
      });

      const { user: userData, accessToken: token } = response.data;
      user.value = userData;
      accessToken.value = token;
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('accessToken', token);

      socketService.connect(token);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Registration failed'
      };
    } finally {
      isLoading.value = false;
    }
  };

  const login = async (email, password) => {
    isLoading.value = true;
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      const { user: userData, accessToken: token } = response.data;
      user.value = userData;
      accessToken.value = token;
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('accessToken', token);

      socketService.connect(token);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Login failed'
      };
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      user.value = null;
      accessToken.value = null;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      socketService.disconnect();
    }
  };

  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh');
      const { accessToken: token } = response.data;
      accessToken.value = token;
      localStorage.setItem('accessToken', token);
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  return {
    user,
    accessToken,
    isLoading,
    isAuthenticated,
    init,
    register,
    login,
    logout,
    refreshToken
  };
});

