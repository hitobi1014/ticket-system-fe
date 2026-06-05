import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ButtonGroup } from '@/components/ui/button-group.tsx';
import useFloorStore from '@/store/floorStore.ts';
import useMemberStore from '@/store/memberStore.ts';
import { findSeatContext, getAssignableMember } from '@/lib/seatUtils.ts';

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

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>좌석배정</DialogTitle>
        <DialogDescription>{modalTitle['N']}</DialogDescription>
      </DialogHeader>
      <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
        {/* 선택한 좌석 */}
        {[...seatIds].map((seatId) => {
          const ctx = findSeatContext(floors, seatId);
          if (!ctx) return null;

          const memberName = ctx.seat?.assignedMemberId
            ? members.find((m) => m.id === ctx.seat.assignedMemberId)?.name
            : null;

          // ex) 1층 가구역-3번 (이민영)
          return (
            <div key={seatId}>
              <p>
                {ctx.floor.name} {ctx.section.name}-{ctx.seat.seatNumber}번
                {memberName && '(' + memberName + ')'}
              </p>
            </div>
          );
        })}
        {/* 회원 목록 => 잔여 좌석이 남은 회원만 표기 */}
        <div>
          {/*검색 기능?*/}
          <h3>회원 목록</h3>
          {getAssignableMember(members).map((mem) => (
            <div className="flex justify-between mb-1" key={mem.id}>
              <p>{mem.name}</p>
              <p className="bg-gray-800 text-sm text-white rounded-lg py-1 px-2 ">
                잔여 {mem.allocatedTickets}
              </p>
            </div>
          ))}
        </div>
      </div>
      <DialogFooter>
        <ButtonGroup>
          <Button>확인</Button>
          <Button onClick={onClose}>닫기</Button>
        </ButtonGroup>
        {/*<DialogClose asChild>*/}
        {/*  <Button variant="outline">Close</Button>*/}
        {/*</DialogClose>*/}
      </DialogFooter>
    </DialogContent>
  );
}
