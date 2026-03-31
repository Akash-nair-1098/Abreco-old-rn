import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';

const api = axios.create({
  baseURL: 'https://api.horecahub.ae/store/api/',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST Middleware - Stays exactly as you like it
api.interceptors.request.use(
  async config => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(
      `🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`,
      config.data ? '\nPayload: ' + JSON.stringify(config.data, null, 2) : '',
    );
    return config;
  },
  error => Promise.reject(error),
);

// RESPONSE Middleware
api.interceptors.response.use(
  response => {
    // Print successful response
    console.log(
      `✅ [API Response Success] ${response.status} ${response.config.url}`,
      '\nData: '
    );
    return response;
  },
  error => {
    const response = error?.response;

    // SAFE PRINTING: This replaces the line that was causing the crash
    if (response) {
      console.log(
        `❌ [API Response Error] ${response.status} ${response.config?.url}`,
        '\nData: '
      );
    } else {
      // Log errors that don't have a response (Network/Timeout)
      console.log(`🌐 [API Network/Timeout Error] ${error.message}`);
    }

    // Auth & Token logic
    if (
      response?.status === 401 ||
      response?.data?.code === 'token_not_valid'
    ) {
      console.log('Session expired or invalid token. Logging out...');
      useAuthStore.getState().logout();

      // Clear the Cart safely
      const clearCart = useCartStore.getState().clearEntireCart;
      if (typeof clearCart === 'function') {
        clearCart();
      }
    }

    // Return the data if it exists, otherwise the error itself
    return Promise.reject(response ? response.data : error);
  },
);

export default api;