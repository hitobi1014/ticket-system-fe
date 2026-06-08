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
