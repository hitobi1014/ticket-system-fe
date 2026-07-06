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

export function findVisibleSeatCountByRowId(floors: Floor[], rowId: number) {
  const find = findSeatContextByRowId(floors, rowId);
  if (find == null) return null;

  return find.row.seats.filter((seat) => seat.visible).length;
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

// 잔여티켓: 배정티켓 - 배정된 좌석수 (assignedCountMap 기반, 단일 계산식)
export function getRemainTickets(member: Member, assignedCountMap: Record<number, number>): number {
  return member.allocatedTickets - (assignedCountMap[member.id] ?? 0);
}

export function getAssignableMember(
  members: Member[],
  assignedCountMap: Record<number, number>,
): Member[] {
  return [...members].sort((a, b) => {
    const aRemain = getRemainTickets(a, assignedCountMap);
    const bRemain = getRemainTickets(b, assignedCountMap);

    const aEmpty = aRemain === 0 ? 1 : 0;
    const bEmpty = bRemain === 0 ? 1 : 0;

    if (aEmpty !== bEmpty) return aEmpty - bEmpty; // 잔여 0이면 후순위
    return a.seq - b.seq; // 기본 정렬은 seq
  });
}
