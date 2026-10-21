import { cn } from '@/lib/utils.ts';

export interface RowGapProps {
  /** 해당 화면의 좌석 행 높이와 동일하게 맞추기 위한 높이 클래스 (ex. h-8, h-10) */
  className?: string;
}

/** 구역 내 빈 줄(gap): 좌석 없이 1줄 높이의 빈 공간을 점선으로 표시 */
export default function RowGap({ className }: RowGapProps) {
  return (
    <div aria-hidden className={cn('flex items-center', className)}>
      <div className="border-primary/40 w-full border-t-2 border-dashed" />
    </div>
  );
}
