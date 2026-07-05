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
        'bg-mist-500 rounded-lg': isSelected,
      })}
      onClick={(e) => {
        e.stopPropagation();
        onClick(row.id);
      }}
    >
      <div className="flex">
        <span className={clsx('flex justify-center items-center w-6 text-sm', {})}>
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
                    'w-8 h-8 text-sm border-0',
                    !isVisible && 'opacity-30 pointer-events-none border-0 bg-transparent text-transparent',
                    isVisible && 'bg-surface-primary text-content-primary',
                    isSeatSelected && isEditMode && 'ring-2 ring-blue-500',
                  )}
                  onClick={(e) => {
                    if (isEditMode && onSeatClick && isVisible) {
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
