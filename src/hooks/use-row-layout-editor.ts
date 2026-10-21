import { useCallback, useEffect, useState } from 'react';
import type { RowLayout, RowLayoutUpdate, Rows, Section, SectionRow } from '@/types';
import {
  DEFAULT_ROW_LAYOUT,
  isSameRowLayout,
  normalizeRowLayout,
} from '@/lib/rowLayoutUtils.ts';

/** 편집 중 변경된 열만 담는 초안 (rowId -> layout). 서버 데이터는 건드리지 않는다 */
type Draft = Record<number, RowLayout>;

const MOVE_STEP = 0.1; // 화살표 키 이동 단위(좌석 칸)
const ROTATE_STEP = 0.5; // Alt+좌우 회전 단위(도)

const isTextInput = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/**
 * 구역의 열 배치 편집 상태 (로컬 초안 + 되돌리기 이력)
 * - 저장 전까지는 서버 데이터와 분리된 초안으로만 관리한다
 * - 키보드: 화살표 = 0.1칸 이동, Alt+←/→ = 0.5° 회전, Ctrl/Cmd+Z = 되돌리기
 */
export default function useRowLayoutEditor(section: Section | null, selectedRowId: number | undefined) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [history, setHistory] = useState<Draft[]>([]);
  const isEditing = draft !== null;

  const getLayout = useCallback(
    (row: SectionRow): RowLayout => draft?.[row.id] ?? row.layout ?? DEFAULT_ROW_LAYOUT,
    [draft],
  );

  const getLayoutById = useCallback(
    (rowId: number): RowLayout => {
      const row = section?.rows.find((r) => r.id === rowId);
      return row ? getLayout(row) : DEFAULT_ROW_LAYOUT;
    },
    [section, getLayout],
  );

  const start = useCallback(() => {
    setDraft({});
    setHistory([]);
  }, []);

  const cancel = useCallback(() => {
    setDraft(null);
    setHistory([]);
  }, []);

  /** 되돌리기 이력에 현재 초안을 저장 (제스처 시작/수치 변경 직전에 호출) */
  const pushHistory = useCallback(() => {
    setHistory((prev) => (draft ? [...prev, draft] : prev));
  }, [draft]);

  const update = useCallback((rowId: number, layout: RowLayout) => {
    setDraft((prev) => (prev ? { ...prev, [rowId]: normalizeRowLayout(layout) } : prev));
  }, []);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      setDraft(prev[prev.length - 1]);
      return prev.slice(0, -1);
    });
  }, []);

  /** 선택한 열 하나를 기본 배치로 되돌림 */
  const resetRow = useCallback(
    (rowId: number) => {
      pushHistory();
      update(rowId, DEFAULT_ROW_LAYOUT);
    },
    [pushHistory, update],
  );

  /**
   * 열 간격 균등 적용 (세로 방향). 첫 번째 열의 Y 위치를 기준으로 고정하고 이후 열을 같은 간격으로 재배치
   * - step 지정: 기본 열 간격에 더해지는 추가 간격(좌석 칸 단위, 음수면 좁힘)
   * - step 생략: 현재 1열과 2열 사이의 간격을 모든 열에 동일하게 적용
   * X 위치와 회전은 유지하며 빈 줄은 대상에서 제외한다.
   */
  const distributeRows = useCallback(
    (step?: number) => {
      if (!section || !draft) return;
      const seatRows = section.rows.filter((r): r is Rows => r.kind === 'row');
      if (seatRows.length < 2) return;

      const first = getLayout(seatRows[0]);
      const gap = step ?? getLayout(seatRows[1]).offsetY - first.offsetY;

      pushHistory();
      setDraft((prev) => {
        const next: Draft = { ...prev };
        seatRows.forEach((row, index) => {
          const current = prev?.[row.id] ?? row.layout ?? DEFAULT_ROW_LAYOUT;
          next[row.id] = normalizeRowLayout({ ...current, offsetY: first.offsetY + index * gap });
        });
        return next;
      });
    },
    [section, draft, getLayout, pushHistory],
  );

  /** 서버에 보낼 변경분 (원본과 달라진 열만) */
  const buildPayload = useCallback((): RowLayoutUpdate[] => {
    if (!section || !draft) return [];
    return section.rows.flatMap((row) => {
      const next = draft[row.id];
      if (!next || isSameRowLayout(next, row.layout ?? DEFAULT_ROW_LAYOUT)) return [];
      return [{ rowId: row.id, ...next }];
    });
  }, [section, draft]);

  const isDirty = buildPayload().length > 0;

  // 키보드 미세 조정
  useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTextInput(e.target)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
        return;
      }
      if (selectedRowId == null || !e.key.startsWith('Arrow')) return;

      const current = getLayoutById(selectedRowId);
      let next: RowLayout | null = null;
      if (e.altKey) {
        if (e.key === 'ArrowLeft') next = { ...current, rotation: current.rotation - ROTATE_STEP };
        if (e.key === 'ArrowRight') next = { ...current, rotation: current.rotation + ROTATE_STEP };
      } else {
        if (e.key === 'ArrowLeft') next = { ...current, offsetX: current.offsetX - MOVE_STEP };
        if (e.key === 'ArrowRight') next = { ...current, offsetX: current.offsetX + MOVE_STEP };
        if (e.key === 'ArrowUp') next = { ...current, offsetY: current.offsetY - MOVE_STEP };
        if (e.key === 'ArrowDown') next = { ...current, offsetY: current.offsetY + MOVE_STEP };
      }
      if (!next) return;
      e.preventDefault();
      pushHistory();
      update(selectedRowId, next);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, selectedRowId, getLayoutById, pushHistory, update, undo]);

  return {
    isEditing,
    isDirty,
    canUndo: history.length > 0,
    getLayout,
    getLayoutById,
    start,
    cancel,
    pushHistory,
    update,
    undo,
    resetRow,
    distributeRows,
    buildPayload,
  };
}
