import type { Floor, Member } from '@/types';

export function findSeatContext(floors: Floor[], seatId: number) {
  for (const floor of floors) {
    for (const item of floor.items) {
      if (item.kind !== 'section') continue;
      for (const row of item.rows) {
        const seat = row.seats.find((s) => s.id === seatId);
        if (seat) {
          return { floor, section: item, row, seat };
        }
      }
    }
  }
  return null;
}

export function findSeatContextByRowId(floors: Floor[], rowId: number) {
  for (const floor of floors) {
    for (const item of floor.items) {
      if (item.kind !== 'section') continue;
      const row = item.rows.find((r) => r.id === rowId);
      if (row) {
        return { floor, section: item, row };
      }
    }
  }
  return null;
}

export function getAssignableMember(members: Member[]): Member[] {
  return members.filter((m) => m.allocatedTickets > 0);
}
