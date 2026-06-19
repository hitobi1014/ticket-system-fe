/** 좌석 */
export interface Seat {
  id: number;
  seatNumber: number; // ex) 1열 1, 2열 5
  assignedMemberId?: number;
  visible: boolean; // 특정 좌석 안보이게할때, 기본값 true
}
export type CreateSeatRequest = Omit<Seat, 'assignedMemberId' | 'visible'>;
/** 열 */
export interface Rows {
  id: number;
  rowName: string; // 숫자, 문자열 받아야함 표기방법 다양 => ex) A열 1, 01열 1, 1열 1...
  seats: Seat[];
}
export type CreateRowsRequest = Omit<Rows, 'seats'>;

/** 구역 */
export interface Section {
  kind: 'section';
  id: number;
  name: string; // 구역명 (가구역, 나구역 등)
  rows: Rows[];
}
export type CreateSectionRequest = Omit<Section, 'kind' | 'rows'>;

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

// =====================
// 추가 타입
// =====================

/** 공연장 설정 (전체 좌석 구조) */
export interface Venue {
  id: number;
  name: string; // 공연장 이름
  // floors: Floor[]; // 층 배열
  performanceDate: string;
  totalSeats: number;
  address: string;
  createdAt: string; // 생성일 (ISO 8601)
  updatedAt: string; // 수정일 (ISO 8601)
}
