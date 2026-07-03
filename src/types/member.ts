export interface Instrument {
  abbr: string;
  name: string;
}

export const INSTRUMENTS = {
  지휘: '지휘',
  Pf: '피아노',
  Fl: '플루트',
  Ob: '오보에',
  Cla: '클라리넷',
  Hn: '호른',
  Tp: '트럼펫',
  Trb: '트롬본',
  Vn1: '1st 바이올린',
  Vn2: '2nd 바이올린',
  Va: '비올라',
  Vc: '첼로',
  Cb: '콘트라베이스',
  Sax: '색소폰',
  Per: '퍼커션',
} as const;

export type InstrumentAbbr = keyof typeof INSTRUMENTS;
export type InstrumentName = typeof INSTRUMENTS[InstrumentAbbr];

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
  instrumentAbbr: InstrumentAbbr;
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
