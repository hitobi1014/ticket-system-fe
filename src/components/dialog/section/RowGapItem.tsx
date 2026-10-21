import { IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/button.tsx';

export interface RowGapItemProps {
  onRemove: () => void;
}

/** 2단계 열 목록에서 빈 줄 항목 (이름/좌석 수 입력 없음) */
export default function RowGapItem({ onRemove }: RowGapItemProps) {
  return (
    <div className="border-primary/40 text-secondary flex items-center gap-x-3 rounded-md border border-dashed px-2 py-1 text-sm">
      <p className="w-8 text-center">빈 줄</p>
      <div className="border-primary/40 flex-1 border-t-2 border-dashed" />
      <Button
        variant="ghost"
        size="icon-xs"
        className="text-primary shrink-0"
        aria-label="빈 줄 삭제"
        onClick={onRemove}
      >
        <IconX stroke={2} size={14} />
      </Button>
    </div>
  );
}
