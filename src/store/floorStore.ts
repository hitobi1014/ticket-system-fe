import type {
  AssignSeatRequest,
  CreateAisleRequest,
  CreateFloorRequest,
  CreateRowsRequest,
  CreateSeatRequest,
  Floor,
  Section,
  UnAssignSeatRequest,
  Venue,
} from '@/types';

import { create } from 'zustand/react';
import { devtools } from 'zustand/middleware';
import fetchApi from '@/lib/api.ts';
import useMemberStore from '@/store/memberStore.ts';
import useVenueStore from '@/store/venueStore.ts';

interface AddSectionWithRowsRequest {
  sectionName: string;
  rowConfig: { name: string; seatCount: number }[];
  targetFloorRowId: number | 'new'; // FloorRow 인덱스 또는 'new'
}

interface FloorStore {
  floors: Floor[];
  venue: Venue | null;
  isLoading: boolean;

  // ====== 좌석 정보 =====
  getUnallocatedTickedCount: () => number; // 총 좌석 수(티켓) 회원에게 미배분한 티켓 수
  getRemainSeatCount: () => number; // 미배정된 좌석(빈 좌석)
  getAssignedSeatCount: () => number; // 배정된 좌석

  // ====== Floor ======
  fetchFloor: () => Promise<void>;
  addFloor: (req: CreateFloorRequest) => Promise<Floor>;
  removeFloor: (id: number) => Promise<void>;

  // ====== Section ======
  syncSection: (floor: Floor) => void;
  addSectionWithRows: (floorId: number, req: AddSectionWithRowsRequest) => Promise<void>;
  removeSection: (sectionId: number) => Promise<void>;

  addAisle: (floorId: number, req: CreateAisleRequest) => Promise<void>;
  removeAisle: (aisleId: number) => Promise<void>;

  // ====== Section - Row ======
  addRow: (sectionId: number, req: CreateRowsRequest) => Promise<void>;
  removeRow: (rowId: number) => Promise<void>;

  // ====== Section - Row - Seat ======
  addSeat: (rowId: number, req: CreateSeatRequest) => Promise<void>;
  removeSeat: (rowId: number, removeCount: number) => Promise<void>;

  assignSeat: (req: AssignSeatRequest) => Promise<void>;
  unAssignSeat: (req: UnAssignSeatRequest) => Promise<void>;

  // ====== Member Seat Management ======
  clearMemberSeats: (memberId: number) => void;
}

const FLOOR_API_PREFIX = '/floors';
const SECTION_API_PREFIX = '/sections';
const AISLE_API_PREFIX = '/aisles';
const ROW_API_PREFIX = '/rows';
const SEAT_API_PREFIX = '/seats';

const useFloorStore = create<FloorStore>()(
  devtools((set, get) => ({
    floors: [],
    venue: null,
    isLoading: false,

    getUnallocatedTickedCount: () => {
      const totalTicket = useVenueStore.getState().getTotalSeatCount();
      const allocatedTickedCount = useMemberStore.getState().getAllocatedTickets();

      return totalTicket - allocatedTickedCount;
    },

    getAssignedSeatCount: () =>
      get()
        .floors.flatMap((f) => f.rows.flatMap((r) => r.items))
        .filter((item): item is Section => item.kind === 'section')
        .flatMap((s) => s.rows)
        .flatMap((r) => r.seats)
        .filter((seat) => seat.assignedMemberId != null).length,

    getRemainSeatCount: () => {
      const totalSeatCount = useVenueStore.getState().getTotalSeatCount();
      const assignSeatCount = get().getAssignedSeatCount();

      return totalSeatCount - assignSeatCount;
    },

    // ====== Venue ======

    fetchFloor: async () => {
      const floors = await fetchApi<Floor[]>(`${FLOOR_API_PREFIX}`);
      set({ floors });
    },

    addFloor: async (req: CreateFloorRequest) => {
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

    removeFloor: async (id: number) => {
      await fetchApi(`${FLOOR_API_PREFIX}/${id}`, {
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

    addSectionWithRows: async (floorId: number, req: AddSectionWithRowsRequest) => {
      const floor = await fetchApi<Floor>(`${FLOOR_API_PREFIX}/${floorId}/sections-with-rows`, {
        method: 'POST',
        body: JSON.stringify(req),
      });

      get().syncSection(floor);
    },

    removeSection: async (sectionId: number) => {
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

    addAisle: async (floorId: number, req: CreateAisleRequest) => {
      const result = await fetchApi<Floor>(`${FLOOR_API_PREFIX}/${floorId}/aisles`, {
        method: 'POST',
        body: JSON.stringify(req),
      });
      get().syncSection(result);
    },

    removeAisle: async (aisleId: number) => {
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

    addRow: async (sectionId: number, req: CreateRowsRequest) => {
      const floor = await fetchApi<Floor>(`${SECTION_API_PREFIX}/${sectionId}/rows`, {
        method: 'POST',
        body: JSON.stringify(req),
      });
      get().syncSection(floor);
    },

    removeRow: async (rowId: number) => {
      await fetchApi(`${ROW_API_PREFIX}/${rowId}`, {
        method: 'DELETE',
      });

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
      );
    },

    addSeat: async (rowId: number, req: CreateSeatRequest) => {
      const floor = await fetchApi<Floor>(`${ROW_API_PREFIX}/${rowId}/seats`, {
        method: 'POST',
        body: JSON.stringify(req),
      });
      get().syncSection(floor);
    },

    removeSeat: async (rowId: number, removeCount: number) => {
      const floor = await fetchApi<Floor>(`${SEAT_API_PREFIX}/${rowId}?seatCount=${removeCount}`, {
        method: 'DELETE',
      });
      get().syncSection(floor);
    },

    assignSeat: async (req: AssignSeatRequest) => {
      const floor = await fetchApi<Floor>(`${SEAT_API_PREFIX}/assign`, {
        method: 'PATCH',
        body: JSON.stringify(req),
      });
      get().syncSection(floor);
    },

    unAssignSeat: async (req: UnAssignSeatRequest) => {
      const floor = await fetchApi<Floor>(`${SEAT_API_PREFIX}/unassign`, {
        method: 'PATCH',
        body: JSON.stringify(req),
      });
      get().syncSection(floor);
    },

    /**
     * 특정 회원에게 배정된 모든 좌석 해제
     * @param memberId - 해제할 회원 ID
     *
     * 주의: 서버에서 이미 처리되었으므로 store만 동기화
     * 만약 서버 로직이 변경되면 이 부분도 함께 수정 필요
     */
    clearMemberSeats: (memberId: number) => {
      set((state) => ({
        floors: state.floors.map((floor) => ({
          ...floor,
          rows: floor.rows.map((floorRow) => ({
            ...floorRow,
            items: floorRow.items.map((item) => {
              if (item.kind !== 'section') return item;
              return {
                ...item,
                rows: item.rows.map((row) => ({
                  ...row,
                  seats: row.seats.map((seat) =>
                    seat.assignedMemberId === memberId
                      ? { ...seat, assignedMemberId: undefined }
                      : seat,
                  ),
                })),
              };
            }),
          })),
        })),
      }));
    },

    // END
  })),
);

export default useFloorStore;
