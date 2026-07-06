import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import useFloorStore from '@/store/floorStore.ts';
import useMemberStore from '@/store/memberStore.ts';
import { findSeatContext, getAssignableMember, getRemainTickets } from '@/lib/seatUtils.ts';
import type {
  AssignSeatRequest,
  Floor,
  Member,
  Rows,
  Seat,
  Section,
  UnAssignSeatRequest,
} from '@/types';
import { clsx } from 'clsx';
import { TriangleAlert } from 'lucide-react';
import { useRef, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils.ts';

// 모달에서 일괄/단건 회원 좌석 할당 가능하도록

interface AssignMemberModalProps {
  seatIds: Set<number>;
  onClose: () => void;
}

const COL_WIDTHS = ['13%', '13%', '20%', '20%', '13%'];
const ColGroup = () => (
  <colgroup>
    {COL_WIDTHS.map((w, i) => (
      <col key={i} style={{ width: w }} />
    ))}
  </colgroup>
);

export function AssignMemberModal({ seatIds, onClose }: AssignMemberModalProps) {
  const { floors, assignSeat, unAssignSeat } = useFloorStore();
  const { members, getAssignedCountMap } = useMemberStore();
  const memberListRef = useRef<HTMLDivElement>(null);
  const [hasMemberEmpty, setHasMemberEmpty] = useState<boolean>(false);
  const [isAssignMemberSelected, setIsAssignMemberSelected] = useState<number | null>(null);

  const modalTitle = {
    N: '배정할 회원을 선택하세요.',
    U: '현재 배정된 인원을 변경하거나 배정을 취소합니다.',
    B: '선택한 좌석 전체에 동일한 회원을 배정합니다.',
  };

  const formatSeatLabel = (
    ctx: { floor: Floor; section: Section; row: Rows; seat: Seat },
    memberName?: string | null,
  ): string => {
    const base = `${ctx.floor.name}﹒${ctx.section.name}﹒${ctx.row.rowName}열﹒${ctx.seat.seatNumber}번`;
    return memberName ? `${base} (${memberName})` : base;
  };

  const assignedCount = [...seatIds].filter(
    (id) => findSeatContext(floors, id)?.seat.assignedMemberId != null,
  ).length;

  const isVisibleCancelButton = assignedCount > 0;

  const overwriteCount = [...seatIds].filter((seatId) => {
    const ctx = findSeatContext(floors, seatId);
    return ctx?.seat.assignedMemberId != null;
  }).length;

  // 확인버튼 클릭시 선택한 좌석에 선택한 회원 배정
  const handleConfirm = async () => {
    if (!isAssignMemberSelected) {
      toast('선택된 회원이 없습니다. 회원을 선택해주세요');
      setHasMemberEmpty(true);
      memberListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => setHasMemberEmpty(false), 2000); // 2초 후 ring 제거
      return;
    }

    const req: AssignSeatRequest = {
      seatIds: [...seatIds],
      memberId: isAssignMemberSelected,
    };
    try {
      await assignSeat(req);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '회원 좌석배정에 실패했습니다.');
      return;
    }
    const findMember = members.find((m) => m.id === isAssignMemberSelected);
    toast(`${findMember?.name} > ${seatIds.size}석 배정 완료`);
    onClose();
  };

  const hasEnoughRemainingTickets = (member: Member): boolean => {
    return getRemainTickets(member, assignedCountMap) >= seatIds.size;
  };

  const handleCancel = async () => {
    const req: UnAssignSeatRequest = {
      seatIds: [...seatIds],
    };
    try {
      await unAssignSeat(req);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '배정 취소를 실패했습니다.');
      return;
    }
    toast('배정이 취소되었습니다.');
    onClose();
  };

  const assignedCountMap = getAssignedCountMap();
  const sortedMemberFromRemainSeat = getAssignableMember(members, assignedCountMap);

  return (
    <DialogContent className="bg-surface-secondary text-content-primary">
      <DialogHeader>
        <DialogTitle className="text-lg">좌석배정</DialogTitle>
        <DialogDescription className="text-content-secondary">{modalTitle['N']}</DialogDescription>
      </DialogHeader>
      <Separator className="bg-surface-accent" />
      {/* 선택한 좌석 */}
      <div className="flex flex-col gap-2">
        <div className="no-scrollbar flex max-h-24 flex-wrap gap-1 overflow-y-auto">
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
                  'flex items-center gap-1 rounded px-2 py-1 text-xs whitespace-nowrap',
                  {
                    'bg-surface-danger text-content-danger font-bold': memberName,
                    'bg-surface-accent text-content-primary': !memberName,
                  },
                )}
              >
                {memberName && <TriangleAlert size={12} />}
                {formatSeatLabel(ctx, memberName)}
              </span>
            );
          })}
        </div>
        {overwriteCount > 0 && (
          <div className="flex items-center gap-2 rounded bg-amber-100 px-3 py-2 text-xs font-bold text-amber-800">
            <TriangleAlert size={14} />
            배정된 좌석 {overwriteCount}개가 포함되어 있습니다. 덮어씁니다.
          </div>
        )}
      </div>
      {/* ✅ 회원 목록: 잔여 좌석이 남은 회원만 표기 */}
      <Separator className="bg-surface-accent" />
      <div
        className={clsx('-mx-4 flex max-h-[50vh] flex-col overflow-hidden', {
          'ring-2 ring-red-400': hasMemberEmpty,
        })}
      >
        <h5 className="text-content-secondary mb-2 px-4 text-sm font-bold">회원 목록</h5>
        {/* 테이블 wrapper - flex-col로 헤더/바디 분리 */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* 헤더 고정 */}
          <div className="shrink-0 overflow-hidden">
            <Table className="bg-surface-secondary" style={{ tableLayout: 'fixed' }}>
              <ColGroup />
              <TableHeader>
                <TableRow>
                  <TableHead className="border-b-content-secondary border-b text-center text-gray-300">
                    순서
                  </TableHead>
                  <TableHead className="border-b-content-secondary border-b text-center text-gray-300">
                    순위
                  </TableHead>
                  <TableHead className="border-b-content-secondary border-b text-center text-gray-300">
                    파트
                  </TableHead>
                  <TableHead className="border-b-content-secondary border-b text-center text-gray-300">
                    이름
                  </TableHead>
                  <TableHead className="border-b-content-secondary border-b text-center text-gray-300">
                    잔여티켓
                  </TableHead>
                </TableRow>
              </TableHeader>
            </Table>
          </div>

          {/* 바디만 스크롤 */}
          <div className="no-scrollbar flex-1 overflow-y-auto">
            <Table
              className="bg-surface-secondary text-content-primary"
              style={{ tableLayout: 'fixed' }}
            >
              <ColGroup />
              <TableBody className="divide-y divide-mist-300">
                {sortedMemberFromRemainSeat.map((mem) => (
                  <TableRow
                    key={mem.id}
                    className={cn(
                      'cursor-pointer text-center',
                      isAssignMemberSelected === mem.id && 'bg-surface-accent text-content-primary',
                      hasEnoughRemainingTickets(mem) && 'hover:bg-surface-accent',
                      !hasEnoughRemainingTickets(mem) && 'cursor-not-allowed opacity-40',
                    )}
                    onClick={() => {
                      if (!hasEnoughRemainingTickets(mem)) return;
                      setIsAssignMemberSelected(mem.id);
                    }}
                  >
                    <TableCell>{mem.seq}</TableCell>
                    <TableCell>{mem.rank}</TableCell>
                    <TableCell>{mem.instrument.abbr}</TableCell>
                    <TableCell>{mem.name}</TableCell>
                    <TableCell>{getRemainTickets(mem, assignedCountMap)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <DialogFooter className="bg-surface-secondary border-t-surface-accent">
        <div
          className={clsx('flex w-full gap-2', {
            'justify-between': isVisibleCancelButton,
            'justify-end': !isVisibleCancelButton,
          })}
        >
          {isVisibleCancelButton && (
            <Button variant="cancel" size="base" onClick={() => handleCancel()}>
              배정취소 {assignedCount > 1 && `(${assignedCount}석)`}
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="dialog" size="base" onClick={onClose}>
              닫기
            </Button>
            <Button variant="dialog" size="base" onClick={() => handleConfirm()}>
              배정
            </Button>
          </div>
        </div>
      </DialogFooter>
    </DialogContent>
  );
}
