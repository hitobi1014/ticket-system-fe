import type { CreateMemberRequest, Member } from '@/types/member.ts';
import { create } from 'zustand/react';
import { mockMembers } from '@/mocks/members.ts';

interface MemberStore {
  members: Member[];
  addMember: (req: CreateMemberRequest) => void;
  removeMember: (id: number) => void;
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
}));

export default useMemberStore;
