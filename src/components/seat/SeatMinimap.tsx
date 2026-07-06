import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useControls, useTransformContext, useTransformComponent } from 'react-zoom-pan-pinch';
import type { Floor } from '@/types';
import { cn } from '@/lib/utils';

const MINIMAP_W = 180;
const MINIMAP_H = 110;

interface SeatMinimapProps {
  floor: Floor;
  highlightColorMap?: Map<number, string>;
}

function MinimapContent({ floor, highlightColorMap }: SeatMinimapProps) {
  const ctx = useTransformContext();
  const controls = useControls();
  const { scale, positionX, positionY } = useTransformComponent((s) => ({
    scale: s.state.scale,
    positionX: s.state.positionX,
    positionY: s.state.positionY,
  }));

  const [contentSize, setContentSize] = useState({ w: 0, h: 0 });
  const [wrapperSize, setWrapperSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const contentEl = ctx.contentComponent;
    const wrapperEl = ctx.wrapperComponent;
    if (!contentEl || !wrapperEl) return;

    const update = () => {
      setContentSize({ w: contentEl.offsetWidth, h: contentEl.offsetHeight });
      setWrapperSize({ w: wrapperEl.clientWidth, h: wrapperEl.clientHeight });
    };

    update();
    const obs = new ResizeObserver(update);
    obs.observe(contentEl);
    obs.observe(wrapperEl);
    return () => obs.disconnect();
  }, [ctx.contentComponent, ctx.wrapperComponent]);

  const minimapScale =
    contentSize.w > 0 && contentSize.h > 0
      ? Math.min(MINIMAP_W / contentSize.w, MINIMAP_H / contentSize.h)
      : 0;

  const viewportW = wrapperSize.w > 0 ? (wrapperSize.w / scale) * minimapScale : MINIMAP_W;
  const viewportH = wrapperSize.h > 0 ? (wrapperSize.h / scale) * minimapScale : MINIMAP_H;
  const viewportX = Math.max(0, (-positionX / scale) * minimapScale);
  const viewportY = Math.max(0, (-positionY / scale) * minimapScale);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!minimapScale || !wrapperSize.w) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const contentX = (e.clientX - rect.left) / minimapScale;
    const contentY = (e.clientY - rect.top) / minimapScale;
    controls.setTransform(
      -(contentX * scale - wrapperSize.w / 2),
      -(contentY * scale - wrapperSize.h / 2),
      scale,
      300,
      'easeOut',
    );
  };

  const isHighlightMode = (highlightColorMap?.size ?? 0) > 0;

  const sectionHasHighlight = (
    item: Extract<Floor['rows'][number]['items'][number], { kind: 'section' }>,
  ) =>
    isHighlightMode &&
    item.rows.some((row) =>
      row.seats.some(
        (seat) =>
          seat.assignedMemberId != null && (highlightColorMap?.has(seat.assignedMemberId) ?? false),
      ),
    );

  return createPortal(
    <div
      className="fixed bottom-4 right-4 z-50 rounded-lg overflow-hidden cursor-pointer shadow-lg border border-surface-accent bg-surface-secondary/95 backdrop-blur-sm select-none"
      style={{ width: MINIMAP_W, height: MINIMAP_H }}
      onClick={handleClick}
    >
      {/* Section layout */}
      <div className="absolute inset-0 p-1.5 flex flex-col gap-1">
        {floor.rows.map((floorRow) => (
          <div key={floorRow.id} className="flex gap-1 flex-1 min-h-0">
            {floorRow.items.map((item) =>
              item.kind === 'aisle' ? (
                <div key={`${item.kind}-${item.id}`} className="w-1.5 shrink-0" />
              ) : (
                <div
                  key={`${item.kind}-${item.id}`}
                  className={cn(
                    'relative flex-1 rounded-sm bg-surface-accent min-w-0',
                    sectionHasHighlight(item) && 'ring-1 ring-content-primary',
                  )}
                >
                  {sectionHasHighlight(item) && (
                    <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
              ),
            )}
          </div>
        ))}
      </div>

      {/* Viewport indicator */}
      {minimapScale > 0 && (
        <div
          className="absolute border border-white/60 rounded-xs pointer-events-none bg-white/10"
          style={{
            left: viewportX,
            top: viewportY,
            width: Math.min(MINIMAP_W - viewportX, viewportW),
            height: Math.min(MINIMAP_H - viewportY, viewportH),
          }}
        />
      )}
    </div>,
    document.body,
  );
}

export default function SeatMinimap(props: SeatMinimapProps) {
  return <MinimapContent {...props} />;
}
