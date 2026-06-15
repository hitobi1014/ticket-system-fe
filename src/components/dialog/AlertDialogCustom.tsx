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

interface Props {
  variant: VariantProps<typeof buttonVariants>['variant'];
  size: VariantProps<typeof buttonVariants>['size'];
  title: string;
  triggerText: string;
  description: string;
  dialogActionBtnText: string;
  onConfirm?: () => void;
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
  dialogActionBtnText,
  onConfirm,
}: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant}>
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
          <AlertDialogCancel variant={variant}>닫기</AlertDialogCancel>
          <AlertDialogAction variant={variant} size={size} onClick={onConfirm}>
            {dialogActionBtnText ?? '확인'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
