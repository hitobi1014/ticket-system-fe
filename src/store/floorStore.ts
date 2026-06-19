import type {
  CreateAisleRequest,
  CreateFloorRequest,
  CreateRowsRequest,
  CreateSeatRequest,
  Floor,
  Section,
  Venue,
} from '@/types';

import { create } from 'zustand/react';
import { devtools } from 'zustand/middleware';
import fetchApi from '@/lib/api.ts';

interface AddSectionWithRowsRequest {
  sectionName: string;
  rowConfig: { name: string; seatCount: number }[];
  targetFloorRowId: number | 'new'; // FloorRow 인덱스 또는 'new'
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

  // TODO 초기 사용하던 함수 미사용 삭제 예정

  // ====== Section ======
  syncSection: (floor: Floor) => void;
  addSectionWithRows: (floorId: number, req: AddSectionWithRowsRequest) => Promise<void>;
  removeSection: (sectionId: number) => void;

  addAisle: (floorId: number, req: CreateAisleRequest) => Promise<void>;
  removeAisle: (aisleId: number) => Promise<void>;

  // ====== Section - Row ======
  addRow: (sectionId: number, req: CreateRowsRequest) => Promise<void>;
  removeRow: (rowId: number) => void;

  // ====== Section - Row - Seat ======
  addSeat: (rowId: number, reqs: CreateSeatRequest[]) => void;
  removeSeat: (rowId: number, removeCount: number) => void;

  assignSeat: (seatIds: Set<number>, memberId: number) => void;
  unAssignSeat: (seatId: number) => void;
}

const FLOOR_API_PREFIX = '/floors';
const SECTION_API_PREFIX = '/sections';
const AISLE_API_PREFIX = '/aisles';

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
      const floors = await fetchApi<Floor[]>(`${FLOOR_API_PREFIX}`);
      set({ floors });
    },

    addFloor: async (req) => {
      const floor = await fetchApi<Floor>(`${FLOOR_API_PREFIX}`, {
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
      await fetchApi(`${FLOOR_API_PREFIX}${id}`, {
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

    /**
     * 구역, 통로, 좌석 등 업데이트 이후 동기화
     * @param floor
     */
    syncSection: (floor: Floor) => {
      set((state) => ({
        floors: state.floors.map((f) => (f.id === floor.id ? floor : f)),
      }));
    },

    addSectionWithRows: async (floorId, req) => {
      const result = await fetchApi<Floor>(`${FLOOR_API_PREFIX}/${floorId}/sections-with-rows`, {
        method: 'POST',
        body: JSON.stringify(req),
      });

      get().syncSection(result);
    },

    removeSection: async (sectionId) => {
      // sections/:id
      await fetchApi(`${SECTION_API_PREFIX}/${sectionId}`, {
        method: 'DELETE',
      });

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
      );
    },

    addAisle: async (floorId, req) => {
      const result = await fetchApi<Floor>(`${FLOOR_API_PREFIX}/${floorId}/aisles`, {
        method: 'POST',
        body: JSON.stringify(req),
      });
      get().syncSection(result);
    },

    removeAisle: async (aisleId: number) => {
      //aisles/:id
      await fetchApi(`${AISLE_API_PREFIX}/${aisleId}`, {
        method: 'DELETE',
      });
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
      );
    },

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
