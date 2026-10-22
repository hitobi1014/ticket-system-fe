const isMac = navigator.platform.toUpperCase().includes('MAC');

export const ZOOM_STEP = 0.25;

/** Tailwind md(768px) 미만 */
export const MOBILE_MEDIA_QUERY = '(max-width: 767px)';

/** 컨텐츠가 화면보다 넓을 때 폭에 맞추는 배율 (확대는 하지 않고, 최소 배율 아래로는 줄이지 않음) */
export const getFitScale = (wrapperWidth: number, contentWidth: number, minScale: number) =>
  contentWidth > wrapperWidth && wrapperWidth > 0
    ? Math.max(minScale, wrapperWidth / contentWidth)
    : 1;

/** 좌석 배치도 TransformWrapper 공통 설정 (Mac: Cmd+휠, 그 외: Ctrl+휠로 확대/축소) */
export const ZOOM_WRAPPER_PROPS = {
  initialScale: 1,
  minScale: 0.5,
  maxScale: 2,
  wheel: { step: isMac ? 0.01 : 0.5, activationKeys: [isMac ? 'Meta' : 'Control'] },
  panning: { allowLeftClickPan: true },
  doubleClick: { disabled: true },
};
