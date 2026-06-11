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
  buttonText: string;
  title: string;
  description: string;
  onConfirm?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export default function AlertDialogCustom({
  icon,
  variant,
  size,
  buttonText,
  title,
  description,
  onConfirm,
}: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="cancel">{buttonText}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="popup-title">{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="close">닫기</AlertDialogCancel>
          <AlertDialogAction variant={variant} size={size} onClick={onConfirm}>
            {icon}
            {buttonText ?? '확인'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
