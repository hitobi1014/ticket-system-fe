import type { SeatNumbering } from '@/types';

export type RowNameType = 'number' | 'alpha';

export const DEFAULT_SEAT_NUMBERING: SeatNumbering = { mode: 'PER_ROW' };

/**
 * 좌석 번호 방식 미리보기용 번호 배열 (행 × 좌석, 화면 좌→우 기준)
 * @example { SECTION, LEFT, ZIGZAG } 3행×4석 -> [[1,2,3,4],[8,7,6,5],[9,10,11,12]]
 */
export const buildNumberingPreview = (
  numbering: SeatNumbering,
  rowCount = 3,
  seatCount = 4,
): number[][] => {
  return Array.from({ length: rowCount }, (_, r) => {
    const ascending = Array.from({ length: seatCount }, (_, i) => i + 1);
    if (numbering.mode === 'PER_ROW') return ascending;

    const base = r * seatCount;
    const nums = ascending.map((n) => base + n);
    // 왼쪽 시작이면 좌→우 증가, 오른쪽 시작이면 우→좌 증가. 지그재그는 홀수 행에서 방향 반전
    const reversed = (numbering.start === 'RIGHT') !== (numbering.pattern === 'ZIGZAG' && r % 2 === 1);
    return reversed ? [...nums].reverse() : nums;
  });
};

/**
 * 입력받은 숫자 또는 알파벳으로 순차적으로 값 생성
 * */
export const generateRowNames = (
  type: 'number' | 'alpha' | 'custom',
  startValue: string,
  rowCount: number,
): string[] => {
  if (type === 'number') {
    return Array.from({ length: rowCount }, (_, i) => String(Number(startValue) + i));
  }
  if (type === 'alpha') {
    return Array.from({ length: rowCount }, (_, i) =>
      String.fromCharCode(startValue.charCodeAt(0) + i),
    );
  }
  return Array.from({ length: rowCount }, () => '');
};
