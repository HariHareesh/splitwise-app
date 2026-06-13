import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_BASE_URL } from '../constants/api';

interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string;
  expo_push_token: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  setTokens: (access: string, refresh: string) => void;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,

  setUser: (user) => set({ user }),

  setTokens: async (access, refresh) => {
    set({ accessToken: access, refreshToken: refresh });
    await SecureStore.setItemAsync('access_token', access);
    await SecureStore.setItemAsync('refresh_token', refresh);
  },

  logout: async () => {
    try {
      const { refreshToken } = get();
      if (refreshToken) {
        await axios.post(`${API_BASE_URL}/auth/logout/`, { refresh: refreshToken });
      }
    } catch {}
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    set({ user: null, accessToken: null, refreshToken: null });
  },

  loadFromStorage: async () => {
    try {
      const access = await SecureStore.getItemAsync('access_token');
      const refresh = await SecureStore.getItemAsync('refresh_token');
      if (access && refresh) {
        set({ accessToken: access, refreshToken: refresh });
        const res = await axios.get(`${API_BASE_URL}/users/me/`, {
          headers: { Authorization: `Bearer ${access}` }
        });
        set({ user: res.data });
      }
    } catch {
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
    } finally {
      set({ isLoading: false });
    }
  },
}));