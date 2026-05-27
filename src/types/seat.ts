type Aisle = { kind: 'aisle'; id: number };
type FloorItem = Section | Aisle;

/** 층 */
export interface Floor {
  id: number;
  name: string; // 층 이름 (1층, 2층 등)
  items: FloorItem[]; // 해당 층의 구역 배열,  좌>우 배치 순서
}

// 생성 요청용 id x
export type CreateFloorRequest = Omit<Floor, 'items'>;

/** 구역 */
export interface Section {
  kind: 'section';
  id: number;
  name: string; // 구역명 (가구역, 나구역 등)
  cols: number; // 한 행당 좌석 수
  rows: number; // 행 수
  seats: Seat[]; // cols x rows 개
}

export type CreateSectionRequest = Omit<Section, 'kind' | 'seats'>;

/** 좌석 */
export interface Seat {
  id: number;
  row: number;
  col: number;
  assignedMemberId: number | null;
  visible: boolean; // 특정 좌석 안보이게할때, 기본값 true
}

// =====================
// 추가 타입
// =====================

/** 공연장 설정 (전체 좌석 구조) */
export interface VenueConfig {
  id: number;
  name: string; // 공연장 이름
  floors: Floor[]; // 층 배열
  createdAt: string; // 생성일 (ISO 8601)
  updatedAt: string; // 수정일 (ISO 8601)
}
