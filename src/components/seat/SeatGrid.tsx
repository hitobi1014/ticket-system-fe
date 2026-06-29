import type { Floor, StagePosition } from '@/types';
import { TabsContent } from '@/components/ui/tabs';
import useMemberStore from '@/store/memberStore.ts';
import { cn } from '@/lib/utils.ts';
import StageBar from '@/components/seat-assign/StageBar.tsx';
import { getContrastTextColor } from '@/lib/uiUtils';

interface SeatGridProps {
  floor: Floor;
  stagePosition: StagePosition;
  highlightColorMap?: Map<number, string>; // 회원id, color
}

export default function SeatGrid({ floor, stagePosition, highlightColorMap }: SeatGridProps) {
  const { members } = useMemberStore();

  const getMemberColor = (memberId: number) =>
    members.find((m) => m.id === memberId)?.color ?? '#f0fdfa';

  const getMemberName = (memberId: number) => members.find((m) => m.id === memberId)?.name ?? '';

  return (
    <TabsContent value={String(floor.id)} className="h-screen flex flex-col gap-y-4">
      <div
        className={cn(
          'flex gap-2 flex-1 overflow-hidden',
          stagePosition === 'left' || stagePosition === 'right' ? 'flex-row' : 'flex-col',
        )}
      >
        {(stagePosition === 'front' || stagePosition === 'left') && (
          <StageBar position={stagePosition} />
        )}
        <div className="flex flex-col gap-y-2 flex-1 no-scrollbar overflow-auto px-2">
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
                  <div
                    key={item.id}
                    className="bg-surface-secondary rounded-md text-content-primary flex flex-col gap-y-2 p-4"
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
                          const highlightColor =
                            seat.assignedMemberId != null
                              ? highlightColorMap?.get(seat.assignedMemberId)
                              : undefined;
                          return (
                            <div
                              key={seat.id}
                              className="w-10 h-10 flex items-center justify-center rounded-md border text-sm bg-surface-primary text-content-primary"
                              style={{
                                ...(bgColor
                                  ? {
                                      backgroundColor: bgColor,
                                      color: getContrastTextColor(bgColor),
                                    }
                                  : {}),
                                ...(highlightColor
                                  ? {
                                      outline: `2px solid ${highlightColor}`,
                                      outlineOffset: '1px',
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
          ))}
        </div>
        {(stagePosition === 'back' || stagePosition === 'right') && (
          <StageBar position={stagePosition} />
        )}
      </div>
    </TabsContent>
  );
}
