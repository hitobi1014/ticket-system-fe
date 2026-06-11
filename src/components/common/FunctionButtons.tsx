import { Button, buttonVariants } from '@/components/ui/button.tsx';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';
import AlertDialogCustom from '@/components/dialog/AlertDialogCustom.tsx';
import { RemoveSeatDialog } from '@/components/dialog/RemoveSeatDialog.tsx';

export interface FunctionButtonsProps {
  buttons: ButtonItem[];
}

export interface ButtonItem {
  variant?: VariantProps<typeof buttonVariants>['variant'];
  size?: VariantProps<typeof buttonVariants>['size'];
  text?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;

  // AlertDialogCustom 위한 props
  confirm?: {
    text: string;
    title: string;
    description: string;
    onConfirm: () => void;
  };

  dialog?: {
    dialogTitle: string;
    type: 'removeSeat'; // 추후 추가시 type 변경
    rowId?: number;
    currentSeatCount: number;
    sectionName: string;
    rowName: string;
    onClick: (removeCnt: number) => void;
  };
}

export default function FunctionButtons({ buttons }: FunctionButtonsProps) {
  const getVariant = (variant: VariantProps<typeof buttonVariants>['variant']) => {
    return variant ?? 'primary';
  };
  const getSize = (size: VariantProps<typeof buttonVariants>['size']) => {
    return size ?? 'base';
  };
  return (
    <div className="flex gap-x-2 justify-end" onClick={(e) => e.stopPropagation()}>
      {buttons.map((btn, i) =>
        btn.dialog?.type === 'removeSeat' ? (
          <RemoveSeatDialog
            key={i}
            title={btn.dialog.dialogTitle}
            rowId={btn.dialog.rowId}
            buttonText={btn.text!}
            icon={btn.icon}
            variant={getVariant(btn.variant)}
            size={getSize(btn.size)}
            disabled={btn.disabled}
            onConfirm={btn.dialog.onClick}
            {...btn.dialog}
          />
        ) : btn.confirm ? (
          <AlertDialogCustom
            key={i}
            variant={getVariant(btn.variant)}
            size={getSize(btn.size)}
            buttonText={btn.text!}
            title={btn.confirm.title}
            description={btn.confirm.description}
            onConfirm={btn.confirm.onConfirm}
            disabled={btn.disabled}
            icon={btn.icon}
          />
        ) : (
          <Button
            key={i}
            variant={getVariant(btn.variant)}
            size={getSize(btn.size)}
            onClick={btn.onClick}
            disabled={btn.disabled}
            className={btn.className}
          >
            {btn.icon}
            {btn.text}
          </Button>
        ),
      )}
    </div>
  );
}
