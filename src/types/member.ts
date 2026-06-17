export interface Instrument {
  abbr: string;
  name: string;
}

export const INSTRUMENTS: Instrument[] = [
  { abbr: 'Fl', name: '플루트' },
  { abbr: 'Ob', name: '오보에' },
  { abbr: 'Cl', name: '클라리넷' },
  { abbr: 'Fg', name: '파곳' },
  { abbr: 'Hn', name: '호른' },
  { abbr: 'Tr', name: '트럼펫' },
  { abbr: 'Tb', name: '트롬본' },
  { abbr: 'Vn', name: '바이올린' },
  { abbr: 'Va', name: '비올라' },
  { abbr: 'Vc', name: '첼로' },
  { abbr: 'Cb', name: '콘트라베이스' },
];

// 서버 응답용
export interface Member {
  id: number;
  name: string; // 회원 이름
  instrument: Instrument;
  point: number;
  allocatedTickets: number; // 배정된 티켓 수
  color?: string; // 좌석 배정 시 구분 색상 (hex 코드)
}

// 생성 요청용 (id 없음)
export interface CreateMemberRequest {
  name: string; // 회원 이름
  instrumentAbbr: string;
  point: number;
  allocatedTickets: number; // 배정된 티켓 수
  color?: string; // 좌석 배정 시 구분 색상 (hex 코드)
}

/** 티켓 현황 요약 (파생 데이터) */
export interface TicketSummary {
  memberId: number;
  memberName: string;
  allocatedTickets: number; // 배정된 티켓 수
  usedTickets: number; // 사용한 티켓 수 (배정된 좌석 수)
  remainingTickets: number; // 잔여 티켓 (allocatedTickets - usedTickets)
}
