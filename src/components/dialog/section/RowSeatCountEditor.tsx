import { IconMinus, IconPlus } from '@tabler/icons-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils.ts';
import SeatBoxes from '@/components/dialog/section/SeatBoxes.tsx';

export interface RowSeatCountEditorProps {
  rowName: string;
  seatCount: number;
  /** 번호 방식이 적용된 좌석 번호 (화면 좌→우 순서) */
  seatNumbers: number[];
  onChange: (seatCount: number) => void;
}

export default function RowSeatCountEditor({
  rowName,
  seatCount,
  seatNumbers,
  onChange,
}: RowSeatCountEditorProps) {
  return (
    <div className="flex items-center gap-x-3 rounded-md border px-2 py-1">
      <p className="w-8 shrink-0 text-center">{rowName}열</p>
      <div className="flex shrink-0 gap-x-2">
        <Button
          variant="dialog"
          tabIndex={-1}
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
          tabIndex={-1}
          className={cn('border-border h-6 w-6')}
          onClick={() => onChange(seatCount + 1)}
        >
          <IconPlus stroke={2} />
        </Button>
      </div>
      <SeatBoxes numbers={seatNumbers} />
    </div>
  );
}
