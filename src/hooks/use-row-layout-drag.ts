import { useCallback, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import type { RowLayout } from '@/types';
import { normalizeAngle, SEAT_SIZE_PX } from '@/lib/rowLayoutUtils.ts';

const DRAG_THRESHOLD_PX = 3;
const SNAP_DEGREE = 5; // Shift를 누르고 회전하면 5° 단위로 스냅

interface UseRowLayoutDragOptions {
  enabled: boolean;
  /** 확대/축소 배율 계산용 (회전/이동되지 않는 열 컨테이너) */
  containerRef: RefObject<HTMLElement | null>;
  getLayoutById: (rowId: number) => RowLayout;
  /** 드래그 시작 시 한 번 호출 (되돌리기 이력 저장용) */
  onBegin: () => void;
  onChange: (rowId: number, layout: RowLayout) => void;
}

interface DragState {
  mode: 'move' | 'rotate';
  rowId: number;
  startX: number;
  startY: number;
  startLayout: RowLayout;
  center: { x: number; y: number };
  active: boolean;
}

/**
 * 열 배치 편집 드래그
 * - `[data-row-id]` 열 본체를 드래그하면 이동, `[data-rotate-handle]`을 드래그하면 회전
 * - 이동량은 화면 픽셀을 확대 배율·좌석 크기로 나눠 "좌석 칸" 단위로 변환
 */
export default function useRowLayoutDrag({
  enabled,
  containerRef,
  getLayoutById,
  onBegin,
  onChange,
}: UseRowLayoutDragOptions) {
  const stateRef = useRef<DragState | null>(null);
  const draggedRef = useRef(false);

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!enabled || e.button !== 0) return;
      const target = e.target as HTMLElement;
      const rowEl = target.closest<HTMLElement>('[data-row-id]');
      if (!rowEl) return;

      const rect = rowEl.getBoundingClientRect();
      const rowId = Number(rowEl.dataset.rowId);
      draggedRef.current = false;
      stateRef.current = {
        mode: target.closest('[data-rotate-handle]') ? 'rotate' : 'move',
        rowId,
        startX: e.clientX,
        startY: e.clientY,
        startLayout: getLayoutById(rowId),
        center: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
        active: false,
      };
    },
    [enabled, getLayoutById],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const state = stateRef.current;
      if (!state) return;

      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;
      if (!state.active) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
        state.active = true;
        draggedRef.current = true;
        e.currentTarget.setPointerCapture(e.pointerId); // 드래그 확정 후에만 캡처 (일반 클릭 유지)
        onBegin();
      }

      if (state.mode === 'move') {
        const container = containerRef.current;
        const scale = container ? container.getBoundingClientRect().width / container.offsetWidth : 1;
        const unit = (scale || 1) * SEAT_SIZE_PX.setup;
        onChange(state.rowId, {
          ...state.startLayout,
          offsetX: state.startLayout.offsetX + dx / unit,
          offsetY: state.startLayout.offsetY + dy / unit,
        });
      } else {
        // 핸들이 열 위쪽(-90°)에 있으므로 +90°를 더해 회전각으로 변환
        let angle = (Math.atan2(e.clientY - state.center.y, e.clientX - state.center.x) * 180) / Math.PI + 90;
        angle = normalizeAngle(angle);
        if (e.shiftKey) angle = Math.round(angle / SNAP_DEGREE) * SNAP_DEGREE;
        onChange(state.rowId, { ...state.startLayout, rotation: angle });
      }
    },
    [containerRef, onBegin, onChange],
  );

  const handlePointerUp = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (!stateRef.current) return;
    stateRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  /** 드래그 직후 발생하는 click을 한 번 소비 (true면 호출 측에서 무시) */
  const consumeClick = useCallback(() => {
    const wasDragged = draggedRef.current;
    draggedRef.current = false;
    return wasDragged;
  }, []);

  return {
    consumeClick,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
    },
  };
}
