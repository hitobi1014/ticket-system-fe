import { useMemo, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { cn } from '@/lib/utils';
import { getContrastTextColor } from '@/lib/uiUtils';
import { groupMySeatsByFloor, findSeatContext } from '@/lib/seatUtils';
import type { Floor } from '@/types';
import { emptySeatClass } from '@/constant/styles';

interface MySeatPreviewProps {
  mySeats: NonNullable<ReturnType<typeof findSeatContext>>[];
  floors: Floor[];
  currentMemberId: number;
  myColor: string;
  focusedSeatId?: number;
  onSeatClick?: (seatId: number) => void;
}

export default function MySeatPreview({
  mySeats,
  floors,
  currentMemberId,
  myColor,
  focusedSeatId,
  onSeatClick,
}: MySeatPreviewProps) {
  const groupedSeats = useMemo(() => groupMySeatsByFloor(mySeats), [mySeats]);

  const firstFloorWithSeats = useMemo(() => {
    for (const floor of floors) {
      if (groupedSeats.has(floor.id)) {
        return floor.id;
      }
    }
    return floors[0]?.id;
  }, [floors, groupedSeats]);

  const [selectedFloorId, setSelectedFloorId] = useState(firstFloorWithSeats);

  const selectedFloorSeats = groupedSeats.get(selectedFloorId);

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">내 좌석 위치</h3>
      </div>

      <Tabs value={String(selectedFloorId)} onValueChange={(v) => setSelectedFloorId(Number(v))}>
        <TabsList variant="default" className="w-full justify-start">
          {floors.map((floor) => {
            const hasSeats = groupedSeats.has(floor.id);
            return (
              <TabsTrigger
                key={floor.id}
                variant="default"
                value={String(floor.id)}
                className="relative"
              >
                {floor.name}
                {hasSeats && (
                  <span className="bg-primary absolute top-1 right-1 h-1.5 w-1.5 shrink-0 rounded-full" />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {floors.map((floor) => (
          <TabsContent key={floor.id} value={String(floor.id)} className="mt-3">
            {selectedFloorSeats ? (
              <MySeatGrid
                floorSeats={selectedFloorSeats.seats}
                currentMemberId={currentMemberId}
                myColor={myColor}
                focusedSeatId={focusedSeatId}
                onSeatClick={onSeatClick}
              />
            ) : (
              <div className="border-input flex h-32 flex-col items-center justify-center gap-y-2 rounded-lg border-2 border-dashed">
                <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
                  <span className="text-muted-foreground text-2xl">○</span>
                </div>
                <p className="text-muted-foreground text-sm">이 층에 배정된 좌석이 없습니다</p>
                <p className="text-muted-foreground text-xs">
                  우측에 동그라미 표시된 탭(층)을 선택해주세요
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface MySeatGridProps {
  floorSeats: NonNullable<ReturnType<typeof findSeatContext>>[];
  currentMemberId: number;
  myColor: string;
  focusedSeatId?: number;
  onSeatClick?: (seatId: number) => void;
}

function MySeatGrid({
  floorSeats,
  currentMemberId,
  myColor,
  focusedSeatId,
  onSeatClick,
}: MySeatGridProps) {
  const sectionMap = useMemo(() => {
    const map = new Map<number, NonNullable<ReturnType<typeof findSeatContext>>[]>();
    for (const seatCtx of floorSeats) {
      const sectionId = seatCtx.section.id;
      if (!map.has(sectionId)) {
        map.set(sectionId, []);
      }
      map.get(sectionId)!.push(seatCtx);
    }
    return map;
  }, [floorSeats]);

  const sections = useMemo(() => {
    const uniqueSections = Array.from(
      new Map(floorSeats.map((ctx) => [ctx.section.id, ctx.section])).values(),
    );
    return uniqueSections;
  }, [floorSeats]);

  return (
    <div className="max-h-64 overflow-hidden rounded-lg border">
      <TransformWrapper
        initialScale={1}
        minScale={1}
        maxScale={1}
        wheel={{ disabled: true }}
        panning={{ allowLeftClickPan: true }}
        doubleClick={{ disabled: true }}
      >
        <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
          <div className="bg-card w-max space-y-4 p-4">
            {sections.map((section) => {
        const seatContexts = sectionMap.get(section.id) ?? [];
        const rowMap = new Map<number, NonNullable<ReturnType<typeof findSeatContext>>[]>();

        for (const ctx of seatContexts) {
          if (!rowMap.has(ctx.row.id)) {
            rowMap.set(ctx.row.id, []);
          }
          rowMap.get(ctx.row.id)!.push(ctx);
        }

        const uniqueRows = Array.from(
          new Map(seatContexts.map((ctx) => [ctx.row.id, ctx.row])).values(),
        );

        return (
          <div key={section.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{section.name}</span>
            </div>

            {uniqueRows.map((row) => {
              const allSeats = row.seats;

              return (
                <div key={row.id} className="flex items-start gap-x-1.5">
                  <span className="text-muted-foreground w-6 shrink-0 pt-1.5 text-center text-xs leading-none">
                    {row.rowName}
                  </span>
                  <div className="flex gap-x-0.5">
                    {allSeats.map((seat) => {
                      const isMySeat = seat.assignedMemberId === currentMemberId;
                      const isFocused = seat.id === focusedSeatId;

                      return (
                        <div
                          key={seat.id}
                          className={cn(
                            emptySeatClass,
                            'flex h-7 w-7 cursor-pointer items-center justify-center rounded text-xs font-medium transition-all',
                            isMySeat && 'border-0',
                            isFocused && 'ring-primary ring-2',
                          )}
                          style={
                            isMySeat
                              ? {
                                  backgroundColor: myColor,
                                  color: getContrastTextColor(myColor),
                                }
                              : {}
                          }
                          onClick={() => {
                            if (isMySeat && onSeatClick) {
                              onSeatClick(seat.id);
                            }
                          }}
                        >
                          {seat.seatNumber}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
