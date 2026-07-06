import type { Floor, StagePosition } from '@/types';
import { TabsContent } from '@/components/ui/tabs';
import useMemberStore from '@/store/memberStore.ts';
import { cn } from '@/lib/utils.ts';
import StageBar from '@/components/seat-assign/StageBar.tsx';
import { getContrastTextColor } from '@/lib/uiUtils';
import {
  TransformWrapper,
  TransformComponent,
  useTransformEffect,
  type ReactZoomPanPinchContentRef,
} from 'react-zoom-pan-pinch';
import SeatMinimap from '@/components/seat/SeatMinimap';

interface SeatGridProps {
  floor: Floor;
  stagePosition: StagePosition;
  highlightColorMap?: Map<number, string>;
  pulsingMemberIds?: Set<number>;
  enableZoom?: boolean;
  isActive?: boolean;
  transformRef?: React.Ref<ReactZoomPanPinchContentRef>;
  onScaleChange?: (scale: number) => void;
}

function ScaleTracker({ onScaleChange }: { onScaleChange?: (scale: number) => void }) {
  useTransformEffect((state) => {
    onScaleChange?.(state.state.scale);
  });
  return null;
}

export default function SeatGrid({
  floor,
  stagePosition,
  highlightColorMap,
  pulsingMemberIds,
  enableZoom = false,
  isActive = false,
  transformRef,
  onScaleChange,
}: SeatGridProps) {
  const { members } = useMemberStore();

  const getMemberColor = (memberId: number) =>
    members.find((m) => m.id === memberId)?.color ?? '#f0fdfa';

  const getMemberName = (memberId: number) => members.find((m) => m.id === memberId)?.name ?? '';

  const floorRows = floor.rows.map((floorRow) => (
    <div key={floorRow.id} className="flex gap-x-4 py-2">
      {floorRow.items.map((item) =>
        item.kind === 'aisle' ? (
          <div
            key={`${item.kind}-${item.id}`}
            className="text-content-primary bg-surface-secondary flex items-center justify-center self-stretch rounded-md px-3"
          >
            <div className="bg-surface-accent h-2/4 w-px" />
          </div>
        ) : (
          <div
            key={item.id}
            className={cn(
              'bg-surface-secondary text-content-primary flex flex-col gap-y-2 rounded-md p-4',
              (highlightColorMap?.size ?? 0) > 0 &&
                item.rows.some((row) =>
                  row.seats.some(
                    (seat) =>
                      seat.assignedMemberId != null &&
                      (highlightColorMap?.has(seat.assignedMemberId) ?? false),
                  ),
                ) &&
                'ring-content-primary ring-2',
            )}
          >
            <div className="flex items-center justify-between text-sm">
              <span>{item.name}</span>
              <span>{item.rows.flatMap((r) => r.seats).length}석</span>
            </div>
            {item.rows.map((row) => (
              <div key={row.id} className="flex items-center gap-x-1.5">
                <p>{row.rowName}</p>
                {row.seats.map((seat) => {
                  const isVisible = seat.visible;
                  const bgColor =
                    seat.assignedMemberId != null
                      ? getMemberColor(seat.assignedMemberId)
                      : undefined;
                  const isHighlightMode = (highlightColorMap?.size ?? 0) > 0;
                  const isSelected =
                    seat.assignedMemberId != null &&
                    (highlightColorMap?.has(seat.assignedMemberId) ?? false);
                  const isPulsing =
                    seat.assignedMemberId != null &&
                    (pulsingMemberIds?.has(seat.assignedMemberId) ?? false);
                  const isDimmed = isHighlightMode && seat.assignedMemberId != null && !isSelected;

                  return (
                    <div
                      key={seat.id}
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-md text-sm',
                        isVisible && 'bg-surface-primary text-content-primary border',
                        !isVisible &&
                          'pointer-events-none border-0 bg-transparent text-transparent',
                        isPulsing && 'animate-pulse',
                      )}
                      style={{
                        ...(isVisible && bgColor
                          ? {
                              backgroundColor: bgColor,
                              color: getContrastTextColor(bgColor),
                              ...(isDimmed ? { filter: 'brightness(0.4)' } : {}),
                            }
                          : {}),
                      }}
                    >
                      {isVisible && (
                        <div className="text-center leading-tight">
                          <p>{seat.seatNumber}</p>
                          {seat.assignedMemberId != null && (
                            <p className="text-xs">{getMemberName(seat.assignedMemberId)}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ),
      )}
    </div>
  ));

  const isMac = navigator.platform.toUpperCase().includes('MAC');

  return (
    <TabsContent
      value={String(floor.id)}
      className="flex min-h-0 flex-1 cursor-grab flex-col gap-y-4 active:cursor-grabbing"
    >
      <div
        className={cn(
          'flex flex-1 gap-2 overflow-hidden',
          stagePosition === 'left' || stagePosition === 'right' ? 'flex-row' : 'flex-col',
        )}
      >
        {(stagePosition === 'front' || stagePosition === 'left') && (
          <StageBar position={stagePosition} />
        )}

        {enableZoom ? (
          <div className="min-h-0 flex-1 overflow-hidden">
            <TransformWrapper
              ref={transformRef}
              initialScale={1}
              minScale={0.5}
              maxScale={2}
              wheel={{ step: isMac ? 0.01 : 0.5, activationKeys: [isMac ? 'Meta' : 'Control'] }}
              panning={{ allowLeftClickPan: true }}
              doubleClick={{ disabled: true }}
            >
              <ScaleTracker onScaleChange={onScaleChange} />
              <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                <div className="flex w-max flex-col gap-y-2 px-2 pb-4">{floorRows}</div>
              </TransformComponent>
              {isActive && <SeatMinimap floor={floor} highlightColorMap={highlightColorMap} />}
            </TransformWrapper>
          </div>
        ) : (
          <div className="no-scrollbar flex flex-1 flex-col gap-y-2 overflow-auto px-2">
            {floorRows}
          </div>
        )}

        {(stagePosition === 'back' || stagePosition === 'right') && (
          <StageBar position={stagePosition} />
        )}
      </div>
    </TabsContent>
  );
}
