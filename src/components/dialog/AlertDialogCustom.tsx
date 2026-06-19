import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button.tsx';
import * as React from 'react';
import type { VariantProps } from 'class-variance-authority';

export interface DialogAction {
  text: string;
  variant?: VariantProps<typeof buttonVariants>['variant'];
  size?: VariantProps<typeof buttonVariants>['size'];
  onClick: () => void;
}

interface Props {
  variant: VariantProps<typeof buttonVariants>['variant'];
  size: VariantProps<typeof buttonVariants>['size'];
  title: string;
  triggerText: string;
  description: string;
  actions: DialogAction[];
  disabled?: boolean;
  icon?: React.ReactNode;
}

export default function AlertDialogCustom({
  icon,
  variant,
  size,
  triggerText,
  title,
  description,
  actions,
  disabled,
}: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} disabled={disabled} onClick={(e) => e.stopPropagation()}>
          {icon}
          {triggerText}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-surface-primary">
        <AlertDialogHeader className="text-content-primary">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-content-secondary">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="bg-surface-primary border-t-surface-secondary">
          <AlertDialogCancel variant={variant} size={size}>
            닫기
          </AlertDialogCancel>
          {actions.map((action, i) => (
            <AlertDialogAction
              key={i}
              variant={action.variant ?? variant}
              size={action.size ?? size}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
            >
              {action.text}
            </AlertDialogAction>
          ))}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
