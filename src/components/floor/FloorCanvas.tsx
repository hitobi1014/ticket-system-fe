import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import type { ReactZoomPanPinchContentRef } from 'react-zoom-pan-pinch';
import SectionCard from '@/components/seat/SectionCard.tsx';
import StageBar from '@/components/seat-assign/StageBar.tsx';
import ScaleTracker from '@/components/common/ScaleTracker.tsx';
import { ZOOM_WRAPPER_PROPS } from '@/lib/zoomUtils.ts';
import { cn } from '@/lib/utils.ts';
import type { Floor, StagePosition } from '@/types';

export interface FloorCanvasProps {
  floor: Floor;
  stagePosition: StagePosition;
  selectedSectionId: number | undefined;
  selectedAisleId: number | undefined;
  selectedRowId: number | undefined;
  onSelectedSectionId: (id: number | undefined) => void;
  onSelectedAisleId: (id: number | undefined) => void;
  onSelectedRowId: (id: number | undefined) => void;
  transformRef?: React.Ref<ReactZoomPanPinchContentRef>;
  onScaleChange?: (scale: number) => void;
}

/** 무대 + 확대/이동 가능한 구역/통로 배치도 */
export default function FloorCanvas({
  floor,
  stagePosition,
  selectedSectionId,
  selectedAisleId,
  selectedRowId,
  onSelectedSectionId,
  onSelectedAisleId,
  onSelectedRowId,
  transformRef,
  onScaleChange,
}: FloorCanvasProps) {
  return (
    <div
      className={cn(
        'bg-card mt-4 flex min-h-0 flex-1 gap-2 overflow-hidden rounded-md p-4',
        stagePosition === 'left' || stagePosition === 'right' ? 'flex-row' : 'flex-col',
      )}
    >
      {(stagePosition === 'front' || stagePosition === 'left') && (
        <StageBar position={stagePosition} />
      )}
      <div className="min-h-0 flex-1 cursor-grab overflow-hidden active:cursor-grabbing">
        <TransformWrapper ref={transformRef} {...ZOOM_WRAPPER_PROPS}>
          <ScaleTracker onScaleChange={onScaleChange} />
          <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
            <div className="flex w-max flex-col gap-y-4 px-2 pt-1 pb-4">
              {floor.rows.map((floorRow) => (
                <div key={floorRow.id} className="flex gap-x-4">
                  {floorRow.items.map((item) => (
                    <SectionCard
                      key={`${item.kind}-${item.id}`}
                      item={item}
                      selectedSectionId={selectedSectionId}
                      selectedAisleId={selectedAisleId}
                      selectedRowId={selectedRowId}
                      onSelectedSectionId={onSelectedSectionId}
                      onSelectedAisleId={onSelectedAisleId}
                      onSelectedRowId={onSelectedRowId}
                    />
                  ))}
                </div>
              ))}
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>
      {(stagePosition === 'back' || stagePosition === 'right') && (
        <StageBar position={stagePosition} />
      )}
    </div>
  );
}
