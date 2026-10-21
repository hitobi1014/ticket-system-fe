import { clsx } from 'clsx';
import { IconArrowNarrowLeft, IconArrowNarrowRight } from '@tabler/icons-react';
import { Button } from '@/components/ui/button.tsx';
import { DialogClose, DialogFooter } from '@/components/ui/dialog.tsx';
import CustomSpinner from '@/components/common/CustomSpinner.tsx';

export interface AddSectionFooterProps {
  step: 1 | 2;
  isSubmitting: boolean;
  totalSeatCount: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export default function AddSectionFooter({
  step,
  isSubmitting,
  totalSeatCount,
  onPrevious,
  onNext,
  onSubmit,
}: AddSectionFooterProps) {
  return (
    <DialogFooter className="pb-2.5">
      <div
        className={clsx('flex w-full items-center gap-x-2', {
          'justify-between': step === 2,
          'justify-end': step === 1,
        })}
      >
        {step === 2 && (
          <Button variant="dialog" onClick={onPrevious}>
            <IconArrowNarrowLeft stroke={2} />
            이전
          </Button>
        )}
        <div className="flex gap-x-2">
          <DialogClose asChild>
            <Button variant="dialog">취소</Button>
          </DialogClose>
          {step === 1 ? (
            <Button variant="dialog" onClick={onNext}>
              <IconArrowNarrowRight stroke={2} />
              다음
            </Button>
          ) : (
            <Button variant="dialog" disabled={isSubmitting} onClick={onSubmit}>
              {isSubmitting ? (
                <CustomSpinner text="처리 중..." />
              ) : (
                `구역 추가 완료(${totalSeatCount})석`
              )}
            </Button>
          )}
        </div>
      </div>
    </DialogFooter>
  );
}
