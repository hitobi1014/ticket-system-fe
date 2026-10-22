import type { Floor } from '@/types';

/** 같은 구역 + 같은 기존 배정 회원으로 묶은 좌석 번호 */
export interface SeatGroup {
  /** 현재 배정된 회원 (빈 좌석이면 null) */
  memberId: number | null;
  /** ex) '가' 구역 (층이 여러 개면 1층 '가' 구역) */
  sectionLabel: string;
  seatNumbers: number[];
}

/** 선택한 좌석을 화면 순서(층 → 구역)대로 구역/기존 배정 회원별로 묶는다 */
export function groupSelectedSeats(floors: Floor[], seatIds: Set<number>): SeatGroup[] {
  const groups = new Map<string, SeatGroup>();

  for (const floor of floors) {
    for (const floorRow of floor.rows) {
      for (const item of floorRow.items) {
        if (item.kind !== 'section') continue;
        for (const row of item.rows) {
          for (const seat of row.seats) {
            if (!seatIds.has(seat.id)) continue;
            const memberId = seat.assignedMemberId ?? null;
            const key = `${floor.id}-${item.id}-${memberId}`;
            const group = groups.get(key) ?? {
              memberId,
              sectionLabel: `${floors.length > 1 ? `${floor.name} ` : ''}'${item.name}' 구역`,
              seatNumbers: [],
            };
            group.seatNumbers.push(seat.seatNumber ?? 0);
            groups.set(key, group);
          }
        }
      }
    }
  }

  return [...groups.values()].map((g) => ({
    ...g,
    seatNumbers: [...g.seatNumbers].sort((a, b) => a - b),
  }));
}

/** 선택한 좌석 중 이미 배정된 좌석 id */
export function getAssignedSeatIds(floors: Floor[], seatIds: Set<number>): number[] {
  const result: number[] = [];
  for (const floor of floors) {
    for (const floorRow of floor.rows) {
      for (const item of floorRow.items) {
        if (item.kind !== 'section') continue;
        for (const row of item.rows) {
          for (const seat of row.seats) {
            if (seatIds.has(seat.id) && seat.assignedMemberId != null) result.push(seat.id);
          }
        }
      }
    }
  }
  return result;
}
