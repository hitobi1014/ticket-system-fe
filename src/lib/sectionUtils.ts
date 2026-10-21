export type RowNameType = 'number' | 'alpha';

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
