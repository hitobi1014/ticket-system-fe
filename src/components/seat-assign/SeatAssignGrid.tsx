import { TabsContent } from '@/components/ui/tabs.tsx';
import { Toggle } from '@/components/ui/toggle.tsx';
import { SquareIcon } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import AssignRow from '@/components/seat/AssignRow.tsx';
import type { Floor, StagePosition } from '@/types';
import { clsx } from 'clsx';
import { cn } from '@/lib/utils.ts';
import StageBar from '@/components/seat-assign/StageBar.tsx';
import {
  TransformWrapper,
  TransformComponent,
  useTransformEffect,
  type ReactZoomPanPinchContentRef,
} from 'react-zoom-pan-pinch';

interface SeatAssignGridProps {
  floor: Floor;
  stagePosition: StagePosition;
  isBulkEditMode: boolean;
  setIsBulkEditMode: (isBulkEditMode: boolean) => void;
  selectedSeatIds: Set<number>;
  setSelectedSeatIds: (selectedSeatIds: Set<number>) => void;
  setIsModalOpen: (isModalOpen: boolean) => void;
  transformRef?: React.Ref<ReactZoomPanPinchContentRef>;
  onScaleChange?: (scale: number) => void;
}

function ScaleTracker({ onScaleChange }: { onScaleChange?: (scale: number) => void }) {
  useTransformEffect((state) => {
    onScaleChange?.(state.state.scale);
  });
  return null;
}

export default function SeatAssignGrid({
  floor,
  stagePosition,
  isBulkEditMode,
  setIsBulkEditMode,
  selectedSeatIds,
  setSelectedSeatIds,
  setIsModalOpen,
  transformRef,
  onScaleChange,
}: SeatAssignGridProps) {
  const handleSeatClick = (seatId: number) => {
    if (isBulkEditMode) {
      // seat id 추가 => 배열로 저장
      setIsModalOpen(false);

      const next = new Set(selectedSeatIds);
      if (next.has(seatId)) {
        next.delete(seatId);
      } else {
        next.add(seatId);
      }
      setSelectedSeatIds(next);
    } else {
      setSelectedSeatIds(new Set([seatId]));
      setIsModalOpen(true);
    }
  };

  const isMac = navigator.platform.toUpperCase().includes('MAC');

  return (
    <TabsContent value={String(floor.id)} className="flex-1 min-h-0 flex flex-col gap-y-4">
      <div className="flex gap-x-4 items-center">
        <Toggle
          className={clsx('bg-surface-secondary text-content-primary cursor-pointer', {
            'bg-white text-black': isBulkEditMode,
          })}
          pressed={isBulkEditMode}
          onPressedChange={(pressed) => {
            setIsBulkEditMode(pressed);
            if (!pressed) setSelectedSeatIds(new Set());
          }}
        >
          <SquareIcon className="group-data-[state=on]/toggle:fill-foreground" />
          일괄편집모드
        </Toggle>
        {isBulkEditMode && (
          <>
            <Button
              variant="primary"
              size="base"
              onClick={() => setIsModalOpen(true)}
              disabled={selectedSeatIds.size === 0}
            >
              좌석배정
            </Button>
            <span className="text-content-primary">선택된 좌석: {selectedSeatIds.size}</span>
          </>
        )}
      </div>
      <div
        className={cn(
          'flex gap-2 flex-1 overflow-hidden',
          stagePosition === 'left' || stagePosition === 'right' ? 'flex-row' : 'flex-col',
        )}
      >
        {(stagePosition === 'front' || stagePosition === 'left') && (
          <StageBar position={stagePosition} />
        )}
        <div className="flex-1 overflow-hidden min-h-0 cursor-grab active:cursor-grabbing">
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
              <div className="flex flex-col gap-y-2 px-2 pb-4 w-max">
                {floor.rows.map((floorRow) => (
                  <div key={floorRow.id} className="flex gap-x-4">
                    {floorRow.items.map((item) =>
                      item.kind === 'aisle' ? (
                        <div
                          key={item.id}
                          className="flex items-center justify-center px-3 self-stretch text-content-primary bg-surface-secondary rounded-md"
                        >
                          <div className="w-px h-2/4 bg-surface-accent" />
                        </div>
                      ) : (
                        <AssignRow
                          key={item.id}
                          section={item}
                          isBulkEditMode={isBulkEditMode}
                          selectedSeatIds={selectedSeatIds}
                          onSeatClick={handleSeatClick}
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
