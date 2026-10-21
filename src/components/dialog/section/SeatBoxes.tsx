import { useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils.ts';

const TAIL_COUNT = 3; // 줄여서 표기할 때 끝에 항상 보여줄 번호 수
const GAP_PX = 4; // gap-x-1
const ELLIPSIS_PX = 20; // 생략 표시(...) 너비 (w-5)
const seatBoxClass = cn(
  'flex h-5 min-w-5 shrink-0 items-center justify-center rounded-sm border px-0.5 text-center text-sm',
);

/** 번호 자릿수에 따른 박스 너비 추정치 (min-w-5 = 20px, 글자당 약 8px + 좌우 패딩/테두리) */
const estimateBoxWidth = (n: number) => Math.max(20, String(n).length * 8 + 6);

export interface SeatBoxesProps {
  /** 화면 좌→우 순서의 좌석 번호 */
  numbers: number[];
}

/**
 * 좌석 번호 박스 한 줄. 부모 너비를 넘으면 중간을 '...'으로 줄이고 마지막 3개 번호는 항상 표시
 * ex) 91 92 ... 103 104 105
 */
export default function SeatBoxes({ numbers }: SeatBoxesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setAvailableWidth(el.clientWidth);
    const observer = new ResizeObserver(() => setAvailableWidth(el.clientWidth));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const widthOf = (nums: number[]) =>
    nums.reduce((sum, n) => sum + estimateBoxWidth(n), 0) + Math.max(nums.length - 1, 0) * GAP_PX;

  let head = numbers;
  let tail: number[] = [];
  let truncated = false;

  if (availableWidth != null && widthOf(numbers) > availableWidth) {
    truncated = true;
    tail = numbers.slice(-TAIL_COUNT);
    // 앞쪽 번호는 (끝 번호 + 생략 표시)를 제외한 남은 너비만큼 채움
    const budget = availableWidth - widthOf(tail) - ELLIPSIS_PX - GAP_PX * 2;
    let used = 0;
    let count = 0;
    const candidates = numbers.slice(0, Math.max(numbers.length - TAIL_COUNT, 0));
    for (const n of candidates) {
      const next = used + estimateBoxWidth(n) + (count > 0 ? GAP_PX : 0);
      if (next > budget) break;
      used = next;
      count += 1;
    }
    head = candidates.slice(0, count);
  }

  return (
    <div ref={containerRef} className="flex min-w-0 flex-1 gap-x-1 overflow-hidden">
      {head.map((n, i) => (
        <div key={`h-${i}`} className={seatBoxClass}>
          {n}
        </div>
      ))}
      {truncated && (
        <div className="text-secondary h-5 w-5 shrink-0 text-center text-sm">...</div>
      )}
      {tail.map((n, i) => (
        <div key={`t-${i}`} className={seatBoxClass}>
          {n}
        </div>
      ))}
    </div>
  );
}
