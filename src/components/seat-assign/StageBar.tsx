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
        'bg-primary text-text-foreground flex shrink-0 items-center justify-center rounded-md text-sm font-medium',
        isVertical ? 'w-10 self-stretch [writing-mode:vertical-rl]' : 'h-10 w-full',
      )}
    >
      무대
    </div>
  );
}
