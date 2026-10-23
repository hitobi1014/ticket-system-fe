export interface MemberColor {
  name: string;
  hex: string;
}

/** 무지개 단색 계열 8색 */
export const RAINBOW_COLORS: MemberColor[] = [
  { name: '빨강', hex: '#ef4444' },
  { name: '주황', hex: '#f97316' },
  { name: '노랑', hex: '#facc15' },
  { name: '연두', hex: '#84cc16' },
  { name: '초록', hex: '#22c55e' },
  { name: '파랑', hex: '#3b82f6' },
  { name: '남색', hex: '#4338ca' },
  { name: '보라', hex: '#a855f7' },
];

/** 무지개 색과 같은 색상의 파스텔톤 8색 */
export const PASTEL_COLORS: MemberColor[] = [
  { name: '파스텔 빨강', hex: '#fca5a5' },
  { name: '파스텔 주황', hex: '#fdba74' },
  { name: '파스텔 노랑', hex: '#fde68a' },
  { name: '파스텔 연두', hex: '#bef264' },
  { name: '파스텔 초록', hex: '#86efac' },
  { name: '파스텔 파랑', hex: '#93c5fd' },
  { name: '파스텔 남색', hex: '#a5b4fc' },
  { name: '파스텔 보라', hex: '#d8b4fe' },
];
