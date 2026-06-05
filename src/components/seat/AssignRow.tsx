import type { Section } from '@/types';
import { Button } from '@/components/ui/button.tsx';
import useMemberStore from '@/store/memberStore.ts';

interface AssignRowProps {
  section: Section;
}

export default function AssignRow({ section }: AssignRowProps) {
  const { members } = useMemberStore();
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
              <Button
                className="w-12 h-12 text-sm"
                variant="outline"
                style={{ backgroundColor: assignedSeatColor(seat.assignedMemberId) }}
              >
                <div>
                  {/* TODO 좀 더 써보고 불편하면 체크박스 표시에 따라 hidden 처리*/}
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
