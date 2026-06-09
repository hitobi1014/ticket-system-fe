import type { CreateMemberRequest, Member } from '@/types/member.ts';
import { create } from 'zustand/react';
import { mockMembers } from '@/mocks/members.ts';
import useFloorStore from '@/store/floorStore.ts';
import type { Section } from '@/types';

interface MemberStore {
  members: Member[];
  getMemberAssignedTickets: (id: number) => number;
  getMemberRemainTickets: (id: number) => number;

  addMember: (req: CreateMemberRequest) => void;
  updateMember: (id: number, req: CreateMemberRequest) => void;
  removeMember: (id: number) => void;

  updateTickets: (id: number, tickets: number) => void;
  distributeTickets: () => void;

  updateMemberColor: (id: number, color: string) => void;
}

const useMemberStore = create<MemberStore>((set, get) => ({
  members: mockMembers,

  // 배정된 좌석수: seat에 배정된 회원수 id length
  getMemberAssignedTickets: (memberId) =>
    useFloorStore
      .getState()
      .floors.flatMap((f) => f.items)
      .filter((item): item is Section => item.kind === 'section')
      .flatMap((s) => s.rows)
      .flatMap((r) => r.seats)
      .filter((seat) => seat.assignedMemberId === memberId).length,

  // 잔여티켓: 배정티켓 - 배정된 좌석수
  getMemberRemainTickets: (memberId) => {
    const allowTickets = get().members.find((m) => m.id === memberId)?.allocatedTickets ?? 0;
    const assignedTickets = get().getMemberAssignedTickets(memberId);
    return allowTickets - assignedTickets;
  },

  addMember: (req) =>
    set((state) => {
      const maxId = state.members.reduce((max, m) => Math.max(max, m.id ?? 0), 0);
      return {
        members: [...state.members, { ...req, id: maxId + 1 }],
      };
    }),

  updateMember: (id, req) =>
    set((state) => ({
      members: state.members.map((m) => (m.id === id ? { ...m, ...req } : m)),
    })),

  removeMember: (id) =>
    set((state) => ({
      members: state.members.filter((m) => m.id !== id),
    })),

  updateTickets: (id, tickets) =>
    set((state) => ({
      members: state.members.map((m) => (m.id === id ? { ...m, allocatedTickets: tickets } : m)),
    })),

  distributeTickets: () =>
    set((state) => {
      const memberCount = state.members.length;
      if (memberCount === 0) return state;

      const totalSeats = useFloorStore.getState().getTotalSeatCount();
      const perMember = Math.floor(totalSeats / memberCount);

      return {
        members: state.members.map((m) => ({
          ...m,
          allocatedTickets: perMember,
        })),
      };
    }),

  updateMemberColor: (id, color) =>
    set((state) => ({
      members: state.members.map((m) => (m.id === id ? { ...m, color } : m)),
    })),
}));

export default useMemberStore;
