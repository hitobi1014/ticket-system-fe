import { cn } from '@/lib/utils.ts';

interface AisleDividerProps {
  onClick?: (e: React.MouseEvent) => void;
  isSelected?: boolean;
}

export default function AisleDivider({ onClick, isSelected }: AisleDividerProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center justify-center self-stretch rounded-md px-4',
        onClick && 'cursor-pointer',
        isSelected && 'ring-primary ring-2',
      )}
    >
      <div className="border-muted-foreground/40 h-1/2 border-l border-dashed" />
    </div>
  );
}
