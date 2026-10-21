import { useCallback, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

const DRAG_THRESHOLD_PX = 4; // 이 거리 이상 움직여야 클릭이 아닌 드래그로 판단

export interface SelectionBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface UseDragSelectOptions {
  /** false이면 드래그 선택을 시작하지 않음 */
  enabled: boolean;
  /** 현재 선택 상태 (드래그 시작 시점 기준으로 유지) */
  selectedIds: Set<number>;
  onChange: (ids: Set<number>) => void;
  /** 선택 가능한 좌석 요소를 찾을 때 사용하는 속성 */
  itemSelector?: string;
}

const intersects = (a: DOMRect, b: SelectionBox) =>
  a.left < b.left + b.width &&
  a.right > b.left &&
  a.top < b.top + b.height &&
  a.bottom > b.top;

/**
 * 컨테이너 안의 `[data-seat-id][data-selectable="true"]` 요소를 사각형 드래그로 추가 선택
 * - 화면 좌표(getBoundingClientRect) 기준이라 확대/축소 배율과 무관하게 동작
 * - 드래그가 끝난 직후의 click은 `consumeClick`으로 무시해야 한다
 */
export default function useDragSelect({
  enabled,
  selectedIds,
  onChange,
  itemSelector = '[data-seat-id][data-selectable="true"]',
}: UseDragSelectOptions) {
  const [box, setBox] = useState<SelectionBox | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const baseRef = useRef<Set<number>>(new Set());
  const draggedRef = useRef(false);

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!enabled || e.button !== 0) return;
      startRef.current = { x: e.clientX, y: e.clientY };
      baseRef.current = new Set(selectedIds);
      draggedRef.current = false;
    },
    [enabled, selectedIds],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const start = startRef.current;
      if (!start) return;

      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (!draggedRef.current) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
        // 드래그로 확정된 뒤에만 포인터를 캡처해야 일반 클릭(좌석 토글)이 방해받지 않음
        e.currentTarget.setPointerCapture(e.pointerId);
        draggedRef.current = true;
      }

      const next: SelectionBox = {
        left: Math.min(start.x, e.clientX),
        top: Math.min(start.y, e.clientY),
        width: Math.abs(dx),
        height: Math.abs(dy),
      };
      setBox(next);

      const ids = new Set(baseRef.current);
      e.currentTarget.querySelectorAll<HTMLElement>(itemSelector).forEach((el) => {
        if (intersects(el.getBoundingClientRect(), next)) {
          ids.add(Number(el.dataset.seatId));
        }
      });
      onChange(ids);
    },
    [itemSelector, onChange],
  );

  const handlePointerUp = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (!startRef.current) return;
    startRef.current = null;
    setBox(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  /** 드래그 직후 발생하는 click을 한 번 소비. true면 호출 측에서 click을 무시해야 함 */
  const consumeClick = useCallback(() => {
    const wasDragged = draggedRef.current;
    draggedRef.current = false;
    return wasDragged;
  }, []);

  return {
    box,
    consumeClick,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
    },
  };
}
