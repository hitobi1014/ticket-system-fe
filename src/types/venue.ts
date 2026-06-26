export type StagePosition = 'front' | 'back' | 'left' | 'right';

/** 공연장 설정 (전체 좌석 구조) */
export interface Venue {
  id: number;
  name: string; // 공연장 이름
  // floors: Floor[]; // 층 배열
  performanceDate: string;
  totalSeats: number;
  address: string;
  stagePosition: StagePosition;

  createdAt: string; // 생성일 (ISO 8601)
  updatedAt: string; // 수정일 (ISO 8601)
}

export type CreateVenueRequest = Omit<Venue, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateVenueRequest = Omit<Venue, 'id' | 'createdAt' | 'updatedAt'>;
