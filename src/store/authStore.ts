import { create } from 'zustand/react';
import { persist } from 'zustand/middleware';
import type { LoginRequest, LoginResponse, NonValidateMember } from '@/types';
import fetchApi from '@/lib/api';

interface AuthLoadingState {
  fetch: boolean;
  login: boolean;
}

interface AuthStore {
  token: string | null;
  isLoading: AuthLoadingState;
  isAuthenticated: boolean;
  login: (req: LoginRequest) => Promise<void>;
  logout: () => void;

  nonValidateMembers: NonValidateMember[];
  getMembers: () => Promise<void>;
}

const AUTH_API_PREFIX = '/auth';

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isLoading: {
        fetch: false,
        login: false,
      },
      nonValidateMembers: [],
      token: null,
      isAuthenticated: false,
      login: async (req) => {
        set((state) => ({ isLoading: { ...state.isLoading, login: true } }));
        try {
          const { accessToken } = await fetchApi<LoginResponse>(`${AUTH_API_PREFIX}/login`, {
            method: 'POST',
            body: JSON.stringify(req),
          });
          set({ token: accessToken, isAuthenticated: true });
        } finally {
          set((state) => ({ isLoading: { ...state.isLoading, login: false } }));
        }
      },
      logout: () => {
        set({ token: null, isAuthenticated: false });
      },
      getMembers: async () => {
        set((state) => ({ isLoading: { ...state.isLoading, fetch: true } }));

        try {
          const nonValidateMembers = await fetchApi<NonValidateMember[]>(
            `${AUTH_API_PREFIX}/members`,
          );
          set({ nonValidateMembers });
        } finally {
          set((state) => ({ isLoading: { ...state.isLoading, fetch: false } }));
        }
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
