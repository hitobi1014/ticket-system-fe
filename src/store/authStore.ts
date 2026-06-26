import { create } from 'zustand/react';
import { persist } from 'zustand/middleware';
import type { LoginRequest, LoginResponse } from '@/types';
import fetchApi from '@/lib/api';

interface AuthStore {
  token: string | null;
  isAuthenticated: boolean;
  login: (req: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AUTH_API_PREFIX = '/auth';

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      login: async (req) => {
        const { accessToken } = await fetchApi<LoginResponse>(`${AUTH_API_PREFIX}/login`, {
          method: 'POST',
          body: JSON.stringify(req),
        });
        set({ token: accessToken, isAuthenticated: true });
      },
      logout: () => {
        set({ token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = !!state.token;
        }
      },
    },
  ),
);

export default useAuthStore;
