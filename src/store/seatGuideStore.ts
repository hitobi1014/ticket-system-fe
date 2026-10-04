import type { Floor } from '@/types';
import { create } from 'zustand/react';
import { devtools } from 'zustand/middleware';
import fetchApi from '@/lib/api.ts';

export type DisplayMode = 'member' | 'guest';

interface SeatGuideStore {
  floors: Floor[];
  displayMode: DisplayMode;
  isLoading: boolean;

  fetchFloors: () => Promise<void>;
  setDisplayMode: (mode: DisplayMode) => void;
  clearStore: () => void;
}

const FLOOR_GUIDE_API_PREFIX = '/floors/guide';

const useSeatGuideStore = create<SeatGuideStore>()(
  devtools((set) => ({
    floors: [],
    displayMode: 'member',
    isLoading: false,

    fetchFloors: async () => {
      set({ isLoading: true });
      try {
        const floors = await fetchApi<Floor[]>(FLOOR_GUIDE_API_PREFIX);
        set({ floors });
      } catch (error) {
        console.error('Failed to fetch seat guide floors:', error);
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    setDisplayMode: (mode: DisplayMode) => {
      set({ displayMode: mode });
    },

    clearStore: () => {
      set({ floors: [], displayMode: 'member', isLoading: false });
    },
  })),
);

export default useSeatGuideStore;
