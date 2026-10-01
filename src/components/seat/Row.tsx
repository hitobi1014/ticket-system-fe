import { Button } from '@/components/ui/button.tsx';
import type { Rows } from '@/types';
import { clsx } from 'clsx';
import { cn } from '@/lib/utils.ts';
import { emptySeatClass } from '@/constant/styles.ts';

interface RowProps {
  row: Rows;
  isSelected: boolean;
  onClick: (rowId: number) => void;
  selectedSeatIds?: Set<number>;
  onSeatClick?: (seatId: number) => void;
  isEditMode?: boolean;
}

export default function Row({
  row,
  isSelected,
  onClick,
  selectedSeatIds,
  onSeatClick,
  isEditMode,
}: RowProps) {
  return (
    <div
      key={row.id}
      className="flex items-center gap-x-2"
      onClick={(e) => {
        e.stopPropagation();
        onClick(row.id);
      }}
    >
      <div className={cn('w-1 self-stretch rounded-full', isSelected && 'bg-primary')} />
      <div className="flex">
        <span className={clsx('flex w-6 items-center justify-center text-sm', {})}>
          {row.rowName}
        </span>
        <div className="flex gap-x-1">
          {row.seats.map((seat) => {
            const isSeatSelected = selectedSeatIds?.has(seat.id) ?? false;
            const isVisible = seat.visible;

            return (
              <div key={seat.id} className="flex items-center">
                <Button
                  className={cn(
                    emptySeatClass,
                    'h-8 w-8',
                    !isVisible && 'bg-danger/50 border-0',
                    seat.assignedMemberId != null &&
                      'bg-success text-muted pointer-events-none border-0',
                    isSeatSelected && isEditMode && isVisible && 'bg-success/50 border-0',
                    isSeatSelected && isEditMode && !isVisible && 'ring-danger opacity-80 ring-2',
                  )}
                  onClick={(e) => {
                    if (isEditMode && onSeatClick && seat.assignedMemberId == null) {
                      e.stopPropagation();
                      onSeatClick(seat.id);
                    }
                  }}
                >
                  {isVisible ? seat.seatNumber : ''}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
