import type {
  Aisle,
  Floor,
  FloorItem,
  FloorLayoutItemRef,
  FloorRow,
  Section,
  UpdateFloorLayoutRequest,
} from '@/types';

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

/** 구역/통로를 놓을 위치: 기존 구역 열의 index 번째 칸 사이, 또는 rowIndex 번째 줄 사이의 새 구역 열 */
export type FloorItemDropTarget =
  | { type: 'row'; floorRowId: number; index: number }
  | { type: 'newRow'; rowIndex: number };

const isSameItem = (item: FloorItem, ref: FloorLayoutItemRef) =>
  item.kind === ref.kind && item.id === ref.id;

/** 임시로 만든 구역 열 id (서버에는 'new'로 전달) */
export const isTempFloorRowId = (id: number) => id < 0;

/**
 * 구역/통로를 이동한 새 구역 열 목록을 반환 (원본은 변경하지 않음)
 * - index/rowIndex는 이동 전 목록 기준이며, 구역이 모두 빠져 빈 구역 열은 제거된다.
 */
export function moveFloorItem(
  rows: FloorRow[],
  ref: FloorLayoutItemRef,
  target: FloorItemDropTarget,
  tempRowId: number,
): FloorRow[] {
  const sourceRow = rows.find((r) => r.items.some((item) => isSameItem(item, ref)));
  const moving = sourceRow?.items.find((item) => isSameItem(item, ref));
  if (!sourceRow || !moving) return rows;
  const sourceIndex = sourceRow.items.indexOf(moving);

  let next = rows.map((r) =>
    r.id === sourceRow.id ? { ...r, items: r.items.filter((item) => item !== moving) } : r,
  );

  if (target.type === 'row') {
    // 같은 줄에서 앞쪽 항목을 뒤로 옮기면 빠진 만큼 위치가 당겨진다
    const index =
      target.floorRowId === sourceRow.id && sourceIndex < target.index
        ? target.index - 1
        : target.index;
    next = next.map((r) =>
      r.id === target.floorRowId
        ? { ...r, items: [...r.items.slice(0, index), moving, ...r.items.slice(index)] }
        : r,
    );
  } else {
    next = [
      ...next.slice(0, target.rowIndex),
      { id: tempRowId, order: 0, items: [moving] },
      ...next.slice(target.rowIndex),
    ];
  }

  return next.filter((r) => r.items.length > 0).map((r, i) => ({ ...r, order: i + 1 }));
}

/** 구역 열 구성이 같은지 비교하기 위한 값 (구역 열 id + 항목 순서) */
export const getFloorLayoutSignature = (rows: FloorRow[]) =>
  rows.map((r) => `${r.id}:${r.items.map((item) => `${item.kind}${item.id}`).join(',')}`).join('|');

export const toFloorLayoutRequest = (rows: FloorRow[]): UpdateFloorLayoutRequest => ({
  rows: rows.map((r) => ({
    floorRowId: isTempFloorRowId(r.id) ? 'new' : r.id,
    items: r.items.map(({ kind, id }) => ({ kind, id })),
  })),
});

/** 층의 보이는 좌석 수 (숨김 처리한 좌석 제외) */
export function getFloorVisibleSeatCount(floor: Floor) {
  return getFloorItems(floor).reduce(
    (total, item) =>
      item.kind === 'section'
        ? total +
          item.rows.reduce((sum, row) => sum + row.seats.filter((seat) => seat.visible).length, 0)
        : total,
    0,
  );
}

/** 전체 층의 보이는 좌석 수 합계 */
export const getTotalVisibleSeatCount = (floors: Floor[]) =>
  floors.reduce((total, floor) => total + getFloorVisibleSeatCount(floor), 0);
