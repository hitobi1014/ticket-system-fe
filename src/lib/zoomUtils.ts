const isMac = navigator.platform.toUpperCase().includes('MAC');

export const ZOOM_STEP = 0.25;

/** 좌석 배치도 TransformWrapper 공통 설정 (Mac: Cmd+휠, 그 외: Ctrl+휠로 확대/축소) */
export const ZOOM_WRAPPER_PROPS = {
  initialScale: 1,
  minScale: 0.5,
  maxScale: 2,
  wheel: { step: isMac ? 0.01 : 0.5, activationKeys: [isMac ? 'Meta' : 'Control'] },
  panning: { allowLeftClickPan: true },
  doubleClick: { disabled: true },
};
