/**
 * 배경색에 따라 자연스러운 텍스트 색상 추출
 * @param hexColor - 배경색
 * @return 텍스트 색상
 * */
export function getContrastTextColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  // 상대 밝기 계산 (W3C 기준)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/** `#RRGGBB` 형식인지 검사 */
export const isValidHexColor = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value);

const hslToHex = (h: number, s: number, l: number) => {
  const sat = s / 100;
  const light = l / 100;
  const a = sat * Math.min(light, 1 - light);
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    const value = light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
};

/**
 * 무작위 색상 생성 (색상 H는 전 범위, 채도/명도는 좌석 글자가 읽히는 범위로 제한)
 * @return `#rrggbb` 형식 hex
 */
export function getRandomHexColor(): string {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 55 + Math.floor(Math.random() * 36); // 55~90
  const lightness = 40 + Math.floor(Math.random() * 41); // 40~80
  return hslToHex(hue, saturation, lightness);
}
