import { cn } from '@/lib/utils.ts';

export interface RowGapProps {
  /** 해당 화면의 좌석 행 높이와 동일하게 맞추기 위한 높이 클래스 (ex. h-8, h-10) */
  className?: string;
  /** 구역 설정 화면에서 빈 줄을 선택(삭제 대상 지정)할 수 있을 때만 전달 */
  onClick?: () => void;
  isSelected?: boolean;
}

/** 구역 내 빈 줄(gap): 좌석 없이 1줄 높이의 빈 공간을 점선으로 표시 */
export default function RowGap({ className, onClick, isSelected = false }: RowGapProps) {
  return (
    <div
      aria-hidden={onClick ? undefined : true}
      className={cn(
        'flex items-center rounded-md',
        onClick && 'cursor-pointer',
        isSelected && 'bg-primary/10 ring-primary ring-1',
        className,
      )}
      onClick={
        onClick
          ? (e) => {
              e.stopPropagation();
              onClick();
            }
          : undefined
      }
    >
      <div className="border-primary/40 w-full border-t-2 border-dashed" />
    </div>
  );
}
