import { useState } from 'react';
import {
  DEFAULT_SEAT_NUMBERING,
  generateRowNames,
  type RowNameType,
} from '@/lib/sectionUtils.ts';
import type { SeatNumbering, SectionRowConfig } from '@/types';

/**
 * 구역 추가 다이얼로그의 단계/폼 상태와 핸들러
 */
export default function useAddSectionForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [bulkCount, setBulkCount] = useState(1);
  const [selectRowId, setSelectRowId] = useState<number | 'new'>('new');

  // 1단계 상태
  const [sectionName, setSectionName] = useState('');
  const [rowCount, setRowCount] = useState(7); // 열 수
  const [defaultSeatCount, setDefaultSeatCount] = useState(15); // 기본 좌석 수
  const [rowNameType, setRowNameType] = useState<RowNameType>('number');
  const [startValue, setStartValue] = useState('1');
  const [seatNumbering, setSeatNumbering] = useState<SeatNumbering>(DEFAULT_SEAT_NUMBERING);

  // 2단계 상태
  const [rowConfigs, setRowConfigs] = useState<SectionRowConfig[]>([]);

  const previewNames = generateRowNames(rowNameType, startValue, rowCount);
  // 빈 줄(GAP)은 좌석이 없으므로 일반 열만 합산
  const totalSeatCount = rowConfigs.reduce(
    (acc, row) => (row.type === 'ROW' ? acc + row.seatCount : acc),
    0,
  );

  // 열 이름 형식 변경 시 시작값도 형식에 맞게 초기화
  const changeRowNameType = (type: RowNameType) => {
    setRowNameType(type);
    setStartValue(type === 'number' ? '1' : 'A');
  };

  // 1단계 → 2단계 이동 시 rowConfigs 초기화
  const goNext = () => {
    const names = generateRowNames(rowNameType, startValue, rowCount);
    setRowConfigs(
      names.map((name): SectionRowConfig => ({ type: 'ROW', name, seatCount: defaultSeatCount })),
    );
    setStep(2);
  };

  // 2단계 > 1단계 이동
  const goPrevious = () => {
    setStep(1);
  };

  // Dialog 닫을 때 상태 초기화
  const reset = () => {
    setStep(1);
    setSectionName('');
    // 나머지 초기화...
  };

  const applyBulkSeatCount = () => {
    setRowConfigs((prev) =>
      prev.map((row) => (row.type === 'ROW' ? { ...row, seatCount: Number(bulkCount) } : row)),
    );
  };

  const updateRowSeatCount = (index: number, seatCount: number) => {
    setRowConfigs((prev) =>
      prev.map((row, idx) => (idx === index && row.type === 'ROW' ? { ...row, seatCount } : row)),
    );
  };

  // 해당 열 바로 아래에 빈 줄 삽입
  const insertGapAfter = (index: number) => {
    setRowConfigs((prev) => [...prev.slice(0, index + 1), { type: 'GAP' }, ...prev.slice(index + 1)]);
  };

  const removeGap = (index: number) => {
    setRowConfigs((prev) => prev.filter((row, idx) => !(idx === index && row.type === 'GAP')));
  };

  return {
    step,
    bulkCount,
    setBulkCount,
    selectRowId,
    setSelectRowId,
    sectionName,
    setSectionName,
    rowCount,
    setRowCount,
    defaultSeatCount,
    setDefaultSeatCount,
    rowNameType,
    changeRowNameType,
    startValue,
    setStartValue,
    seatNumbering,
    setSeatNumbering,
    rowConfigs,
    previewNames,
    totalSeatCount,
    goNext,
    goPrevious,
    reset,
    applyBulkSeatCount,
    updateRowSeatCount,
    insertGapAfter,
    removeGap,
  };
}
