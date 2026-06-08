import type {
  Aisle,
  CreateAisleRequest,
  CreateFloorRequest,
  CreateRowsRequest,
  CreateSeatRequest,
  CreateSectionRequest,
  Floor,
  Section,
} from '@/types';

import { create } from 'zustand/react';
import { devtools } from 'zustand/middleware';
import { mockFloors } from '@/mocks/data.ts';

const useFloorStore = create<FloorStore>()(
  devtools((set, get) => ({
    // floors: [],
    floors: mockFloors,

    getTotalSeatCount: () =>
      get()
        .floors.flatMap((f) => f.items)
        .filter((item): item is Section => item.kind === 'section')
        .flatMap((s) => s.rows)
        .flatMap((r) => r.seats).length,

    // 총 좌석 - 회원 할당된 좌석
    getRemainSeatCount: () => {
      const totalSeatCount = get().getTotalSeatCount();
      const assignSeatCount = get()
        .floors.flatMap((f) => f.items)
        .filter((item): item is Section => item.kind === 'section')
        .flatMap((s) => s.rows)
        .flatMap((r) => r.seats)
        .filter((seat) => seat.assignedMemberId !== null).length;

      return totalSeatCount - assignSeatCount;
    },

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

    addAisle: (floorId, req) =>
      set(
        (state) => ({
          floors: state.floors.map((f) => {
            if (f.id !== floorId) return f;

            const newAisle: Aisle = {
              ...req,
            };

            return { ...f, items: [...f.items, newAisle] };
          }),
        }),
        undefined,
        'addAisle',
      ),

    removeAisle: (aisleId: number) =>
      set(
        (state) => {
          return {
            floors: state.floors.map((f) => ({
              ...f,
              items: f.items.filter((item) => item.id !== aisleId),
            })),
          };
        },
        undefined,
        'removeAisle',
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

    addSeat: (rowId, reqs) =>
      set(
        (state) => ({
          floors: state.floors.map((f) => ({
            ...f,
            items: f.items.map((item) => {
              if (item.kind !== 'section') return item;
              return {
                ...item,
                rows: item.rows.map((row) => {
                  if (row.id !== rowId) return row;
                  return {
                    ...row,
                    seats: [
                      ...row.seats,
                      ...reqs.map((req) => ({ ...req, assignedMemberId: null, visible: true })),
                    ],
                  };
                }),
              };
            }),
          })),
        }),
        undefined,
        'addSeat',
      ),

    removeSeat: (seatId) =>
      set(
        (state) => ({
          floors: state.floors.map((f) => ({
            ...f,
            items: f.items.map((item) => {
              if (item.kind !== 'section') return item;
              return {
                ...item,
                rows: item.rows.map((row) => ({
                  ...row,
                  seats: row.seats.filter((seat) => seat.id !== seatId),
                })),
              };
            }),
          })),
        }),
        undefined,
        'removeSeat',
      ),

    assignSeat: (seatIds, memberId) =>
      set(
        (state) => ({
          floors: state.floors.map((f) => ({
            ...f,
            items: f.items.map((item) => {
              if (item.kind !== 'section') return item;
              return {
                ...item,
                rows: item.rows.map((row) => ({
                  ...row,
                  seats: row.seats.map((seat) =>
                    seatIds.has(seat.id) ? { ...seat, assignedMemberId: memberId } : seat,
                  ),
                })),
              };
            }),
          })),
        }),
        false,
        'assignSeat',
      ),

    unAssignSeat: (seatId) =>
      set((state) => ({
        floors: state.floors.map((f) => ({
          ...f,
          items: f.items.map((item) => {
            if (item.kind !== 'section') return item;
            return {
              ...item,
              rows: item.rows.map((row) => ({
                ...row,
                seats: row.seats.map((seat) =>
                  seat.id === seatId ? { ...seat, assignedMemberId: null } : seat,
                ),
              })),
            };
          }),
        })),
      })),
  })),
);

interface FloorStore {
  floors: Floor[];
  getTotalSeatCount: () => number;
  getRemainSeatCount: () => number;

  addFloor: (req: CreateFloorRequest) => void;
  removeFloor: (id: number) => void;

  addSection: (floorId: number, req: CreateSectionRequest) => void;
  removeSection: (sectionId: number) => void;

  addAisle: (floorId: number, req: CreateAisleRequest) => void;
  removeAisle: (aisleId: number) => void;

  addRow: (sectionId: number, req: CreateRowsRequest) => void;
  removeRow: (rowId: number) => void;

  addSeat: (rowId: number, reqs: CreateSeatRequest[]) => void;
  removeSeat: (seatId: number) => void;

  assignSeat: (seatIds: Set<number>, memberId: number) => void;
  unAssignSeat: (seatId: number) => void;
}

export default useFloorStore;
