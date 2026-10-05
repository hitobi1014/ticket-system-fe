import type { AssignedSeatInfo, Floor, Member, Section } from '@/types';

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

export function findSeatsByMemberId(floors: Floor[], memberId: number) {
  const result: NonNullable<ReturnType<typeof findSeatContext>>[] = [];

  for (const floor of floors) {
    for (const floorRow of floor.rows) {
      for (const item of floorRow.items) {
        if (item.kind !== 'section') continue;
        for (const row of item.rows) {
          for (const seat of row.seats) {
            if (seat.assignedMemberId === memberId) {
              result.push({ floor, floorRow, section: item, row, seat });
            }
          }
        }
      }
    }
  }
  return result;
}

// 배정 좌석 조회 결과(findSeatsByMemberId)를 티켓 다운로드용 파생 데이터로 변환
export function toAssignedSeatInfo(
  ctx: NonNullable<ReturnType<typeof findSeatContext>>,
): AssignedSeatInfo {
  return {
    seatId: ctx.seat.id,
    floorName: ctx.floor.name,
    sectionName: ctx.section.name,
    rowName: ctx.row.rowName,
    seatNumber: ctx.seat.seatNumber,
    guestName: ctx.seat.guestName ?? '',
    memo: ctx.seat.memo,
  };
}

export function findSectionRowInfoByRowId(section: Section, rowId: number) {
  const row = section.rows.find((r) => r.id === rowId);
  if (row) {
    return { section: section, row };
  }
  return null;
}

export interface SeatDisplayInfo {
  displayName: string;
  showMyself: boolean;
  isTBD: boolean;
}

export function getSeatDisplayInfo(options: {
  seat: { assignedMemberId?: number; guestName?: string | null };
  memberName: string;
  displayMode?: 'member' | 'guest';
  currentMemberId?: number;
  isAdmin: boolean;
}): SeatDisplayInfo {
  const EMPTY_GUEST_NAME = '-';
  const { seat, memberName, displayMode = 'member', currentMemberId, isAdmin } = options;

  if (seat.assignedMemberId == null) {
    return { displayName: '', showMyself: false, isTBD: false };
  }

  const isMyself = currentMemberId != null && seat.assignedMemberId === currentMemberId;
  const isGuestNameEmpty = seat.guestName == null || seat.guestName.trim() === '';

  if (isAdmin) {
    if (displayMode === 'guest') {
      return {
        displayName: isGuestNameEmpty ? EMPTY_GUEST_NAME : seat.guestName!,
        showMyself: isMyself,
        isTBD: isGuestNameEmpty,
      };
    } else {
      return { displayName: memberName, showMyself: isMyself, isTBD: false };
    }
  }

  if (isMyself) {
    return {
      displayName: isGuestNameEmpty ? EMPTY_GUEST_NAME : seat.guestName!,
      showMyself: true,
      isTBD: isGuestNameEmpty,
    };
  }

  return { displayName: memberName, showMyself: false, isTBD: false };
}
