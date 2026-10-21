import { IconMinus, IconPlus } from '@tabler/icons-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils.ts';
import SeatBoxes from '@/components/dialog/section/SeatBoxes.tsx';

export interface RowSeatCountEditorProps {
  rowName: string;
  seatCount: number;
  onChange: (seatCount: number) => void;
}

export default function RowSeatCountEditor({
  rowName,
  seatCount,
  onChange,
}: RowSeatCountEditorProps) {
  return (
    <div className="flex items-center gap-x-3 rounded-md border px-2 py-1">
      <p className="w-8 text-center">{rowName}열</p>
      <div className="flex gap-x-2">
        <Button
          variant="dialog"
          className={cn('border-border h-6 w-6')}
          onClick={() => onChange(seatCount - 1)}
        >
          <IconMinus stroke={2} />
        </Button>
        <Input
          aria-label="seat-input"
          type="number"
          min={1}
          value={seatCount}
          onChange={(e) => onChange(Number(e.target.value))}
          className="no-spinners h-6 w-12 text-center text-sm"
        />
        <Button
          variant="dialog"
          className={cn('border-border h-6 w-6')}
          onClick={() => onChange(seatCount + 1)}
        >
          <IconPlus stroke={2} />
        </Button>
      </div>
      <div className="flex gap-x-1">
        <SeatBoxes count={seatCount} />
      </div>
    </div>
  );
}
