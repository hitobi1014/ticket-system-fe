import type {
  CreateFloorRequest,
  CreateRowsRequest,
  CreateSectionRequest,
  Floor,
  Section,
} from '@/types';

import { create } from 'zustand/react';
import { devtools } from 'zustand/middleware';

interface FloorStore {
  floors: Floor[];
  addFloor: (req: CreateFloorRequest) => void;
  removeFloor: (id: number) => void;

  addSection: (floorId: number, req: CreateSectionRequest) => void;
  removeSection: (sectionId: number) => void;

  addRow: (sectionId: number, req: CreateRowsRequest) => void;
  removeRow: (rowId: number) => void;
}

const useFloorStore = create<FloorStore>()(
  devtools((set) => ({
    floors: [],
    addFloor: (req) =>
      set(
        (state) => ({
          floors: [...state.floors, { ...req, items: [] }],
        }),
        undefined,
        'addFloor',
      ),

    removeFloor: (id) =>
      set(
        (state) => {
          return {
            floors: state.floors.filter((f) => f.id !== id),
          };
        },
        undefined,
        'removeFloor',
      ),

    addSection: (floorId, req) =>
      set(
        (state) => ({
          floors: state.floors.map((f) => {
            if (f.id !== floorId) return f;

            const newSection: Section = {
              kind: 'section',
              ...req,
              rows: [],
            };

            return { ...f, items: [...f.items, newSection] };
          }),
        }),
        undefined,
        'addSection',
      ),

    removeSection: (sectionId) =>
      set(
        (state) => {
          return {
            floors: state.floors.map((f) => ({
              ...f,
              items: f.items.filter((item) => item.id !== sectionId),
            })),
          };
        },
        undefined,
        'removeSection',
      ),

    addRow: (sectionId, req) =>
      set(
        (state) => ({
          floors: state.floors.map((f) => ({
            ...f,
            // TODO 개선 필요 => filter로 section과 id 비교?, id만 비교 후 section타입으로 가져오는 방법?
            items: f.items.map((item) => {
              if (item.kind !== 'section' || item.id !== sectionId) return item;
              return {
                ...item,
                rows: [...item.rows, { ...req, seats: [] }],
              };
            }),
          })),
        }),
        undefined,
        'addRow',
      ),

    removeRow: (rowId) =>
      set(
        (state) => ({
          floors: state.floors.map((f) => ({
            ...f,
            items: f.items.map((item) => {
              if (item.kind !== 'section') return item;
              return {
                ...item,
                rows: item.rows.filter((row) => row.id !== rowId),
              };
            }),
          })),
        }),
        undefined,
        'removeRow',
      ),
  })),
);

export default useFloorStore;
