import type { Section } from '@/types';
import { Button } from '@/components/ui/button.tsx';
import useMemberStore from '@/store/memberStore.ts';
import { useRef } from 'react';
import { clsx } from 'clsx';

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
    <div>
      {section.rows.map((row) => (
        <div key={row.id} className="flex gap-x-0.5">
          {row.seats.map((seat) => (
            // 빈 좌석은 흰 배경, 배정된 좌석은 회원에게 할당된 색상
            //  1. 단건 편집
            //  2. 일괄 편집
            //    - 일괄 편집시 기존 단건 편집 클릭 이벤트 막기 =>
            <Button
              key={seat.id}
              ref={triggerRef}
              className={clsx('w-12 h-12 text-sm', {
                'ring-2 ring-blue-500 ring-offset-1': selectedSeatIds.has(seat.id),
              })}
              variant="outline"
              style={{ backgroundColor: assignedSeatColor(seat.assignedMemberId) }}
              onClick={() => onSeatClick(seat.id)}
            >
              <div>
                <p>{seat.seatNumber}</p>
                <p>{assignedSeatMemberName(seat.assignedMemberId)}</p>
              </div>
            </Button>
          ))}
        </div>
      ))}
    </div>
  );
}
