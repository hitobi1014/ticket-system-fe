import type { StagePosition } from '@/types';
import { cn } from '@/lib/utils';

interface StageBarProps {
  position: StagePosition;
}

export default function StageBar({ position }: StageBarProps) {
  const isVertical = position === 'left' || position === 'right';

  return (
    <div
      className={cn(
        'bg-blue-900 text-white rounded-md flex items-center justify-center text-sm font-medium shrink-0',
        isVertical ? 'w-10 self-stretch [writing-mode:vertical-rl]' : 'h-10 w-full',
      )}
    >
      무대
    </div>
  );
}
