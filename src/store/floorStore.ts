import type {
  Aisle,
  CreateAisleRequest,
  CreateFloorRequest,
  CreateRowsRequest,
  CreateSeatRequest,
  CreateSectionRequest,
  Floor,
  Section,
  Venue,
} from '@/types';

import { create } from 'zustand/react';
import { devtools } from 'zustand/middleware';
import fetchApi from '@/lib/api.ts';

interface AddSectionWithRowsRequest {
  sectionId: number;
  sectionName: string;
  rowConfigs: { name: string; seatCount: number }[];
  targetRowIndex: number | 'new'; // FloorRow 인덱스 또는 'new'
}

interface FloorStore {
  floors: Floor[];
  venue: Venue | null;
  isLoading: boolean;

  // ====== Venue ======
  fetchVenue: () => Promise<void>; // 최초 렌더링시 1회만 호출용
  getTotalSeatCount: () => number; // 총 좌석
  getRemainSeatCount: () => number; // 전체 남은 좌석
  getAssignedSeatCount: () => number; // 배정된 좌석

  // ====== Floor ======
  fetchFloor: () => Promise<void>;
  addFloor: (req: CreateFloorRequest) => Promise<Floor>;
  removeFloor: (id: number) => Promise<void>;

  addSection: (floorId: number, req: CreateSectionRequest) => void;
  addSectionWithRows: (floorId: number, req: AddSectionWithRowsRequest) => void;
  removeSection: (sectionId: number) => void;

  addAisle: (floorId: number, afterSectionId: number, req: CreateAisleRequest) => void;
  removeAisle: (aisleId: number) => void;

  addRow: (sectionId: number, req: CreateRowsRequest) => void;
  removeRow: (rowId: number) => void;

  addSeat: (rowId: number, reqs: CreateSeatRequest[]) => void;
  removeSeat: (rowId: number, removeCount: number) => void;

  assignSeat: (seatIds: Set<number>, memberId: number) => void;
  unAssignSeat: (seatId: number) => void;
}

const useFloorStore = create<FloorStore>()(
  devtools((set, get) => ({
    floors: [],
    // floors: mockFloors,
    venue: null,
    isLoading: false,

    // ====== Venue ======
    fetchVenue: async () => {
      set({ isLoading: true });
      const data = await fetchApi<Venue>('/venue/first');
      set({
        venue: data,
        isLoading: false,
      });
    },

    getTotalSeatCount: () => get().venue?.totalSeats ?? 0,
    // 총 좌석 - 회원 할당된 좌석
    getRemainSeatCount: () => {
      const totalSeatCount = get().getTotalSeatCount();
      const assignSeatCount = get()
        .floors.flatMap((f) => f.rows.flatMap((r) => r.items))
        .filter((item): item is Section => item.kind === 'section')
        .flatMap((s) => s.rows)
        .flatMap((r) => r.seats)
        .filter((seat) => seat.assignedMemberId !== null).length;

      return totalSeatCount - assignSeatCount;
    },

    getAssignedSeatCount: () =>
      get()
        .floors.flatMap((f) => f.rows.flatMap((r) => r.items))
        .filter((item): item is Section => item.kind === 'section')
        .flatMap((s) => s.rows)
        .flatMap((r) => r.seats)
        .filter((seat) => seat.assignedMemberId !== undefined).length,

    // ====== Venue ======

    fetchFloor: async () => {
      const floors = await fetchApi<Floor[]>('/floors');
      set({ floors });
    },

    addFloor: async (req) => {
      const floor = await fetchApi<Floor>('/floors', {
        method: 'POST',
        body: JSON.stringify(req),
      });

      set(
        (state) => ({
          floors: [...state.floors, floor],
        }),
        undefined,
        'addFloor',
      );

      return floor;
    },

    removeFloor: async (id) => {
      await fetchApi(`/floors/${id}`, {
        method: 'DELETE',
      });
      set(
        (state) => {
          return {
            floors: state.floors.filter((f) => f.id !== id),
          };
        },
        undefined,
        'removeFloor',
      );
    },

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

            // 첫 번째 FloorRow에 추가 (없으면 새로 생성)
            if (f.rows.length === 0) {
              return { ...f, rows: [{ id: 1, items: [newSection] }] };
            }
            return {
              ...f,
              rows: f.rows.map((floorRow, idx) =>
                idx === 0 ? { ...floorRow, items: [...floorRow.items, newSection] } : floorRow,
              ),
            };
          }),
        }),
        undefined,
        'addSection',
      ),

    addSectionWithRows: (floorId, req) =>
      set(
        (state) => {
          // 1. 최대 row ID, seat ID 계산
          const maxRowId = state.floors
            .flatMap((f) => f.rows.flatMap((r) => r.items))
            .filter((item): item is Section => item.kind === 'section')
            .flatMap((s) => s.rows)
            .reduce((max, row) => Math.max(max, row.id), 0);

          const maxSeatId = state.floors
            .flatMap((f) => f.rows.flatMap((r) => r.items))
            .filter((item): item is Section => item.kind === 'section')
            .flatMap((s) => s.rows)
            .flatMap((r) => r.seats)
            .reduce((max, seat) => Math.max(max, seat.id), 0);

          let currentRowId = maxRowId + 1;
          let currentSeatId = maxSeatId + 1;

          // 2. rowConfigs를 기반으로 Rows[] 생성 (각 Row에 Seat[] 포함)
          const newRows = req.rowConfigs.map((config) => ({
            id: currentRowId++,
            rowName: config.name,
            seats: Array.from({ length: config.seatCount }, (_, i) => ({
              id: currentSeatId++,
              seatNumber: i + 1,
              visible: true,
            })),
          }));

          // 3. Section 객체 생성
          const newSection: Section = {
            kind: 'section',
            id: req.sectionId,
            name: req.sectionName,
            rows: newRows,
          };

          // 4. targetRowIndex에 따라 처리
          return {
            floors: state.floors.map((f) => {
              if (f.id !== floorId) return f;

              // 새 FloorRow 생성
              if (req.targetRowIndex === 'new') {
                const maxFloorRowId =
                  f.rows.reduce((max, floorRow) => Math.max(max, floorRow.id), 0) + 1;
                return {
                  ...f,
                  rows: [...f.rows, { id: maxFloorRowId, items: [newSection] }],
                };
              }

              // 기존 FloorRow의 items 배열 맨 뒤에 추가
              return {
                ...f,
                rows: f.rows.map((floorRow, idx) =>
                  idx === req.targetRowIndex
                    ? { ...floorRow, items: [...floorRow.items, newSection] }
                    : floorRow,
                ),
              };
            }),
          };
        },
        undefined,
        'addSectionWithRows',
      ),

    removeSection: (sectionId) =>
      set(
        (state) => {
          return {
            floors: state.floors.map((f) => ({
              ...f,
              rows: f.rows.map((floorRow) => ({
                ...floorRow,
                items: floorRow.items.filter((item) => item.id !== sectionId),
              })),
            })),
          };
        },
        undefined,
        'removeSection',
      ),

    addAisle: (floorId, afterSectionId, req) =>
      set(
        (state) => ({
          floors: state.floors.map((f) => {
            if (f.id !== floorId) return f;

            const newAisle: Aisle = { ...req };

            return {
              ...f,
              rows: f.rows.map((floorRow) => {
                const sectionIndex = floorRow.items.findIndex(
                  (item) => item.kind === 'section' && item.id === afterSectionId,
                );
                if (sectionIndex === -1) return floorRow;

                const newItems = [...floorRow.items];
                newItems.splice(sectionIndex + 1, 0, newAisle);
                return { ...floorRow, items: newItems };
              }),
            };
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
              rows: f.rows.map((floorRow) => ({
                ...floorRow,
                items: floorRow.items.filter((item) => item.id !== aisleId),
              })),
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
            rows: f.rows.map((floorRow) => ({
              ...floorRow,
              items: floorRow.items.map((item) => {
                if (item.kind !== 'section' || item.id !== sectionId) return item;
                return {
                  ...item,
                  rows: [...item.rows, { ...req, seats: [] }],
                };
              }),
            })),
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
            rows: f.rows.map((floorRow) => ({
              ...floorRow,
              items: floorRow.items.map((item) => {
                if (item.kind !== 'section') return item;
                return {
                  ...item,
                  rows: item.rows.filter((row) => row.id !== rowId),
                };
              }),
            })),
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
            rows: f.rows.map((floorRow) => ({
              ...floorRow,
              items: floorRow.items.map((item) => {
                if (item.kind !== 'section') return item;
                return {
                  ...item,
                  rows: item.rows.map((row) => {
                    if (row.id !== rowId) return row;
                    return {
                      ...row,
                      seats: [...row.seats, ...reqs.map((req) => ({ ...req, visible: true }))],
                    };
                  }),
                };
              }),
            })),
          })),
        }),
        undefined,
        'addSeat',
      ),

    removeSeat: (rowId, removeCount) =>
      set(
        (state) => ({
          floors: state.floors.map((f) => ({
            ...f,
            rows: f.rows.map((floorRow) => ({
              ...floorRow,
              items: floorRow.items.map((item) => {
                if (item.kind !== 'section') return item;
                return {
                  ...item,
                  rows: item.rows.map((row) => {
                    if (row.id !== rowId) return row;
                    return {
                      ...row,
                      seats: row.seats.slice(0, row.seats.length - removeCount),
                    };
                  }),
                };
              }),
            })),
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
            rows: f.rows.map((floorRow) => ({
              ...floorRow,
              items: floorRow.items.map((item) => {
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
          })),
        }),
        false,
        'assignSeat',
      ),

    unAssignSeat: (seatId) =>
      set((state) => ({
        floors: state.floors.map((f) => ({
          ...f,
          rows: f.rows.map((floorRow) => ({
            ...floorRow,
            items: floorRow.items.map((item) => {
              if (item.kind !== 'section') return item;
              return {
                ...item,
                rows: item.rows.map((row) => ({
                  ...row,
                  seats: row.seats.map((seat) =>
                    seat.id === seatId ? { ...seat, assignedMemberId: undefined } : seat,
                  ),
                })),
              };
            }),
          })),
        })),
      })),
  })),
);

export default useFloorStore;
