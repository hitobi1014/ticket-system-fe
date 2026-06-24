import { Button, buttonVariants } from '@/components/ui/button.tsx';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';
import AlertDialogCustom, { type DialogAction } from '@/components/dialog/AlertDialogCustom.tsx';

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

  confirm?: {
    triggerText: string;
    title: string;
    description: string;
    actions: DialogAction[];
  };

  dialog?: React.ReactNode;
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
        btn.dialog ? (
          <React.Fragment key={i}>{btn.dialog}</React.Fragment>
        ) : btn.confirm ? (
          <AlertDialogCustom
            key={i}
            variant={getVariant(btn.variant)}
            size={getSize(btn.size)}
            triggerText={btn.text!}
            title={btn.confirm.title}
            description={btn.confirm.description}
            actions={btn.confirm.actions}
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
