import { Button, buttonVariants } from '@/components/ui/button.tsx';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';

export interface FunctionButtonsProps {
  buttons: ButtonItem[];
}

export interface ButtonItem {
  variant?: VariantProps<typeof buttonVariants>['variant'];
  size?: VariantProps<typeof buttonVariants>['size'];
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export default function FunctionButtons({ buttons }: FunctionButtonsProps) {
  return (
    <div className="flex gap-x-2 justify-end">
      {buttons.map((btn, i) => (
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
      ))}
    </div>
  );
}
