import { createPortal } from 'react-dom';
import type { SelectionBox } from '@/hooks/use-drag-select.ts';

export interface DragSelectBoxProps {
  box: SelectionBox | null;
}

/** 드래그 선택 사각형 (확대/축소 transform의 영향을 받지 않도록 body에 포털로 렌더링) */
export default function DragSelectBox({ box }: DragSelectBoxProps) {
  if (!box) return null;
  return createPortal(
    <div
      aria-hidden
      className="border-primary bg-primary/10 pointer-events-none fixed z-50 border border-dashed"
      style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
    />,
    document.body,
  );
}
