import type { InstrumentAbbr } from '@/types/member.ts';

export interface LoginRequest {
  memberId: number;
  memberCode: string;
}

export interface LoginResponse {
  accessToken: string;
}

// 인증 없이 조회 가능한 회원 정보 (최초 로그인 시 파트/이름 선택용)
export interface NonValidateMember {
  id: number;
  name: string;
  instrumentAbbr: InstrumentAbbr;
}
