import { useState } from 'react';
import { generateRowNames, type RowConfig, type RowNameType } from '@/lib/sectionUtils.ts';

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

  // 2단계 상태
  const [rowConfigs, setRowConfigs] = useState<RowConfig[]>([]);

  const previewNames = generateRowNames(rowNameType, startValue, rowCount);
  const totalSeatCount = rowConfigs.reduce((acc, row) => acc + row.seatCount, 0);

  // 열 이름 형식 변경 시 시작값도 형식에 맞게 초기화
  const changeRowNameType = (type: RowNameType) => {
    setRowNameType(type);
    setStartValue(type === 'number' ? '1' : 'A');
  };

  // 1단계 → 2단계 이동 시 rowConfigs 초기화
  const goNext = () => {
    const names = generateRowNames(rowNameType, startValue, rowCount);
    setRowConfigs(names.map((name) => ({ name, seatCount: defaultSeatCount })));
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
    setRowConfigs((prev) => prev.map((row) => ({ ...row, seatCount: Number(bulkCount) })));
  };

  const updateRowSeatCount = (index: number, seatCount: number) => {
    setRowConfigs((prev) => prev.map((row, idx) => (idx === index ? { ...row, seatCount } : row)));
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
    rowConfigs,
    previewNames,
    totalSeatCount,
    goNext,
    goPrevious,
    reset,
    applyBulkSeatCount,
    updateRowSeatCount,
  };
}
