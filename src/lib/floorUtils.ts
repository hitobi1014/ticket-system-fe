import type { Aisle, Floor, FloorRow, Section } from '@/types';

/** 층 내 모든 구역/통로 항목 */
function getFloorItems(floor: Floor | undefined) {
  return floor?.rows.flatMap((r) => r.items) ?? [];
}

export function findSectionInFloor(floor: Floor | undefined, sectionId: number | undefined) {
  return (
    getFloorItems(floor).find(
      (item): item is Section => item.kind === 'section' && item.id === sectionId,
    ) ?? null
  );
}

export function findAisleInFloor(floor: Floor | undefined, aisleId: number | undefined) {
  return (
    getFloorItems(floor).find(
      (item): item is Aisle => item.kind === 'aisle' && item.id === aisleId,
    ) ?? null
  );
}

/** 해당 구역이 속한 층 행 */
export function findFloorRowBySectionId(
  floor: Floor | undefined,
  sectionId: number | undefined,
): FloorRow | null {
  return (
    floor?.rows.find((r) =>
      r.items.some((item) => item.kind === 'section' && item.id === sectionId),
    ) ?? null
  );
}
