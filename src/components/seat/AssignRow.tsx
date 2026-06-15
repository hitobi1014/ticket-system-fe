import type { Section } from '@/types';
import { Button } from '@/components/ui/button.tsx';
import useMemberStore from '@/store/memberStore.ts';
import { useRef } from 'react';
import { clsx } from 'clsx';
import { getContrastTextColor } from '@/lib/uiUtils.ts';

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

  // 기본값 oklch(98.4% 0.014 180.72)
  const assignedSeatColor = (id: number | null) =>
    members.find((v) => v.id === id)?.color ?? '#f0fdfa';
  const assignedSeatMemberName = (id: number | null) =>
    members.find((v) => v.id === id)?.name ?? '';

  return (
    <div className="bg-surface-secondary rounded-md text-content-primary flex flex-col gap-y-2 p-4">
      <div className="flex justify-between items-center text-sm">
        <span>{section.name}</span>
        <span>{section.rows.flatMap((r) => r.seats).length}석</span>
      </div>
      {section.rows.map((row) => (
        <div key={row.id} className="flex items-center gap-x-1.5">
          <p>{row.rowName}</p>
          {row.seats.map((seat) => (
            // 빈 좌석은 흰 배경, 배정된 좌석은 회원에게 할당된 색상
            //  1. 단건 편집
            //  2. 일괄 편집
            //    - 일괄 편집시 기존 단건 편집 클릭 이벤트 막기 =>
            <Button
              key={seat.id}
              ref={triggerRef}
              className={clsx(
                'w-10 h-10 bg-surface-primary text-content-primary border-0  text-sm',
                {
                  'ring-2 ring-content-accent ring-offset-1': selectedSeatIds.has(seat.id),
                },
              )}
              variant="outline"
              style={
                seat.assignedMemberId != null
                  ? {
                      backgroundColor: assignedSeatColor(seat.assignedMemberId!),
                      color: getContrastTextColor(assignedSeatColor(seat.assignedMemberId!)),
                    }
                  : undefined
              }
              onClick={() => onSeatClick(seat.id)}
            >
              <div>
                <p>{seat.seatNumber}</p>
                <p>{assignedSeatMemberName(seat.assignedMemberId!)}</p>
              </div>
            </Button>
          ))}
        </div>
      ))}
    </div>
  );
}
