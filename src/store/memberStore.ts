import type { CreateMemberRequest, Member } from '@/types/member.ts';
import { create } from 'zustand/react';
import useFloorStore from '@/store/floorStore.ts';
import type { Section } from '@/types';
import fetchApi from '@/lib/api.ts';

interface MemberStore {
  members: Member[];
  isLoading: boolean;

  fetchMembers: () => Promise<void>;
  syncFromSheet: () => Promise<void>;
  getMemberAssignedTicketsByMemberId: (id: number) => number;
  getMemberRemainTicketsByMemberId: (id: number) => number;
  getAllocatedTickets: () => number;

  addMember: (req: CreateMemberRequest) => Promise<void>;
  updateMember: (id: number, req: CreateMemberRequest) => Promise<void>;
  removeMember: (id: number) => Promise<void>;

  updateTickets: (id: number, tickets: number) => void;
  distributeTickets: () => Promise<void>;

  updateMemberColor: (id: number, color: string) => void;
}

const memberURIPrefix = '/members';

const useMemberStore = create<MemberStore>((set, get) => ({
  members: [],
  isLoading: false,

  fetchMembers: async () => {
    set({ isLoading: true });
    const members = await fetchApi<Member[]>(memberURIPrefix);
    set({ members, isLoading: false });
  },

  syncFromSheet: async () => {
    set({ isLoading: true });

    await fetchApi(`${memberURIPrefix}/async-sheet`, {
      method: 'POST',
    });

    await get().fetchMembers();
    set({ isLoading: false });
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

  // 잔여티켓: 배정티켓 - 배정된 좌석수
  getMemberRemainTicketsByMemberId: (memberId) => {
    const allowTickets = get().members.find((m) => m.id === memberId)?.allocatedTickets ?? 0;
    const assignedTickets = get().getMemberAssignedTicketsByMemberId(memberId);
    return allowTickets - assignedTickets;
  },

  getAllocatedTickets: () => get().members.reduce((sum, m) => sum + m.allocatedTickets, 0),

  addMember: async (req) => {
    const newMember = await fetchApi<Member>(memberURIPrefix, {
      method: 'POST',
      body: JSON.stringify(req),
    });
    set((state) => ({
      members: [...state.members, newMember],
    }));
  },

  updateMember: async (id, req) => {
    await fetchApi<void>(`${memberURIPrefix}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(req),
    });
    set((state) => ({
      members: state.members.map((m) => (m.id === id ? { ...m, ...req } : m)),
    }));
  },

  removeMember: async (id) => {
    await fetchApi<void>(`${memberURIPrefix}/${id}`, {
      method: 'DELETE',
    });

    set(
      (state) => ({
        members: state.members.filter((m) => m.id !== id),
      }),
      undefined,
    );
  },

  updateTickets: (id, tickets) =>
    set((state) => ({
      members: state.members.map((m) => (m.id === id ? { ...m, allocatedTickets: tickets } : m)),
    })),

  distributeTickets: async () => {
    await fetchApi<void>(`${memberURIPrefix}/distribute`, {
      method: 'POST',
    });

    // 배분 후 최신 목록 재조회
    const members = await fetchApi<Member[]>(memberURIPrefix);
    set({ members }, undefined);
  },

  updateMemberColor: (id, color) =>
    set((state) => ({
      members: state.members.map((m) => (m.id === id ? { ...m, color } : m)),
    })),
}));

export default useMemberStore;
