import type { ReactNode } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { TabsContent } from '@/components/ui/tabs.tsx';
import AssignRow from '@/components/seat/AssignRow.tsx';
import type { Floor, Seat, StagePosition } from '@/types';
import { cn } from '@/lib/utils.ts';
import StageBar from '@/components/seat-assign/StageBar.tsx';
import {
  TransformWrapper,
  TransformComponent,
  type ReactZoomPanPinchContentRef,
} from 'react-zoom-pan-pinch';
import ScaleTracker from '@/components/common/ScaleTracker.tsx';
import { ZOOM_WRAPPER_PROPS } from '@/lib/zoomUtils.ts';
import AisleDivider from '@/components/seat/AisleDivider.tsx';

interface SeatAssignGridProps {
  floor: Floor;
  stagePosition: StagePosition;
  isBulkEditMode: boolean;
  selectedSeatIds: Set<number>;
  /** 일괄 편집 모드가 아닐 때 좌석 클릭 (단건 배정 모달) */
  onSeatClick: (seatId: number) => void;
  /** 일괄 편집 모드 좌석 선택(클릭/드래그) */
  onSeatMouseDown: (seat: Seat, e: ReactMouseEvent) => void;
  onSeatMouseEnter: (seat: Seat, e: ReactMouseEvent) => void;
  /** Space를 누르고 있는 동안 true — 일괄 편집 모드에서도 드래그로 화면 이동 */
  isSpacePressed?: boolean;
  /** 무대 위에 표시할 영역 (일괄 편집 상단 바) */
  topBar?: ReactNode;
  transformRef?: React.Ref<ReactZoomPanPinchContentRef>;
  onScaleChange?: (scale: number) => void;
}

export default function SeatAssignGrid({
  floor,
  stagePosition,
  isBulkEditMode,
  selectedSeatIds,
  onSeatClick,
  onSeatMouseDown,
  onSeatMouseEnter,
  isSpacePressed = false,
  topBar,
  transformRef,
  onScaleChange,
}: SeatAssignGridProps) {
  // 일괄 편집 모드에서는 드래그를 좌석 선택에 사용하므로 화면 이동(패닝)을 끈다. Space를 누르면 다시 이동 가능
  const isPanDisabled = isBulkEditMode && !isSpacePressed;

  return (
    <TabsContent value={String(floor.id)} className="flex min-h-0 flex-1 flex-col gap-y-4">
      {topBar}
      <div
        className={cn(
          'bg-card mt-4 flex min-h-0 flex-1 gap-2 overflow-hidden rounded-md p-4',
          stagePosition === 'left' || stagePosition === 'right' ? 'flex-row' : 'flex-col',
        )}
      >
        {(stagePosition === 'front' || stagePosition === 'left') && (
          <StageBar position={stagePosition} />
        )}
        <div
          className={cn(
            'min-h-0 flex-1 overflow-hidden',
            !isPanDisabled && 'cursor-grab active:cursor-grabbing',
            isBulkEditMode && 'select-none',
          )}
        >
          <TransformWrapper
            ref={transformRef}
            {...ZOOM_WRAPPER_PROPS}
            panning={{ ...ZOOM_WRAPPER_PROPS.panning, disabled: isPanDisabled }}
          >
            <ScaleTracker onScaleChange={onScaleChange} />
            <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
              <div className="flex w-max flex-col gap-y-2 px-2 pb-4">
                {floor.rows.map((floorRow) => (
                  <div key={floorRow.id} className="flex gap-x-4">
                    {floorRow.items.map((item) =>
                      item.kind === 'aisle' ? (
                        <AisleDivider />
                      ) : (
                        <AssignRow
                          key={item.id}
                          section={item}
                          isBulkEditMode={isBulkEditMode}
                          selectedSeatIds={selectedSeatIds}
                          onSeatClick={onSeatClick}
                          onSeatMouseDown={onSeatMouseDown}
                          onSeatMouseEnter={onSeatMouseEnter}
                        />
                      ),
                    )}
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
    </TabsContent>
  );
}
