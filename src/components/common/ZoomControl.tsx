import { useEffect, useRef, useState } from 'react';
import { IconMinus, IconPlus, IconZoomIn } from '@tabler/icons-react';
import { Button } from '@/components/ui/button.tsx';

export interface ZoomControlProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  'data-tour'?: string;
}

/** 확대/축소 드롭다운 (바깥 클릭 시 닫힘) */
export default function ZoomControl({ scale, onZoomIn, onZoomOut, ...rest }: ZoomControlProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative" {...rest}>
      <Button
        variant="ghost"
        size="lg"
        className="text-primary"
        onClick={() => setIsOpen((v) => !v)}
      >
        <IconZoomIn stroke={1.5} size={18} />
      </Button>
      {isOpen && (
        <div className="bg-popover text-primary border-accent absolute top-full right-0 z-50 mt-1 flex items-center gap-x-0.5 rounded-md border px-1.5 py-1 shadow-md">
          <Button variant="ghost" size="icon-xs" onClick={onZoomOut}>
            <IconMinus stroke={2} size={14} />
          </Button>
          <span className="w-10 text-center text-xs tabular-nums">{Math.round(scale * 100)}%</span>
          <Button variant="ghost" size="icon-xs" onClick={onZoomIn}>
            <IconPlus stroke={2} size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}
