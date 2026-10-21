import { useLayoutEffect, useState } from 'react';
import type { CSSProperties, RefObject } from 'react';

interface Padding {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const ZERO: Padding = { left: 0, top: 0, right: 0, bottom: 0 };
const TOLERANCE_PX = 0.5; // 이보다 작은 변화는 무시 (불필요한 재렌더링/떨림 방지)

const isSame = (a: Padding, b: Padding) =>
  Math.abs(a.left - b.left) < TOLERANCE_PX &&
  Math.abs(a.top - b.top) < TOLERANCE_PX &&
  Math.abs(a.right - b.right) < TOLERANCE_PX &&
  Math.abs(a.bottom - b.bottom) < TOLERANCE_PX;

/**
 * 열이 CSS transform(이동/회전)으로 컨테이너 밖으로 넘칠 때, 넘친 만큼 컨테이너 여백을 늘려 감싸게 한다.
 * - transform은 레이아웃 크기에 영향을 주지 않으므로 변환된 자식의 실제 경계를 측정해 보정
 * - 컨테이너 content box 기준 넘침이라 여백을 더해도 값이 변하지 않아 반복 증가하지 않음
 * - 확대/축소(transform scale) 상태에서도 rect/offset 비율로 배율을 보정
 *
 * @param enabled - false인 동안(예: 배치 편집 중 드래그)은 재측정하지 않고 마지막 여백을 유지
 * @param signature - 열 배치/좌석 수가 바뀌면 달라지는 값 (재측정 트리거)
 * @returns 컨테이너에 적용할 padding 스타일 (보정이 필요 없으면 undefined)
 */
export default function useFitTransformedRows(
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  signature: string,
): CSSProperties | undefined {
  const [padding, setPadding] = useState<Padding>(ZERO);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;

    const box = el.getBoundingClientRect();
    const scale = el.offsetWidth > 0 ? box.width / el.offsetWidth : 1;
    const style = getComputedStyle(el);
    // 현재 적용 중인 여백을 제외한 content box (화면 좌표)
    const contentLeft = box.left + (parseFloat(style.paddingLeft) || 0) * scale;
    const contentTop = box.top + (parseFloat(style.paddingTop) || 0) * scale;
    const contentRight = box.right - (parseFloat(style.paddingRight) || 0) * scale;
    const contentBottom = box.bottom - (parseFloat(style.paddingBottom) || 0) * scale;

    const next: Padding = { ...ZERO };
    for (const child of Array.from(el.children)) {
      const rect = child.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      next.left = Math.max(next.left, (contentLeft - rect.left) / scale);
      next.top = Math.max(next.top, (contentTop - rect.top) / scale);
      next.right = Math.max(next.right, (rect.right - contentRight) / scale);
      next.bottom = Math.max(next.bottom, (rect.bottom - contentBottom) / scale);
    }

    // 렌더 직후 측정값으로 보정 여백을 동기화 (paint 전에 반영되어 깜빡임 없음)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPadding((prev) => (isSame(prev, next) ? prev : next));
  }, [containerRef, enabled, signature]);

  if (isSame(padding, ZERO)) return undefined;
  return {
    paddingLeft: padding.left,
    paddingTop: padding.top,
    paddingRight: padding.right,
    paddingBottom: padding.bottom,
  };
}
