import { create } from 'zustand/react';
import { devtools } from 'zustand/middleware';

interface AssignStore {
  assignSeat(seatId: number, memberId: number): void;
  unassignSeat(seatId: number): void;
}

const useAssignStore = create<AssignStore>()(devtools((set) => ({
  assignSeat: (seatId, memberId) =>
    set(
      (state) => (
      )
    ),

  unassignSeat: (seatId) =>
    set(
      (state) => ({})
    )
})));
