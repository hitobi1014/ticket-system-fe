import type { Floor, Member } from '@/types';

export function findSeatContext(floors: Floor[], seatId: number) {
  for (const floor of floors) {
    for (const floorRow of floor.rows) {
      for (const item of floorRow.items) {
        if (item.kind !== 'section') continue;
        for (const row of item.rows) {
          const seat = row.seats.find((s) => s.id === seatId);
          if (seat) {
            return { floor, floorRow, section: item, row, seat };
          }
        }
      }
    }
  }
  return null;
}

export function findSeatContextByRowId(floors: Floor[], rowId: number) {
  for (const floor of floors) {
    for (const floorRow of floor.rows) {
      for (const item of floorRow.items) {
        if (item.kind !== 'section') continue;
        const row = item.rows.find((r) => r.id === rowId);
        if (row) {
          return { floor, floorRow, section: item, row };
        }
      }
    }
  }
  return null;
}

export function getAssignableMember(members: Member[]): Member[] {
  return [...members].sort((a, b) => {
    const aEmpty = a.allocatedTickets === 0 ? 1 : 0;
    const bEmpty = b.allocatedTickets === 0 ? 1 : 0;
    if (aEmpty !== bEmpty) return aEmpty - bEmpty;
    return a.seq - b.seq;
  });
}
