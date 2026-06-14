import { useState } from 'react';
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

  const remaining = currentSeatCount - deleteCount;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        asChild
        onClick={(e) => {
          e.stopPropagation();
          if (rowId == null) {
            e.preventDefault();
            alert('먼저 열을 선택해주세요.');
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
          <DialogDescription className="text-content-secondary">
            끝 번호부터 삭제 됩니다.
          </DialogDescription>
        </DialogHeader>

        {/* 구역/열 정보 */}
        <div className="bg-surface-primary flex justify-between px-4 py-2 rounded-md">
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
              className="w-8 h-8"
              onClick={() => setDeleteCount(deleteCount - 1)}
            >
              <IconMinus stroke={2} />
            </Button>
            <input
              type="number"
              className="bg-surface-primary w-full h-8 rounded-lg text-center text-mist-50
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
            "
              min={1}
              max={currentSeatCount}
              value={deleteCount}
              onChange={(e) => setDeleteCount(Number(e.target.value))}
            />
            <Button
              variant="dialog"
              className="w-8 h-8"
              onClick={() => setDeleteCount(deleteCount + 1)}
            >
              <IconPlus stroke={2} />
            </Button>
          </div>
          <p className="danger-color">삭제 후 {remaining}석이 남습니다.</p>
        </div>

        {/* 미리 보기 */}
        <DialogFooter className="bg-surface-secondary border-0 pb-2.5">
          <DialogClose asChild>
            <Button variant="dialog">취소</Button>
          </DialogClose>
          <Button
            className="border border-mist-500"
            disabled={remaining < 0}
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
