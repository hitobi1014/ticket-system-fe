// =====================
// 기본 도메인 타입
// =====================

/** 좌석 */
export interface Seat {
  id: number;
  number: number;      // 좌석 번호 (1, 2, 3...)
  isAisle: boolean;    // 통로 여부 (true면 통로, false면 일반 좌석)
}

/** 구역 */
export interface Zone {
  id: number;
  name: string;        // 구역명 (가구역, 나구역 등)
  seats: Seat[];       // 해당 구역의 좌석 배열
}

/** 층 */
export interface Floor {
  id: number;
  name: string;        // 층 이름 (1층, 2층 등)
  zones: Zone[];       // 해당 층의 구역 배열
}

/** 동호회 회원 */
export interface Member {
  id: number;
  name: string;             // 회원 이름
  allocatedTickets: number; // 배정된 티켓 수
  color: string;            // 좌석 배정 시 구분 색상 (hex 코드)
}

/** 좌석 배정 */
export interface Assignment {
  seatId: number;      // 배정된 좌석 ID
  memberId: number;    // 배정받은 회원 ID
}

// =====================
// 추가 타입
// =====================

/** 좌석 상태 */
export type SeatStatus = 'empty' | 'assigned' | 'aisle';

/** 공연장 설정 (전체 좌석 구조) */
export interface VenueConfig {
  id: number;
  name: string;        // 공연장 이름
  floors: Floor[];     // 층 배열
  createdAt: string;   // 생성일 (ISO 8601)
  updatedAt: string;   // 수정일 (ISO 8601)
}

/** 티켓 현황 요약 (파생 데이터) */
export interface TicketSummary {
  memberId: number;
  memberName: string;
  allocatedTickets: number;  // 배정된 티켓 수
  usedTickets: number;       // 사용한 티켓 수 (배정된 좌석 수)
  remainingTickets: number;  // 잔여 티켓 (allocatedTickets - usedTickets)
}