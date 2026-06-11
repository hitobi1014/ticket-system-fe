import { Button, buttonVariants } from '@/components/ui/button.tsx';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';
import AlertDialogCustom from '@/components/dialog/AlertDialogCustom.tsx';

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
    type: 'removeSeat'; // 추후 추가시 type 변경
    rowId: number;
    currentSeatCount: number;
    sectionName: string;
    rowName: string;
  };
}

export default function FunctionButtons({ buttons }: FunctionButtonsProps) {
  return (
    <div className="flex gap-x-2 justify-end">
      {buttons.map((btn, i) =>
        btn.confirm ? (
          <AlertDialogCustom
            key={i}
            variant={btn.variant ?? 'primary'}
            size={btn.size}
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
            variant={btn.variant ?? 'primary'}
            size={btn.size ?? 'base'}
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
