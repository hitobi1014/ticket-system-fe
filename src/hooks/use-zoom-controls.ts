import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactZoomPanPinchContentRef } from 'react-zoom-pan-pinch';
import { ZOOM_STEP } from '@/lib/zoomUtils.ts';

/**
 * 층(탭)별 TransformWrapper를 관리하고 선택된 층의 확대/축소를 제어
 * @param selectedFloorId - 현재 선택된 층 id
 */
export default function useZoomControls(selectedFloorId: number | undefined) {
  const transformRefs = useRef(new Map<number, ReactZoomPanPinchContentRef | null>());
  const selectedFloorIdRef = useRef(selectedFloorId);
  const [currentScale, setCurrentScale] = useState(1);

  useEffect(() => {
    selectedFloorIdRef.current = selectedFloorId;
  }, [selectedFloorId]);

  const handleScaleChange = useCallback(
    (scale: number) => {
      if (selectedFloorIdRef.current === selectedFloorId) {
        setCurrentScale(scale);
      }
    },
    [selectedFloorId],
  );

  /** SeatGrid 등의 transformRef prop에 전달: `transformRef={setTransformRef(floor.id)}` */
  const setTransformRef = useCallback(
    (floorId: number) => (ref: ReactZoomPanPinchContentRef | null) => {
      transformRefs.current.set(floorId, ref);
    },
    [],
  );

  const zoomIn = useCallback(() => {
    transformRefs.current.get(selectedFloorId ?? -1)?.zoomIn(ZOOM_STEP);
  }, [selectedFloorId]);

  const zoomOut = useCallback(() => {
    transformRefs.current.get(selectedFloorId ?? -1)?.zoomOut(ZOOM_STEP);
  }, [selectedFloorId]);

  return { currentScale, handleScaleChange, setTransformRef, zoomIn, zoomOut };
}
