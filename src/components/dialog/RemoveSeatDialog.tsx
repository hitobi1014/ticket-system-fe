import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx';
import { Button, buttonVariants } from '@/components/ui/button.tsx';
import type { VariantProps } from 'class-variance-authority';
import { DialogDescription } from '@/components/ui/dialog';
import { IconMinus, IconPlus, IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';
import useFloorStore from '@/store/floorStore.ts';
import type { Section } from '@/types';
import { findSeatContextByRowId, findVisibleSeatCountByRowId } from '@/lib/seatUtils.ts';
import { cn } from '@/lib/utils.ts';
import { headerTitleClass } from '@/constant/styles.ts';
import { Input } from '@/components/ui/input.tsx';

interface RemoveSeatDialogProps {
  variant?: VariantProps<typeof buttonVariants>['variant'];
  triggerDisabled: boolean;
  selectedRowId: number;
}

export function RemoveSeatDialog({ triggerDisabled, selectedRowId }: RemoveSeatDialogProps) {
  const floors = useFloorStore((state) => state.floors);
  const removeSeat = useFloorStore((state) => state.removeSeat);

  const [open, setOpen] = useState(false);
  const [deleteCount, setDeleteCount] = useState(1);
  const [enabledRemoveCount, setEnabledRemoveCount] = useState(0);

  const currentSeatCount = findVisibleSeatCountByRowId(floors, selectedRowId) ?? 0;
  const remaining = currentSeatCount - deleteCount;
  const rowName = findSeatContextByRowId(floors, selectedRowId)?.row.rowName ?? '열 설정x';
  const sectionName = findSeatContextByRowId(floors, selectedRowId)?.section.name ?? '구역 설정x';

  useEffect(() => {
    const assignedSeats = floors
      .flatMap((f) => f.rows.flatMap((r) => r.items))
      .filter((item): item is Section => item.kind === 'section')
      .flatMap((s) => s.rows)
      .filter((r) => r.id === selectedRowId)
      .flatMap((r) => r.seats)
      .filter(
        (seat): seat is typeof seat & { assignedMemberId: number } => seat.assignedMemberId != null,
      );

    const maxSeatNumber = Math.max(...assignedSeats.map((seat) => seat.seatNumber), 0);

    // 삭제가능좌석 = row 총 좌석 - 배정된 좌석 중 가장 큰 번호
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabledRemoveCount(currentSeatCount - maxSeatNumber);
  }, [selectedRowId, floors, currentSeatCount]);

  const handleRemoveSeat = async (removeSeatCnt: number) => {
    if (selectedRowId == null) {
      toast.warning('선택된 row가 없습니다. 열을 선택하고 다시시도해주세요.');
      return;
    }

    try {
      await removeSeat(selectedRowId, removeSeatCnt);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '좌석 삭제에 실패했습니다.');
    } finally {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="xs" disabled={triggerDisabled}>
          <IconTrash stroke={2} />
          좌석 삭제
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={cn(headerTitleClass)}>좌석 삭제</DialogTitle>
          <DialogDescription>
            <span>끝 번호부터 삭제 됩니다.</span>
            <br />
            <span className="text-danger text-xs font-semibold">
              *배정되어 있는 회원이 있는경우 삭제가 불가능합니다. 배정해제를 먼저 진행해주세요
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* 구역/열 정보 */}
        <div className="flex justify-between rounded-md px-4 py-2">
          <div>
            <p className="font-semibold">구역</p>
            <p>
              {sectionName} {rowName}열
            </p>
          </div>
          <div>
            <p className="font-semibold">현재 좌석 수</p>
            <p className="text-right">{currentSeatCount}석</p>
          </div>
        </div>

        <div className="flex flex-col gap-y-2">
          <div className="flex items-center justify-center gap-x-2">
            <Button
              variant="dialog"
              className={cn('border-border h-8 w-8 border')}
              onClick={() => setDeleteCount(Math.max(deleteCount - 1, 1))}
            >
              <IconMinus stroke={2} />
            </Button>
            <Input
              aria-label="delete-count"
              type="number"
              className="no-spinners h-8 w-full text-center"
              min={1}
              max={enabledRemoveCount}
              value={deleteCount}
              onChange={(e) => setDeleteCount(Number(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleRemoveSeat(deleteCount);
                }
              }}
            />
            <Button
              variant="dialog"
              className={cn('border-border h-8 w-8 border')}
              onClick={() => setDeleteCount(Math.min(deleteCount + 1, enabledRemoveCount))}
            >
              <IconPlus stroke={2} />
            </Button>
          </div>
          {deleteCount > enabledRemoveCount ? (
            <p className="text-destructive">
              배정된 좌석이 있어 최대 {enabledRemoveCount}석까지만 삭제할 수 있습니다.
            </p>
          ) : (
            <p className="text-secondary font-semibold">삭제 후 {remaining}석이 남습니다.</p>
          )}
        </div>

        {/* 미리 보기 */}
        <DialogFooter className="pb-2.5">
          <DialogClose asChild>
            <Button variant="dialog">취소</Button>
          </DialogClose>
          <Button
            className="border border-mist-500"
            disabled={
              isNaN(deleteCount) ||
              deleteCount < 1 ||
              deleteCount > enabledRemoveCount ||
              remaining < 0
            }
            onClick={() => handleRemoveSeat(deleteCount)}
          >
            {deleteCount}석 삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
