import { useCallback, useEffect, useRef } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import type { Seat } from '@/types';

type DragMode = 'add' | 'remove';

interface UseBulkSeatSelectOptions {
  /** false이면 선택을 시작하지 않음 (일괄 편집 모드가 아니거나 Space로 화면 이동 중) */
  enabled: boolean;
  selectedSeatIds: Set<number>;
  onChange: (ids: Set<number>) => void;
  /** 선택 가능한 좌석인지 (allowOverwrite: Shift를 누른 상태) */
  isSelectable: (seat: Seat, allowOverwrite: boolean) => boolean;
  /** 선택 가능한 최대 좌석 수 (선택 회원의 잔여 티켓) */
  maxCount: number;
  /** 최대 좌석 수를 넘기려 할 때 (드래그 한 번당 한 번만 호출) */
  onLimitExceeded: () => void;
}

/**
 * 좌석 클릭/드래그 다중 선택
 * - mousedown 시작 좌석이 선택돼 있으면 '해제', 아니면 '추가' 모드로 드래그
 * - 클릭은 mousedown에서 바로 토글하므로 click 이벤트는 사용하지 않는다
 * - 드래그 중에는 ref의 작업용 Set을 갱신해 렌더 타이밍과 무관하게 누락 없이 처리
 */
export default function useBulkSeatSelect({
  enabled,
  selectedSeatIds,
  onChange,
  isSelectable,
  maxCount,
  onLimitExceeded,
}: UseBulkSeatSelectOptions) {
  const dragModeRef = useRef<DragMode | null>(null);
  const workingRef = useRef<Set<number>>(new Set());
  const exceededRef = useRef(false);

  // 그리드 밖에서 마우스를 놓아도 드래그 종료
  useEffect(() => {
    const endDrag = () => {
      dragModeRef.current = null;
      exceededRef.current = false;
    };
    window.addEventListener('mouseup', endDrag);
    return () => window.removeEventListener('mouseup', endDrag);
  }, []);

  const apply = useCallback(
    (seat: Seat, mode: DragMode, allowOverwrite: boolean) => {
      const working = workingRef.current;
      if (mode === 'remove') {
        if (!working.delete(seat.id)) return;
      } else {
        if (working.has(seat.id) || !isSelectable(seat, allowOverwrite)) return;
        if (working.size >= maxCount) {
          if (!exceededRef.current) {
            exceededRef.current = true;
            onLimitExceeded();
          }
          return;
        }
        working.add(seat.id);
      }
      onChange(new Set(working));
    },
    [isSelectable, maxCount, onChange, onLimitExceeded],
  );

  const handleSeatMouseDown = useCallback(
    (seat: Seat, e: ReactMouseEvent) => {
      if (!enabled || e.button !== 0) return;
      e.preventDefault(); // 텍스트 선택/포커스 이동 방지
      workingRef.current = new Set(selectedSeatIds);
      exceededRef.current = false;
      const mode: DragMode = workingRef.current.has(seat.id) ? 'remove' : 'add';
      dragModeRef.current = mode;
      apply(seat, mode, e.shiftKey);
    },
    [enabled, selectedSeatIds, apply],
  );

  const handleSeatMouseEnter = useCallback(
    (seat: Seat, e: ReactMouseEvent) => {
      const mode = dragModeRef.current;
      if (!enabled || !mode) return;
      if ((e.buttons & 1) === 0) {
        dragModeRef.current = null; // 창 밖에서 마우스를 놓은 경우
        return;
      }
      apply(seat, mode, e.shiftKey);
    },
    [enabled, apply],
  );

  return { handleSeatMouseDown, handleSeatMouseEnter };
}
