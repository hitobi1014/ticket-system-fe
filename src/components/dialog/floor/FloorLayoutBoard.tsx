import { useState } from 'react';
import { cn } from '@/lib/utils.ts';
import type { FloorItemDropTarget } from '@/lib/floorUtils.ts';
import type { FloorItem, FloorLayoutItemRef, FloorRow } from '@/types';

export interface FloorLayoutBoardProps {
  rows: FloorRow[];
  onMove: (ref: FloorLayoutItemRef, target: FloorItemDropTarget) => void;
}

const itemKey = (ref: FloorLayoutItemRef) => `${ref.kind}-${ref.id}`;

interface DropZoneProps {
  active: boolean;
  /** 드래그 중일 때만 영역을 보여준다 */
  visible: boolean;
  orientation: 'vertical' | 'horizontal';
  onEnter: () => void;
  onDrop: () => void;
}

/** 드롭 위치 표시 영역 (구역 사이 / 구역 열 사이) */
function DropZone({ active, visible, orientation, onEnter, onDrop }: DropZoneProps) {
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={onEnter}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      className={cn(
        'shrink-0 rounded-full transition-colors',
        orientation === 'vertical' ? 'w-3 self-stretch' : 'h-3 w-full',
        visible && 'bg-primary/10',
        active && 'bg-primary',
      )}
    />
  );
}

function ItemCard({
  item,
  onDragStart,
  onDragEnd,
}: {
  item: FloorItem;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', itemKey(item));
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className={cn(
        'cursor-grab rounded-md border text-sm select-none active:cursor-grabbing',
        item.kind === 'section'
          ? 'border-primary bg-card flex min-w-24 flex-col items-center px-4 py-3'
          : 'border-muted-foreground/40 text-muted-foreground flex items-center border-dashed px-3 py-3 text-xs',
      )}
    >
      {item.kind === 'section' ? (
        <>
          <span className="font-medium">{item.name}</span>
          <span className="text-secondary text-xs">
            {item.rows.flatMap((r) => r.seats).length}석
          </span>
        </>
      ) : (
        <span>{item.label ?? '통로'}</span>
      )}
    </div>
  );
}

/** 구역 열별로 구역/통로 카드를 보여주고 드래그로 옮기는 보드 (좌석은 표시하지 않음) */
export default function FloorLayoutBoard({ rows, onMove }: FloorLayoutBoardProps) {
  const [dragging, setDragging] = useState<FloorLayoutItemRef | null>(null);
  const [activeZone, setActiveZone] = useState<string | null>(null);

  const isDragging = dragging !== null;

  const drop = (target: FloorItemDropTarget) => {
    if (dragging) onMove(dragging, target);
    setDragging(null);
    setActiveZone(null);
  };

  const newRowZone = (rowIndex: number) => {
    const zone = `new-${rowIndex}`;
    return (
      <DropZone
        key={zone}
        orientation="horizontal"
        visible={isDragging}
        active={activeZone === zone}
        onEnter={() => setActiveZone(zone)}
        onDrop={() => drop({ type: 'newRow', rowIndex })}
      />
    );
  };

  return (
    <div className="flex flex-col gap-y-1">
      {newRowZone(0)}
      {rows.map((row, rowIndex) => (
        <div key={row.id} className="flex flex-col gap-y-1">
          <div className="flex items-center gap-x-2">
            <span className="text-secondary w-10 shrink-0 text-xs">{rowIndex + 1}열</span>
            <div className="flex min-h-14 flex-1 items-stretch overflow-x-auto">
              {row.items.map((item, index) => {
                const zone = `${row.id}-${index}`;
                return (
                  <div key={itemKey(item)} className="flex items-stretch">
                    <DropZone
                      orientation="vertical"
                      visible={isDragging}
                      active={activeZone === zone}
                      onEnter={() => setActiveZone(zone)}
                      onDrop={() => drop({ type: 'row', floorRowId: row.id, index })}
                    />
                    <ItemCard
                      item={item}
                      onDragStart={() => setDragging({ kind: item.kind, id: item.id })}
                      onDragEnd={() => {
                        setDragging(null);
                        setActiveZone(null);
                      }}
                    />
                  </div>
                );
              })}
              <DropZone
                orientation="vertical"
                visible={isDragging}
                active={activeZone === `${row.id}-${row.items.length}`}
                onEnter={() => setActiveZone(`${row.id}-${row.items.length}`)}
                onDrop={() => drop({ type: 'row', floorRowId: row.id, index: row.items.length })}
              />
            </div>
          </div>
          {newRowZone(rowIndex + 1)}
        </div>
      ))}
    </div>
  );
}
