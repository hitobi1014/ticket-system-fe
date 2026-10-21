import { useTransformEffect } from 'react-zoom-pan-pinch';

export interface ScaleTrackerProps {
  onScaleChange?: (scale: number) => void;
}

/** TransformWrapper 내부에서 현재 확대 배율을 상위로 전달 */
export default function ScaleTracker({ onScaleChange }: ScaleTrackerProps) {
  useTransformEffect((state) => {
    onScaleChange?.(state.state.scale);
  });
  return null;
}
