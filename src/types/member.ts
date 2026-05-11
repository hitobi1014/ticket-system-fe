// 서버 응답용
export interface Member {
  id: number;
  name: string; // 회원 이름
  allocatedTickets: number; // 배정된 티켓 수
  color?: string; // 좌석 배정 시 구분 색상 (hex 코드)
}

// 생성 요청용 (id 없음)
export type CreateMemberRequest = Omit<Member, 'id'>;

/** 티켓 현황 요약 (파생 데이터) */
export interface TicketSummary {
  memberId: number;
  memberName: string;
  allocatedTickets: number; // 배정된 티켓 수
  usedTickets: number; // 사용한 티켓 수 (배정된 좌석 수)
  remainingTickets: number; // 잔여 티켓 (allocatedTickets - usedTickets)
}
