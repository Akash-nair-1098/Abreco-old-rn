import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore'; // Import this to clear cart too

const api = axios.create({
  baseURL: 'https://api.horecahub.ae/store/api/',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST Middleware
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
  response => response,
  error => {
    const { response } = error;
console.log(
  `✅ [API Response] ${response.status} ${response.config.url}`,
  '\nData: ' + JSON.stringify(response.data, null, 2),
);
    // Check if status is 401 AND the error code matches your specific response
    if (
      response?.status === 401 ||
      response?.data?.code === 'token_not_valid'
    ) {
      console.log('Session expired or invalid token. Logging out...');

      // 1. Clear Auth State
      useAuthStore.getState().logout();

      // 2. Highly Recommended: Clear the Cart state so the next user doesn't see old items
    //   if (useCartStore.getState().clearEntireCart) {
    //     useCartStore.getState().clearEntireCart();
    //   }
    }
    return Promise.reject(error);
  },
);

export default api;
