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
            key={item.id}
            className="flex items-center justify-center px-3 self-stretch text-content-primary bg-surface-secondary rounded-md"
          >
            <div className="w-px h-2/4 bg-surface-accent" />
          </div>
        ) : (
          <div
            key={item.id}
            className={cn(
              'bg-surface-secondary rounded-md text-content-primary flex flex-col gap-y-2 p-4',
              (highlightColorMap?.size ?? 0) > 0 &&
                item.rows.some((row) =>
                  row.seats.some(
                    (seat) =>
                      seat.assignedMemberId != null &&
                      (highlightColorMap?.has(seat.assignedMemberId) ?? false),
                  ),
                ) &&
                'ring-2 ring-content-primary',
            )}
          >
            <div className="flex justify-between items-center text-sm">
              <span>{item.name}</span>
              <span>{item.rows.flatMap((r) => r.seats).length}석</span>
            </div>
            {item.rows.map((row) => (
              <div key={row.id} className="flex items-center gap-x-1.5">
                <p>{row.rowName}</p>
                {row.seats.map((seat) => {
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
                        'w-10 h-10 flex items-center justify-center rounded-md border text-sm bg-surface-primary text-content-primary',
                        isPulsing && 'animate-pulse',
                      )}
                      style={{
                        ...(bgColor
                          ? {
                              backgroundColor: bgColor,
                              color: getContrastTextColor(bgColor),
                              ...(isDimmed ? { filter: 'brightness(0.4)' } : {}),
                            }
                          : {}),
                      }}
                    >
                      <div className="text-center leading-tight">
                        <p>{seat.seatNumber}</p>
                        {seat.assignedMemberId != null && (
                          <p className="text-xs">{getMemberName(seat.assignedMemberId)}</p>
                        )}
                      </div>
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
      className="flex-1 min-h-0 flex flex-col gap-y-4 cursor-grab active:cursor-grabbing"
    >
      <div
        className={cn(
          'flex gap-2 flex-1 overflow-hidden',
          stagePosition === 'left' || stagePosition === 'right' ? 'flex-row' : 'flex-col',
        )}
      >
        {(stagePosition === 'front' || stagePosition === 'left') && (
          <StageBar position={stagePosition} />
        )}

        {enableZoom ? (
          <div className="flex-1 overflow-hidden min-h-0">
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
                <div className="flex flex-col gap-y-2 px-2 pb-4 w-max">{floorRows}</div>
              </TransformComponent>
              {isActive && <SeatMinimap floor={floor} highlightColorMap={highlightColorMap} />}
            </TransformWrapper>
          </div>
        ) : (
          <div className="flex flex-col gap-y-2 flex-1 no-scrollbar overflow-auto px-2">
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
