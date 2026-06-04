import { Button } from '@/components/ui/button.tsx';
import type { Rows } from '@/types';
import { clsx } from 'clsx';

interface RowProps {
  row: Rows;
  isEditMode: boolean;
  isSelected: boolean;
  onSelect: (rowId: number) => void;
  onRemoveSeat: (seatId: number) => void;
}

export default function Row({ row, isEditMode, isSelected, onSelect, onRemoveSeat }: RowProps) {
  return (
    <div
      key={row.id}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(row.id);
      }}
    >
      <div className="border-2 flex">
        <span
          className={clsx('flex w-10 h-10 justify-center items-center text-lg mr-3', {
            'bg-teal-700 text-white': isSelected,
          })}
        >
          {row.rowName}/{row.id}
        </span>
        {row.seats.map((seat) => {
          return (
            // 분리
            <div key={seat.id} className="flex items-center">
              <Button variant="outline" className="w-10 h-10 text-sm bg-gray-800 text-white">
                {seat.seatNumber}
              </Button>
              {isEditMode && isSelected && (
                // 좌석 삭제 버튼
                <p
                  className="flex items-center justify-center w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSeat(seat.id);
                  }}
                >
                  x
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
