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
      <DialogContent className="secondary-bg">
        <DialogHeader>
          <DialogTitle className="primary-color flex items-center gap-x-2">
            <IconTrash className="text-red-500" stroke={1.5} />
            <p>{title}</p>
          </DialogTitle>
          <DialogDescription className="secondary-color">
            끝 번호부터 삭제 됩니다.
          </DialogDescription>
        </DialogHeader>

        {/* 구역/열 정보 */}
        <div className="primary-bg  flex justify-between px-4 py-2 rounded-md">
          <div>
            <p className="text-mist-400">구역</p>
            <p className="primary-color">
              {sectionName} {rowName}열
            </p>
          </div>
          <div>
            <p className="text-mist-400">현재 좌석 수</p>
            <p className="primary-color text-right">{currentSeatCount}석</p>
          </div>
        </div>

        {/* 입력*/}
        <div className="flex items-center justify-center gap-x-2 py-4">
          <Button className="w-8 h-8 border border-mist-500">
            <IconPlus stroke={2} />
          </Button>
          <input
            type="number"
            className="w-full h-full bg-mist-400 text-center text-mist-50"
            min={1}
            max={currentSeatCount}
            value={deleteCount}
            onChange={(e) => setDeleteCount(Number(e.target.value))}
          />
          <Button className="w-8 h-8 border border-mist-500">
            <IconMinus stroke={2} />
          </Button>
        </div>
        <p>{remaining}석 남음</p>

        {/* 미리 보기 */}
        <DialogFooter className="secondary-bg">
          <DialogClose asChild>
            <Button variant="cancel">취소</Button>
          </DialogClose>
          <Button
            variant="confirm"
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
