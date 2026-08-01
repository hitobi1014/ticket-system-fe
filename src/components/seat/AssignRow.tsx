import type { Section } from '@/types';
import { Button } from '@/components/ui/button.tsx';
import useMemberStore from '@/store/memberStore.ts';
import { useRef } from 'react';
import { getContrastTextColor } from '@/lib/uiUtils.ts';
import { cn } from '@/lib/utils.ts';
import { Badge } from '@/components/ui/badge';
import { emptySeatClass, hideSeatClass, seatSectionClass } from '@/constant/styles.ts';

interface AssignRowProps {
  section: Section;
  isBulkEditMode: boolean;
  selectedSeatIds?: Set<number>;
  onSeatClick: (seatId: number) => void;
}

export default function AssignRow({
  section,
  onSeatClick,
  selectedSeatIds = new Set(),
}: AssignRowProps) {
  const { members } = useMemberStore();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const assignedSeatColor = (id: number | null) =>
    members.find((v) => v.id === id)?.color ?? '#f0fdfa';
  const assignedSeatMemberName = (id: number | null) =>
    members.find((v) => v.id === id)?.name ?? '';

  return (
    <div className={seatSectionClass}>
      <div className="flex items-center justify-between text-sm">
        <Badge>{section.name}</Badge>
        <span>{section.rows.flatMap((r) => r.seats).length}석</span>
      </div>
      {section.rows.map((row) => (
        <div key={row.id} className="flex items-center gap-x-1.5">
          <p>{row.rowName}</p>
          {row.seats.map((seat) => {
            const isVisible = seat.visible;

            return (
              // 빈 좌석은 흰 배경, 배정된 좌석은 회원에게 할당된 색상
              //  1. 단건 편집
              //  2. 일괄 편집
              //    - 일괄 편집시 기존 단건 편집 클릭 이벤트 막기 =>
              <Button
                key={seat.id}
                ref={triggerRef}
                className={cn(
                  emptySeatClass,
                  'h-10 w-10',
                  !isVisible && hideSeatClass,
                  seat.assignedMemberId != null && 'border-0',
                  selectedSeatIds.has(seat.id) && 'border-0 ring-2 ring-red-400 ring-offset-1',
                )}
                variant="outline"
                style={
                  isVisible && seat.assignedMemberId != null
                    ? {
                        backgroundColor: assignedSeatColor(seat.assignedMemberId!),
                        color: getContrastTextColor(assignedSeatColor(seat.assignedMemberId!)),
                      }
                    : undefined
                }
                onClick={() => isVisible && onSeatClick(seat.id)}
              >
                {isVisible && (
                  <div>
                    <p>{seat.seatNumber}</p>
                    <p>{assignedSeatMemberName(seat.assignedMemberId!)}</p>
                  </div>
                )}
              </Button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
