import { clsx } from 'clsx';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx';

export interface AddSectionStepHeaderProps {
  step: 1 | 2;
}

export default function AddSectionStepHeader({ step }: AddSectionStepHeaderProps) {
  return (
    <DialogHeader className="pt-8">
      <DialogTitle className="text-primary flex items-center gap-x-2">
        {/* 스텝 프로그레스 */}
        <div className="flex flex-1 gap-x-2">
          <div className={clsx('h-1 flex-1 rounded-full', step >= 1 ? 'bg-primary' : 'bg-muted')} />
          <div className={clsx('h-1 flex-1 rounded-full', step >= 2 ? 'bg-primary' : 'bg-muted')} />
        </div>
      </DialogTitle>
      {step === 1 ? (
        <div>
          <header className="text-primary text-lg font-semibold">구역 추가</header>
          <DialogDescription className="text-secondary font-semibold">
            구역 기본 정보를 입력하세요
          </DialogDescription>
        </div>
      ) : (
        <div>
          <header className="text-primary text-lg font-semibold">구역 추가-열 상세 설정</header>
          <DialogDescription className="text-secondary font-semibold">
            각 열의 좌석 수를 조정하세요. 기본값은12석입니다.
          </DialogDescription>
        </div>
      )}
    </DialogHeader>
  );
}
