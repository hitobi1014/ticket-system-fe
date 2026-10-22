import type { Floor } from '@/types';

export interface SectionSeatCount {
  sectionName: string;
  count: number;
}

export interface FloorSeatCount {
  floorName: string;
  sections: SectionSeatCount[];
}

/** 회원 한 명의 배정 좌석을 층/구역 단위로 집계한 결과 */
export interface MemberSeatSummary {
  totalCount: number;
  floors: FloorSeatCount[];
}

/**
 * 회원의 배정 좌석을 층/구역별로 집계 (숨김 좌석 제외)
 * 층은 floors 배열 순서, 구역은 화면 배치 순서(행 → 아이템)를 따른다.
 */
export function getMemberSeatSummary(floors: Floor[], memberId: number): MemberSeatSummary {
  const result: FloorSeatCount[] = [];
  let totalCount = 0;

  for (const floor of floors) {
    const sections: SectionSeatCount[] = [];
    for (const floorRow of floor.rows) {
      for (const item of floorRow.items) {
        if (item.kind !== 'section') continue;
        const count = item.rows
          .flatMap((row) => row.seats)
          .filter((seat) => seat.visible && seat.assignedMemberId === memberId).length;
        if (count > 0) sections.push({ sectionName: item.name, count });
      }
    }
    if (sections.length > 0) {
      result.push({ floorName: floor.name, sections });
      totalCount += sections.reduce((sum, s) => sum + s.count, 0);
    }
  }

  return { totalCount, floors: result };
}

/** ex) 1층 가구역 10석, 나구역 5석 · 2층 다구역 3석 (배정 좌석이 없으면 빈 문자열) */
export function formatMemberSeatSummary(summary: MemberSeatSummary): string {
  return summary.floors
    .map(
      (f) => `${f.floorName} ${f.sections.map((s) => `${s.sectionName} ${s.count}석`).join(', ')}`,
    )
    .join(' · ');
}
