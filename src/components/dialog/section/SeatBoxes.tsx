import { cn } from '@/lib/utils.ts';

const MAX_VISIBLE = 16; // 보여줄 최대 박스 수
const seatBoxClass = cn(
  'flex h-5 w-5 items-center justify-center rounded-sm border text-center text-sm',
);

export interface SeatBoxesProps {
  count: number;
}

export default function SeatBoxes({ count }: SeatBoxesProps) {
  if (count <= MAX_VISIBLE) {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={cn(seatBoxClass)}>
            {i + 1}
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {Array.from({ length: MAX_VISIBLE - 2 }).map((_, i) => (
        <div key={i} className={cn(seatBoxClass)}>
          {i + 1}
        </div>
      ))}
      <div key="ellipsis" className="text-secondary h-5 w-5 text-center text-sm">
        ...
      </div>
      <div key="last" className={cn(seatBoxClass)}>
        {count}
      </div>
    </>
  );
}
