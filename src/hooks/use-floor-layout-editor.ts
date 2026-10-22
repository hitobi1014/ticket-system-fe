import { useCallback, useRef, useState } from 'react';
import { getFloorLayoutSignature, moveFloorItem } from '@/lib/floorUtils.ts';
import type { FloorItemDropTarget } from '@/lib/floorUtils.ts';
import type { FloorLayoutItemRef, FloorRow } from '@/types';

/**
 * 구역 열 재배치 초안 편집 (저장 전까지 서버/스토어에는 반영하지 않음)
 * - `open(rows)`로 현재 층의 구역 열을 초안으로 복사
 * - 새로 만든 구역 열은 음수 임시 id를 사용
 */
export default function useFloorLayoutEditor() {
  const [draft, setDraft] = useState<FloorRow[]>([]);
  const [original, setOriginal] = useState<FloorRow[]>([]);
  const tempRowIdRef = useRef(0);

  const open = useCallback((rows: FloorRow[]) => {
    tempRowIdRef.current = 0;
    setDraft(rows);
    setOriginal(rows);
  }, []);

  const move = useCallback((ref: FloorLayoutItemRef, target: FloorItemDropTarget) => {
    tempRowIdRef.current -= 1;
    const tempRowId = tempRowIdRef.current;
    setDraft((prev) => moveFloorItem(prev, ref, target, tempRowId));
  }, []);

  const reset = useCallback(() => setDraft(original), [original]);

  const isDirty = getFloorLayoutSignature(draft) !== getFloorLayoutSignature(original);

  return { draft, isDirty, open, move, reset };
}
