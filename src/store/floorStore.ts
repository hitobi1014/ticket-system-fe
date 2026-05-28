import type { CreateFloorRequest, CreateSectionRequest, Floor, Section } from '@/types';
import { create } from 'zustand/react';

interface FloorStore {
  floors: Floor[];
  addFloor: (req: CreateFloorRequest) => void;
  removeFloor: (id: number) => void;

  addSection: (floorId: number, req: CreateSectionRequest) => void;
  removeSection: (sectionId: number) => void;
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

  addSection: (floorId, req) =>
    set((state) => ({
      floors: state.floors.map((f) => {
        if (f.id !== floorId) return f;

        const newSection: Section = {
          kind: 'section',
          ...req,
          rows: [],
        };

        return { ...f, items: [...f.items, newSection] };
      }),
    })),

  removeSection: (sectionId) =>
    set((state) => {
      return {
        floors: state.floors.map((f) => ({
          ...f,
          items: f.items.filter((item) => item.id !== sectionId),
        })),
      };
    }),
}));

export default useFloorStore;
