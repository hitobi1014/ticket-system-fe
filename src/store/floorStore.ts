import type { CreateFloorRequest, Floor } from '@/types';
import { create } from 'zustand/react';

interface FloorStore {
  floors: Floor[];
  addFloor: (req: CreateFloorRequest) => void;
  removeFloor: (id: number) => void;
}

const useFloorStore = create<FloorStore>((set) => ({
  floors: [],

  addFloor: (req) =>
    set((state) => {
      return {
        floors: [...state.floors, { ...req, items: [] }],
      };
    }),

  removeFloor: (id) =>
    set((state) => {
      return {
        floors: state.floors.filter((f) => f.id !== id),
      };
    }),
}));

export default useFloorStore;
