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
      className={clsx('flex items-center gap-x-2', {
        'bg-mist-500 rounded-lg': isSelected,
      })}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(row.id);
      }}
    >
      <div className="flex">
        <span className={clsx('flex justify-center items-center w-6 text-sm', {})}>
          {row.rowName}
        </span>
        <div className="flex gap-x-1" onClick={(e) => e.stopPropagation()}>
          {row.seats.map((seat) => {
            return (
              // 분리
              <div key={seat.id} className="flex items-center">
                <Button className="secondary-bg primary-color border-0 w-8 h-8 text-sm">
                  {seat.seatNumber}
                </Button>
                {/* TODO 좌석 삭제는 끝에서부터 삭제 => 입력받기 */}
                {/*{isEditMode && isSelected && (*/}
                {/*  // 좌석 삭제 버튼*/}
                {/*  <p*/}
                {/*    className="flex items-center justify-center w-6"*/}
                {/*    onClick={(e) => {*/}
                {/*      e.stopPropagation();*/}
                {/*      onRemoveSeat(seat.id);*/}
                {/*    }}*/}
                {/*  >*/}
                {/*    x*/}
                {/*  </p>*/}
                {/*)}*/}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
