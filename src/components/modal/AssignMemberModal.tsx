import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ButtonGroup } from '@/components/ui/button-group.tsx';
import { Separator } from '@/components/ui/separator';
import useFloorStore from '@/store/floorStore.ts';
import useMemberStore from '@/store/memberStore.ts';
import { findSeatContext, getAssignableMember } from '@/lib/seatUtils.ts';
import type { Floor, Seat, Section } from '@/types';
import { clsx } from 'clsx';
import { TriangleAlert } from 'lucide-react';

// 모달에서 일괄/단건 회원 좌석 할당 가능하도록

interface AssignMemberModalProps {
  seatIds: Set<number>;
  onClose: () => void;
}

export function AssignMemberModal({ seatIds, onClose }: AssignMemberModalProps) {
  const { floors } = useFloorStore();
  const { members } = useMemberStore();

  // TODO 상태 분기 어떻게 할지?
  const modalTitle = {
    N: '배정할 회원을 선택하세요.',
    U: '현재 배정된 인원을 변경하거나 배정을 취소합니다.',
    B: '선택한 좌석 전체에 동일한 회원을 배정합니다.',
  };

  const formatSeatLabel = (
    ctx: { floor: Floor; section: Section; seat: Seat },
    memberName?: string | null,
  ): string => {
    const base = `${ctx.floor.name}﹒${ctx.section.name}﹒${ctx.seat.seatNumber}번`;
    return memberName ? `${base} (${memberName})` : base;
  };

  const overwriteCount = [...seatIds].filter((seatId) => {
    const ctx = findSeatContext(floors, seatId);
    console.log(`배정된회원 : ${ctx?.seat.assignedMemberId}`);
    return ctx?.seat.assignedMemberId != null;
  }).length;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="font-bold text-gray-600 text-lg">좌석배정</DialogTitle>
        <DialogDescription>{modalTitle['N']}</DialogDescription>
      </DialogHeader>
      <Separator />
      {/* 선택한 좌석 */}
      <div className="flex flex-wrap gap-1">
        {[...seatIds].map((seatId) => {
          const ctx = findSeatContext(floors, seatId);
          if (!ctx) return null;

          const memberName = ctx.seat?.assignedMemberId
            ? members.find((m) => m.id === ctx.seat.assignedMemberId)?.name
            : null;

          // ex) 1층 가구역-3번 (이민영)
          return (
            <span
              key={seatId}
              className={clsx(
                'flex items-center gap-1 text-xs rounded px-2 py-1 whitespace-nowrap',
                {
                  'bg-amber-300 text-red-950 font-bold': memberName,
                  'bg-gray-700 text-white': !memberName,
                },
              )}
            >
              {memberName && <TriangleAlert size={12} />}
              {formatSeatLabel(ctx, memberName)}
            </span>
          );
        })}
        {overwriteCount > 0 && (
          <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-100 rounded px-3 py-2">
            <TriangleAlert size={14} />
            배정된 좌석 {overwriteCount}개가 포함되어 있습니다. 덮어씁니다.
          </div>
        )}
      </div>
      {/* 회원 목록 => 잔여 좌석이 남은 회원만 표기 */}
      <Separator />
      <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
        {/*검색 기능?*/}
        <h5 className="text-sm mb-2 font-bold text-gray-600">회원 목록</h5>
        {getAssignableMember(members).map((mem) => (
          <div className="flex justify-between mb-1" key={mem.id}>
            <p>{mem.name}</p>
            <p className="bg-gray-800 text-sm text-white rounded-lg py-1 px-2 ">
              잔여 {mem.allocatedTickets}
            </p>
          </div>
        ))}
      </div>
      <DialogFooter>
        <ButtonGroup>
          <Button>확인</Button>
          <Button onClick={onClose}>닫기</Button>
        </ButtonGroup>
      </DialogFooter>
    </DialogContent>
  );
}
