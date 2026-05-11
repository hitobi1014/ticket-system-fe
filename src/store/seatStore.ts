import type { Floor } from '@/types';
import { create } from 'zustand/react';

interface SeatStore {
  floors: Floor[];
  addSeat: () => void;
}

const useSeatStore = create<SeatStore>((set) => ({
  floors: [],
  addSeat: () =>
    set((state) => ({
      ...state,
    })),
}));

export default useSeatStore;
