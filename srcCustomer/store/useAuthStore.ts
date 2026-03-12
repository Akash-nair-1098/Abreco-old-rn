import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';


interface AuthState {
  refreshToken: string | null;
  accessToken: string | null;
  isAuthenticated: boolean ;
  hasPasswordChanged: boolean;
  setAuth: (refreshToken: string, token: string, hasPasswordChanged: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      hasPasswordChanged: false,

      // Action to log in
      setAuth: (refreshToken, accessToken, hasPasswordChanged) =>
        set({ refreshToken, accessToken, isAuthenticated: true, hasPasswordChanged }),

      // Action to log out
      logout: () =>
        set({ refreshToken: null, accessToken: null, isAuthenticated: false, hasPasswordChanged: false }),
    }),
    {
      name: 'auth-storage', // unique name for storage
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
