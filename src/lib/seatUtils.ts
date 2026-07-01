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

export function getAssignableMember(
  members: Member[],
  assignedCountMap: Record<number, number>,
): Member[] {
  return [...members].sort((a, b) => {
    const aRemain = a.allocatedTickets - (assignedCountMap[a.id] ?? 0);
    const bRemain = b.allocatedTickets - (assignedCountMap[b.id] ?? 0);

    const aEmpty = aRemain === 0 ? 1 : 0;
    const bEmpty = bRemain === 0 ? 1 : 0;

    if (aEmpty !== bEmpty) return aEmpty - bEmpty; // 잔여 0이면 후순위
    return a.seq - b.seq; // 기본 정렬은 seq
  });
}
