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

interface Props {
  title: string;
  buttonText: string;
  icon?: React.ReactNode;
  size?: VariantProps<typeof buttonVariants>['size'];
  disabled?: boolean;
  sectionName: string;
  rowName: string;
  currentSeatCount: number;
  onConfirm: (deleteCount: number) => void;
}

export function RemoveSeatDialog({
  title,
  buttonText,
  icon,
  size,
  disabled,
  sectionName,
  rowName,
  currentSeatCount,
  onConfirm,
}: Props) {
  const [open, setOpen] = useState(false);
  const [deleteCount, setDeleteCount] = useState(1);

  const remaining = currentSeatCount - deleteCount;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size} disabled={disabled}>
          {icon}
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* 구역/열 정보, 입력, 미리보기 */}
        <div>
          {sectionName} {rowName}열 — 현재 {currentSeatCount}석
        </div>
        <input
          type="number"
          min={1}
          max={currentSeatCount}
          value={deleteCount}
          onChange={(e) => setDeleteCount(Number(e.target.value))}
        />
        <p>{remaining}석 남음</p>

        <DialogFooter>
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
