// 서버 응답용
export interface Member {
  id: number;
  name: string; // 회원 이름
  allocatedTickets: number; // 배정된 티켓 수
  color?: string; // 좌석 배정 시 구분 색상 (hex 코드)
}

// 생성 요청용 (id 없음)
export type CreateMemberRequest = Omit<Member, 'id'>;
