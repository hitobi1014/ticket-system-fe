/** 좌석 */
export interface Seat {
  id: number;
  seatNumber: number | null; // ex) 1열 1, 2열 5 (서버가 계산. 숨긴 좌석은 null)
  assignedMemberId?: number;
  visible: boolean; // 특정 좌석 안보이게할때, 기본값 true
  guestName?: string;
  memo?: string;
}
export interface CreateSeatRequest {
  addSeatCount: number;
}
/**
 * 열 화면 배치 (표시 전용, 기본값 0)
 * - offsetX/offsetY: 좌석 한 칸 크기를 1로 한 상대 단위 (오른쪽/아래가 +) — 화면별 좌석 크기가 달라도 같은 모양
 * - rotation: 열 중심 기준 회전 각도(degree, 시계 방향이 +)
 */
export interface RowLayout {
  offsetX: number;
  offsetY: number;
  rotation: number;
}
/** 열 (좌석이 있는 일반 열) */
export interface Rows {
  kind: 'row';
  id: number;
  rowName: string; // 숫자, 문자열 받아야함 표기방법 다양 => ex) A열 1, 01열 1, 1열 1...
  seats: Seat[];
  layout?: RowLayout; // 서버가 내려주는 화면 배치 (없으면 기본값 0)
}
/** 빈 줄 (좌석 없이 1줄 높이의 빈 공간만 차지, 열 번호를 소비하지 않음) */
export interface GapRows {
  kind: 'gap';
  id: number;
  rowName: null;
  seats: Seat[]; // 항상 빈 배열
  layout?: RowLayout;
}
/** 열 배치 일괄 저장 요청 항목 */
export interface RowLayoutUpdate extends RowLayout {
  rowId: number;
}
/** 구역 내 한 줄 (서버가 화면 순서대로 내려줌 — 재정렬 금지) */
export type SectionRow = Rows | GapRows;
export type CreateRowsRequest = Omit<Rows, 'kind' | 'id' | 'seats' | 'layout'>;
/** 구역 생성 요청의 rowConfig 항목 (배열 순서가 곧 화면 순서, 위→아래) */
export type SectionRowConfig =
  | { type: 'ROW'; name: string; seatCount: number }
  | { type: 'GAP' }; // 빈 줄: name, seatCount 없음

/**
 * 구역 좌석 번호 방식
 * - PER_ROW: 각 열별로 1번부터 시작 (기존 방식)
 * - SECTION: 구역 전체에서 번호를 이어서 부여 (숨긴 좌석은 번호를 소비하지 않음)
 *   - start: 번호가 시작되는 방향 (LEFT: 좌→우 증가, RIGHT: 우→좌 증가)
 *   - pattern: SEQUENTIAL(모든 행 같은 방향) / ZIGZAG(행마다 방향 반대, ㄹ자)
 */
export type SeatNumbering =
  | { mode: 'PER_ROW' }
  | { mode: 'SECTION'; start: 'LEFT' | 'RIGHT'; pattern: 'SEQUENTIAL' | 'ZIGZAG' };

/** 구역 */
export interface Section {
  kind: 'section';
  id: number;
  name: string; // 구역명 (가구역, 나구역 등)
  seatNumbering?: SeatNumbering; // 서버가 내려주는 현재 번호 방식 (없으면 PER_ROW)
  rows: SectionRow[];
}
export type CreateSectionRequest = Omit<Section, 'kind' | 'rows' | 'seatNumbering'>;

export interface AssignSeatRequest {
  seatIds: number[];
  memberId: number;
}
export type UnAssignSeatRequest = Omit<AssignSeatRequest, 'memberId'>;

export interface SeatGuestNameUpdate {
  seatId: number;
  guestName: string;
}
export interface UpdateSeatGuestNamesRequest {
  updates: SeatGuestNameUpdate[];
}

export interface Aisle {
  id: number;
  kind: 'aisle';
  label?: string;
}
export interface CreateAisleRequest {
  label?: string;
  sectionId: number; // 기준 section
  floorRowId: number;
  direction: 'left' | 'right'; // 해당 section 좌/우
}

export type FloorItem = Section | Aisle;

export interface FloorRow {
  id: number;
  /*
     층에서 구역 열
     1열 [VIP-A구역] [VIP-B구역] [일반B구역]
     2열 [C구역]
     3열 [D구역]
   */
  order: number;
  items: FloorItem[];
}

/** 층 */
export interface Floor {
  id: number;
  // todo 얘도 순서 필요하면?
  name: string; // 층 이름 (1층, 2층 등)
  rows: FloorRow[]; // 해당 층의 구역 배열,  좌>우 배치 순서
}

// 생성 요청용
export type CreateFloorRequest = Omit<Floor, 'id' | 'rows'>;
