import { Button } from '@/components/ui/button.tsx';
import type { Rows } from '@/types';
import { clsx } from 'clsx';

interface RowProps {
  row: Rows;
  isSelected: boolean;
  onClick: (rowId: number) => void;
}

export default function Row({ row, isSelected, onClick }: RowProps) {
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
        {/*<div className="flex gap-x-1" onClick={(e) => e.stopPropagation()}>*/}
        <div className="flex gap-x-1">
          {row.seats.map((seat) => {
            return (
              // 분리
              <div key={seat.id} className="flex items-center">
                <Button className="primary-bg primary-color border-0 w-8 h-8 text-sm">
                  {seat.seatNumber}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
