import type { CSSProperties } from 'react';
import type { RowLayout } from '@/types';

export const DEFAULT_ROW_LAYOUT: RowLayout = { offsetX: 0, offsetY: 0, rotation: 0 };

/** 화면별 좌석 한 칸 크기(px). 배치 값은 이 크기를 1로 한 상대 단위로 저장된다 */
export const SEAT_SIZE_PX = {
  setup: 32, // 구역 설정 (Row)
  assign: 40, // 좌석 배정 / 좌석 안내 (AssignRow, SeatGrid)
} as const;

export const OFFSET_LIMIT = 50;
export const ROTATION_LIMIT = 180;

const round = (value: number, digits: number) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const clamp = (value: number, limit: number) => Math.min(Math.max(value, -limit), limit);

/** 서버 허용 범위로 보정하고 소수점을 정리 (offset 0.01, rotation 0.1 단위) */
export const normalizeRowLayout = (layout: RowLayout): RowLayout => ({
  offsetX: round(clamp(layout.offsetX, OFFSET_LIMIT), 2),
  offsetY: round(clamp(layout.offsetY, OFFSET_LIMIT), 2),
  rotation: round(clamp(layout.rotation, ROTATION_LIMIT), 1),
});

/** 각도를 -180 ~ 180 범위로 변환 */
export const normalizeAngle = (degree: number) => {
  const wrapped = ((((degree + 180) % 360) + 360) % 360) - 180;
  return wrapped === -180 ? 180 : wrapped;
};

export const isSameRowLayout = (a: RowLayout, b: RowLayout) =>
  a.offsetX === b.offsetX && a.offsetY === b.offsetY && a.rotation === b.rotation;

export const isDefaultRowLayout = (layout: RowLayout | undefined) =>
  layout == null || isSameRowLayout(layout, DEFAULT_ROW_LAYOUT);

/**
 * 열 컨테이너에 적용할 배치 스타일 (이동 후 중심 기준 회전)
 * 기본값이면 undefined를 반환해 기존 렌더링에 영향을 주지 않는다.
 */
export const getRowTransformStyle = (
  layout: RowLayout | undefined,
  seatSizePx: number,
): CSSProperties | undefined => {
  if (isDefaultRowLayout(layout) || !layout) return undefined;
  return {
    transform: `translate(${layout.offsetX * seatSizePx}px, ${layout.offsetY * seatSizePx}px) rotate(${layout.rotation}deg)`,
    transformOrigin: 'center',
  };
};
