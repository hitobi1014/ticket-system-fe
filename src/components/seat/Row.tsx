import { Button } from '@/components/ui/button.tsx';
import type { Rows } from '@/types';
import { clsx } from 'clsx';
import { cn } from '@/lib/utils.ts';

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
      className={clsx('flex items-center gap-x-2', {
        'rounded-lg bg-mist-500': isSelected,
      })}
      onClick={(e) => {
        e.stopPropagation();
        onClick(row.id);
      }}
    >
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
                    'h-8 w-8 border-0 text-sm',
                    !isVisible && 'bg-surface-danger border-0 text-transparent opacity-15',
                    isVisible && 'bg-surface-primary text-content-primary',
                    isSeatSelected && isEditMode && isVisible && 'ring-2 ring-blue-500',
                    isSeatSelected &&
                      isEditMode &&
                      !isVisible &&
                      'ring-content-danger opacity-80 ring-2',
                  )}
                  onClick={(e) => {
                    if (isEditMode && onSeatClick) {
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
