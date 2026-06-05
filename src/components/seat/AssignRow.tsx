import type { Section } from '@/types';
import { Button } from '@/components/ui/button.tsx';
import useMemberStore from '@/store/memberStore.ts';
import { useRef } from 'react';

interface AssignRowProps {
  section: Section;
  isBulkEditMode: boolean;
  onSeatClick: (seatId: number) => void;
}

export default function AssignRow({ section, onSeatClick }: AssignRowProps) {
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
        <div key={row.id} className="flex">
          {row.seats.map((seat) => (
            <div key={seat.id}>
              {/* 빈 좌석은 흰 배경, 배정된 좌석은 회원에게 할당된 색상*/}
              {/* TODO 클릭 >
              1. 단건 편집
              2. 일괄 편집
                - 일괄 편집시 기존 단건 편집 클릭 이벤트 막기 =>
              */}
              <Button
                ref={triggerRef}
                className="w-12 h-12 text-sm"
                variant="outline"
                style={{ backgroundColor: assignedSeatColor(seat.assignedMemberId) }}
                onClick={() => onSeatClick(seat.id)}
              >
                <div>
                  <p>{seat.seatNumber}</p>
                  <p>{assignedSeatMemberName(seat.assignedMemberId)}</p>
                </div>
              </Button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
