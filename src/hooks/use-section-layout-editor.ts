import { useCallback, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import type { Section, SectionLayout } from '@/types';
import {
  DEFAULT_SECTION_LAYOUT,
  isSameSectionLayout,
  normalizeSectionLayout,
  SEAT_SIZE_PX,
} from '@/lib/rowLayoutUtils.ts';

const DRAG_THRESHOLD_PX = 3;

interface DragState {
  startX: number;
  startY: number;
  startLayout: SectionLayout;
  active: boolean;
}

/**
 * 구역 화면 배치 편집 상태 (로컬 초안 + 되돌리기 이력)
 * - 저장 전까지는 서버 데이터와 분리된 초안으로만 관리한다
 * - 구역 헤더(`handlers`)를 드래그하면 이동, 회전/이어붙이기는 툴바에서 조정
 * @param wrapperRef 회전/이동되지 않는 구역 바깥 래퍼 (확대/축소 배율 계산용)
 */
export default function useSectionLayoutEditor(
  section: Section | null,
  wrapperRef: RefObject<HTMLElement | null>,
) {
  const [draft, setDraft] = useState<SectionLayout | null>(null);
  const [history, setHistory] = useState<SectionLayout[]>([]);
  const dragRef = useRef<DragState | null>(null);
  const draggedRef = useRef(false);
  const isEditing = draft !== null;

  const original = section?.layout ?? DEFAULT_SECTION_LAYOUT;
  const layout = draft ?? original;

  const start = useCallback(() => {
    setDraft(section?.layout ?? DEFAULT_SECTION_LAYOUT);
    setHistory([]);
  }, [section]);

  const cancel = useCallback(() => {
    setDraft(null);
    setHistory([]);
    dragRef.current = null;
  }, []);

  /** 되돌리기 이력에 현재 초안을 저장 (제스처 시작/수치 변경 직전에 호출) */
  const pushHistory = useCallback(() => {
    setHistory((prev) => (draft ? [...prev, draft] : prev));
  }, [draft]);

  const update = useCallback((next: SectionLayout) => {
    setDraft(normalizeSectionLayout(next));
  }, []);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      setDraft(prev[prev.length - 1]);
      return prev.slice(0, -1);
    });
  }, []);

  const reset = useCallback(() => {
    pushHistory();
    setDraft(DEFAULT_SECTION_LAYOUT);
  }, [pushHistory]);

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!draft || e.button !== 0) return;
      draggedRef.current = false;
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startLayout: draft,
        active: false,
      };
    },
    [draft],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const state = dragRef.current;
      if (!state) return;

      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;
      if (!state.active) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
        state.active = true;
        draggedRef.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        pushHistory();
      }

      const wrapper = wrapperRef.current;
      const scale = wrapper ? wrapper.getBoundingClientRect().width / wrapper.offsetWidth : 1;
      const unit = (scale || 1) * SEAT_SIZE_PX.setup;
      update({
        ...state.startLayout,
        offsetX: state.startLayout.offsetX + dx / unit,
        offsetY: state.startLayout.offsetY + dy / unit,
      });
    },
    [wrapperRef, pushHistory, update],
  );

  const handlePointerUp = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
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

  const isDirty = draft !== null && !isSameSectionLayout(draft, original);

  return {
    isEditing,
    isDirty,
    canUndo: history.length > 0,
    layout,
    start,
    cancel,
    pushHistory,
    update,
    undo,
    reset,
    consumeClick,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
    },
  };
}
