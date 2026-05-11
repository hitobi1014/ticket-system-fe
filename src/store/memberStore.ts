import type { CreateMemberRequest, Member } from '@/types/member.ts';
import { create } from 'zustand/react';
import { mockMembers } from '@/mocks/members.ts';
import { VENUE } from '@/constant/venue.ts';

interface MemberStore {
  members: Member[];
  addMember: (req: CreateMemberRequest) => void;
  removeMember: (id: number) => void;
  updateTickets: (id: number, tickets: number) => void;
  distributeTickets: () => void;
}

const useMemberStore = create<MemberStore>((set) => ({
  members: mockMembers,

  addMember: (req) =>
    set((state) => {
      const maxId = state.members.reduce((max, m) => Math.max(max, m.id ?? 0), 0);
      return {
        members: [...state.members, { ...req, id: maxId + 1 }],
      };
    }),
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

      const perMember = Math.floor(VENUE.totalSeats / memberCount);

      return {
        members: state.members.map((m) => ({
          ...m,
          allocatedTickets: perMember,
        })),
      };
    }),
}));

export default useMemberStore;
