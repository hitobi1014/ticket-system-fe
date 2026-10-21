import type { SeatNumbering, Section, SectionRowConfig } from '@/types';

export type RowNameType = 'number' | 'alpha';

export const DEFAULT_SEAT_NUMBERING: SeatNumbering = { mode: 'PER_ROW' };

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

/**
 * 한 열의 좌석 번호 (화면 좌→우 순서)
 * @param rowIndex - 빈 줄을 제외한 열의 순번 (0부터)
 * @param offset - 이 열 앞까지 구역에서 사용된 좌석 수
 */
const buildRowSeatNumbers = (
  numbering: SeatNumbering,
  rowIndex: number,
  offset: number,
  seatCount: number,
): number[] => {
  const count = Math.max(seatCount, 0);
  if (numbering.mode === 'PER_ROW') {
    return Array.from({ length: count }, (_, i) => i + 1);
  }
  const nums = Array.from({ length: count }, (_, i) => offset + i + 1);
  // 왼쪽 시작이면 좌→우 증가, 오른쪽 시작이면 우→좌 증가. 지그재그는 홀수 열에서 방향 반전
  const reversed = (numbering.start === 'RIGHT') !== (numbering.pattern === 'ZIGZAG' && rowIndex % 2 === 1);
  return reversed ? nums.reverse() : nums;
};

/**
 * 좌석 번호 방식 미리보기용 번호 배열 (행 × 좌석, 화면 좌→우 기준)
 * @example { SECTION, LEFT, ZIGZAG } 3행×4석 -> [[1,2,3,4],[8,7,6,5],[9,10,11,12]]
 */
export const buildNumberingPreview = (
  numbering: SeatNumbering,
  rowCount = 3,
  seatCount = 4,
): number[][] =>
  Array.from({ length: rowCount }, (_, r) =>
    buildRowSeatNumbers(numbering, r, r * seatCount, seatCount),
  );

/**
 * 구역 생성 2단계의 열 설정(rowConfigs)에 번호 방식을 적용한 좌석 번호
 * 반환 배열은 rowConfigs와 같은 순서이며, 빈 줄(GAP)은 null (번호를 소비하지 않음)
 */
export const buildConfigSeatNumbers = (
  configs: SectionRowConfig[],
  numbering: SeatNumbering,
): (number[] | null)[] => {
  let rowIndex = 0;
  let offset = 0;
  return configs.map((config) => {
    if (config.type === 'GAP') return null;
    const nums = buildRowSeatNumbers(numbering, rowIndex, offset, config.seatCount);
    rowIndex += 1;
    offset += Math.max(config.seatCount, 0);
    return nums;
  });
};

/**
 * 구역 설정 화면용 좌석 번호 미리보기 (숨김 처리 전 힌트)
 * 선택된 좌석의 표시 상태가 반전된다고 가정하고, 구역의 번호 방식에 따라 번호를 다시 계산한다.
 * - 서버 데이터는 건드리지 않는 파생 값이며, 실제 번호는 숨김 처리 후 서버 응답으로 갱신됨
 * - 반환: seatId -> 미리보기 번호 (숨겨질 좌석은 null)
 * @example [1][숨김][2][3][숨김][4]에서 2번째(숨김)와 3번째(2)를 선택 -> [1][2][ ][3][ ][4]
 */
export const buildSeatNumberPreview = (
  section: Section,
  selectedSeatIds: Set<number>,
): Map<number, number | null> => {
  const numbering = section.seatNumbering ?? DEFAULT_SEAT_NUMBERING;
  const preview = new Map<number, number | null>();
  let counter = 0;
  let rowIndex = 0;

  for (const row of section.rows) {
    if (row.kind === 'gap') continue;
    if (numbering.mode === 'PER_ROW') counter = 0;

    // 구역별 번호 방식의 행 내부 번호 진행 방향 (서버 규칙과 동일)
    const reversed =
      numbering.mode === 'SECTION' &&
      (numbering.start === 'RIGHT') !== (numbering.pattern === 'ZIGZAG' && rowIndex % 2 === 1);
    const seats = reversed ? [...row.seats].reverse() : row.seats;

    for (const seat of seats) {
      const willBeVisible = selectedSeatIds.has(seat.id) ? !seat.visible : seat.visible;
      counter += willBeVisible ? 1 : 0;
      preview.set(seat.id, willBeVisible ? counter : null);
    }
    rowIndex += 1;
  }
  return preview;
};

/** 번호 방식 요약 문구 (ex. 구역별 · 왼쪽 시작 · 지그재그) */
export const describeSeatNumbering = (numbering: SeatNumbering): string => {
  if (numbering.mode === 'PER_ROW') return '열별 번호';
  const start = numbering.start === 'LEFT' ? '왼쪽 시작' : '오른쪽 시작';
  const pattern = numbering.pattern === 'ZIGZAG' ? '지그재그' : '순차';
  return `구역별 · ${start} · ${pattern}`;
};
