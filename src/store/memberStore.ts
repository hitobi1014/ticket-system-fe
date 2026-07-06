import type { CreateMemberRequest, Member, SyncMemberResponse } from '@/types/member.ts';
import { create } from 'zustand/react';
import useFloorStore from '@/store/floorStore.ts';
import type { Section } from '@/types';
import fetchApi from '@/lib/api.ts';
import { getRemainTickets } from '@/lib/seatUtils.ts';

interface MemberLoadingState {
  fetch: boolean;
  add: boolean;
  update: boolean;
  remove: boolean;
  distribute: boolean;
  sync: boolean;
}

interface MemberStore {
  members: Member[];
  isLoading: MemberLoadingState;

  fetchMembers: () => Promise<void>;
  syncFromSheet: () => Promise<SyncMemberResponse>;
  getMemberAssignedTicketsByMemberId: (id: number) => number;
  getAssignedCountMap: () => Record<number, number>;
  getMemberRemainTicketsByMemberId: (id: number) => number;
  getAllocatedTickets: () => number;

  addMember: (req: CreateMemberRequest) => Promise<void>;
  updateMember: (id: number, req: CreateMemberRequest) => Promise<void>;
  removeMember: (id: number) => Promise<void>;

  distributeTickets: () => Promise<void>;
  updateMemberColor: (id: number, color: string) => void;
}

const memberURIPrefix = '/members';

const useMemberStore = create<MemberStore>((set, get) => ({
  members: [],
  isLoading: {
    fetch: false,
    add: false,
    update: false,
    remove: false,
    distribute: false,
    sync: false,
  },

  fetchMembers: async () => {
    set((state) => ({ isLoading: { ...state.isLoading, fetch: true } }));
    try {
      const members = await fetchApi<Member[]>(memberURIPrefix);
      set({ members });
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, fetch: false } }));
    }
  },

  syncFromSheet: async () => {
    set((state) => ({ isLoading: { ...state.isLoading, sync: true } }));
    try {
      const data = await fetchApi<SyncMemberResponse>(`${memberURIPrefix}/async-sheet`, {
        method: 'POST',
      });
      set({ members: data.members });
      return data;
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, sync: false } }));
    }
  },
  // 배정된 좌석수: seat에 배정된 회원수 id length
  getMemberAssignedTicketsByMemberId: (memberId) =>
    useFloorStore
      .getState()
      .floors.flatMap((f) => f.rows.flatMap((r) => r.items))
      .filter((item): item is Section => item.kind === 'section')
      .flatMap((s) => s.rows)
      .flatMap((r) => r.seats)
      .filter((seat) => seat.assignedMemberId === memberId).length,

  getAssignedCountMap: () => {
    const seats = useFloorStore
      .getState()
      .floors.flatMap((f) => f.rows.flatMap((r) => r.items))
      .filter((item): item is Section => item.kind === 'section')
      .flatMap((s) => s.rows)
      .flatMap((r) => r.seats)
      .filter(
        (seat): seat is typeof seat & { assignedMemberId: number } =>
          seat.assignedMemberId !== undefined,
      );

    return seats.reduce<Record<number, number>>((acc, seat) => {
      acc[seat.assignedMemberId] = (acc[seat.assignedMemberId] ?? 0) + 1;
      return acc;
    }, {});
  },

  // 잔여티켓: 배정티켓 - 배정된 좌석수 (getRemainTickets 공식 재사용)
  getMemberRemainTicketsByMemberId: (memberId) => {
    const member = get().members.find((m) => m.id === memberId);
    if (!member) return 0;
    return getRemainTickets(member, get().getAssignedCountMap());
  },

  getAllocatedTickets: () => get().members.reduce((sum, m) => sum + m.allocatedTickets, 0),

  addMember: async (req) => {
    set((state) => ({ isLoading: { ...state.isLoading, add: true } }));
    try {
      const newMember = await fetchApi<Member>(memberURIPrefix, {
        method: 'POST',
        body: JSON.stringify(req),
      });
      set((state) => ({
        members: [...state.members, newMember],
      }));
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, add: false } }));
    }
  },

  updateMember: async (id, req) => {
    set((state) => ({ isLoading: { ...state.isLoading, update: true } }));
    try {
      await fetchApi<void>(`${memberURIPrefix}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(req),
      });
      set((state) => ({
        members: state.members.map((m) => (m.id === id ? { ...m, ...req } : m)),
      }));
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, update: false } }));
    }
  },

  removeMember: async (id) => {
    set((state) => ({ isLoading: { ...state.isLoading, remove: true } }));
    try {
      await fetchApi<void>(`${memberURIPrefix}/${id}`, {
        method: 'DELETE',
      });

      // 회원 목록에서 제거
      set((state) => ({
        members: state.members.filter((m) => m.id !== id),
      }));

      // 좌석 배정 해제 (floorStore에 위임)
      useFloorStore.getState().clearMemberSeats(id);
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, remove: false } }));
    }
  },

  distributeTickets: async () => {
    set((state) => ({ isLoading: { ...state.isLoading, distribute: true } }));
    try {
      await fetchApi<void>(`${memberURIPrefix}/distribute`, {
        method: 'POST',
      });

      // 배분 후 최신 목록 재조회
      const members = await fetchApi<Member[]>(memberURIPrefix);
      set({ members });
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, distribute: false } }));
    }
  },

  updateMemberColor: (id, color) =>
    set((state) => ({
      members: state.members.map((m) => (m.id === id ? { ...m, color } : m)),
    })),
}));

export default useMemberStore;
