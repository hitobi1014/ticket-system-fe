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
        'border-muted-foreground flex cursor-pointer items-center justify-center self-stretch rounded-md border px-3',
        isSelected && 'ring-primary bg-secondary/10 border-0 ring-2',
      )}
    >
      <div className="bg-primary h-2/4 w-px" />
    </div>
  );
}
