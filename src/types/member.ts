export interface Instrument {
  abbr: string;
  name: string;
}

export const INSTRUMENTS: Instrument[] = [
  { abbr: '지휘', name: '지휘' },
  { abbr: 'Fl', name: '플루트' },
  { abbr: 'Ob', name: '오보에' },
  { abbr: 'Cla', name: '클라리넷' },
  { abbr: 'Fg', name: '파곳' },
  { abbr: 'Hn', name: '호른' },
  { abbr: 'Tp', name: '트럼펫' },
  { abbr: 'Tb', name: '트롬본' },
  { abbr: 'Vn1', name: '퍼스트 바이올린' },
  { abbr: 'Vn2', name: '세컨드 바이올린' },
  { abbr: 'Va', name: '비올라' },
  { abbr: 'Vc', name: '첼로' },
  { abbr: 'Cb', name: '콘트라베이스' },
  { abbr: 'Sax', name: '색소폰' },
  { abbr: 'Per', name: '퍼커션' },
];

// 서버 응답용
export interface Member {
  id: number;
  name: string; // 회원 이름
  instrument: Instrument;
  point: number;
  allocatedTickets: number; // 배정된 티켓 수
  color?: string; // 좌석 배정 시 구분 색상 (hex 코드)
  seq: number; // 정렬 우선순위 번호
  rank: number; // 출석점수 기반 순위
}

// 생성 요청용 (id 없음)
export interface CreateMemberRequest {
  name: string; // 회원 이름
  instrumentAbbr: string;
  point: number;
  allocatedTickets: number; // 배정된 티켓 수
  color?: string; // 좌석 배정 시 구분 색상 (hex 코드)
}

export interface SyncMemberResponse {
  success: boolean;
  stats: {
    inserted: number; // 신규 추가된 회원 수
    updated: number; // 수정된 회원 수
    deleted: number; // 삭제된 회원 수
    total: number; // 전체 처리 건수
  };
  members: Member[];
  syncedAt: string;
}

/** 티켓 현황 요약 (파생 데이터) */
export interface TicketSummary {
  memberId: number;
  memberName: string;
  allocatedTickets: number; // 배정된 티켓 수
  usedTickets: number; // 사용한 티켓 수 (배정된 좌석 수)
  remainingTickets: number; // 잔여 티켓 (allocatedTickets - usedTickets)
}
