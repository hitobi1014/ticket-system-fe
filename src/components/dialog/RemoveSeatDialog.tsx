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
import * as React from 'react';
import { DialogDescription } from '@/components/ui/dialog';
import { IconMinus, IconPlus, IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';
import useFloorStore from '@/store/floorStore.ts';
import type { Section } from '@/types';

interface Props {
  title: string;
  buttonText: string;
  icon?: React.ReactNode;
  variant: VariantProps<typeof buttonVariants>['variant'];
  size: VariantProps<typeof buttonVariants>['size'];
  disabled?: boolean;
  sectionName: string;
  rowId?: number;
  rowName: string;
  currentSeatCount: number;
  onConfirm: (deleteCount: number) => void;
}

export function RemoveSeatDialog({
  title,
  buttonText,
  icon,
  variant,
  size,
  disabled,
  sectionName,
  rowId,
  rowName,
  currentSeatCount,
  onConfirm,
}: Props) {
  const [open, setOpen] = useState(false);
  const [deleteCount, setDeleteCount] = useState(1);
  const [enabledRemoveCount, setEnabledRemoveCount] = useState(0);
  const { floors } = useFloorStore();

  const remaining = currentSeatCount - deleteCount;

  useEffect(() => {
    const assignedSeats = floors
      .flatMap((f) => f.rows.flatMap((r) => r.items))
      .filter((item): item is Section => item.kind === 'section')
      .flatMap((s) => s.rows)
      .filter((r) => r.id === rowId)
      .flatMap((r) => r.seats)
      .filter(
        (seat): seat is typeof seat & { assignedMemberId: number } => seat.assignedMemberId != null,
      );

    const maxSeatNumber = Math.max(...assignedSeats.map((seat) => seat.seatNumber), 0);

    console.log(`currentSeatCount: ${currentSeatCount}, maxSeatNumber: ${maxSeatNumber}`);
    // 삭제가능좌석 = row 총 좌석 - 배정된 좌석 중 가장 큰 번호
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabledRemoveCount(currentSeatCount - maxSeatNumber);
  }, [rowId, floors, currentSeatCount]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        asChild
        onClick={(e) => {
          e.stopPropagation();
          if (rowId == null) {
            e.preventDefault();
            toast.error('선택된 열이 없습니다. 먼저 열을 선택해주세요');
          }
        }}
      >
        <Button variant={variant} size={size} disabled={disabled}>
          {icon}
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-surface-secondary">
        <DialogHeader>
          <DialogTitle className="text-content-primary flex items-center gap-x-2">
            <IconTrash className="danger-color" stroke={1.5} />
            <p>{title}</p>
          </DialogTitle>
          <DialogDescription>
            <span className="text-content-secondary">끝 번호부터 삭제 됩니다.</span>
            <br />
            <span className="text-surface-danger">
              배정되어 있는 회원이 있는경우 삭제가 불가능합니다. 배정해제를 먼저 진행해주세요
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* 구역/열 정보 */}
        <div className="bg-surface-primary flex justify-between rounded-md px-4 py-2">
          <div>
            <p className="text-mist-400">구역</p>
            <p className="text-content-primary">
              {sectionName} {rowName}열
            </p>
          </div>
          <div>
            <p className="text-mist-400">현재 좌석 수</p>
            <p className="text-content-primary text-right">{currentSeatCount}석</p>
          </div>
        </div>

        {/* 입력*/}

        <div className="flex flex-col gap-y-2">
          <div className="flex items-center justify-center gap-x-2">
            <Button
              variant="dialog"
              className="h-8 w-8"
              onClick={() => setDeleteCount(Math.max(deleteCount - 1, 1))}
            >
              <IconMinus stroke={2} />
            </Button>
            <input
              type="number"
              className="bg-surface-primary no-spinners h-8 w-full rounded-lg text-center text-mist-50"
              min={1}
              max={enabledRemoveCount}
              value={deleteCount}
              onChange={(e) => setDeleteCount(Number(e.target.value))}
            />
            <Button
              variant="dialog"
              className="h-8 w-8"
              onClick={() => setDeleteCount(Math.min(deleteCount + 1, enabledRemoveCount))}
            >
              <IconPlus stroke={2} />
            </Button>
          </div>
          {deleteCount > enabledRemoveCount ? (
            <p className="text-surface-danger">
              배정된 좌석이 있어 최대 {enabledRemoveCount}석까지만 삭제할 수 있습니다.
            </p>
          ) : (
            <p className="text-amber-300">삭제 후 {remaining}석이 남습니다.</p>
          )}
        </div>

        {/* 미리 보기 */}
        <DialogFooter className="bg-surface-secondary border-0 pb-2.5">
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
            onClick={() => {
              onConfirm(deleteCount);
              setOpen(false);
            }}
          >
            {deleteCount}석 삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
