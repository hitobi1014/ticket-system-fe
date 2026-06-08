import { TabsContent } from '@/components/ui/tabs.tsx';
import { Toggle } from '@/components/ui/toggle.tsx';
import { SquareIcon } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import AssignRow from '@/components/seat/AssignRow.tsx';
import type { Floor } from '@/types';

interface SeatAssignGridProps {
  floor: Floor;
  isBulkEditMode: boolean;
  setIsBulkEditMode: (isBulkEditMode: boolean) => void;
  selectedSeatIds: Set<number>;
  setSelectedSeatIds: (selectedSeatIds: Set<number>) => void;
  setIsModalOpen: (isModalOpen: boolean) => void;
}

export default function SeatAssignGrid({
  floor,
  isBulkEditMode,
  setIsBulkEditMode,
  selectedSeatIds,
  setSelectedSeatIds,
  setIsModalOpen,
}: SeatAssignGridProps) {
  const handleSeatClick = (seatId: number) => {
    if (isBulkEditMode) {
      // seat id 추가 => 배열로 저장
      setIsModalOpen(false);

      const next = new Set(selectedSeatIds);
      if (next.has(seatId)) {
        next.delete(seatId);
      } else {
        next.add(seatId);
      }
      setSelectedSeatIds(next);
    } else {
      setSelectedSeatIds(new Set([seatId]));
      setIsModalOpen(true);
    }
  };

  return (
    <TabsContent value={String(floor.id)}>
      <Toggle
        pressed={isBulkEditMode}
        onPressedChange={(pressed) => {
          setIsBulkEditMode(pressed);
          if (!pressed) setSelectedSeatIds(new Set());
        }}
      >
        <SquareIcon className="group-data-[state=on]/toggle:fill-foreground" />
        일괄편집모드
      </Toggle>
      {isBulkEditMode && (
        <>
          <Button onClick={() => setIsModalOpen(true)}>모달열기</Button>
          <span>선택된seat: {selectedSeatIds.size}</span>
        </>
      )}
      <div className="flex">
        {floor.items.map((item) => (
          <div key={item.id} className="flex">
            {item.kind === 'aisle' ? (
              <div key={item.id} className="border-2 border-dashed bg-gray-100">
                통로: {item.label}
              </div>
            ) : (
              <AssignRow
                section={item}
                isBulkEditMode={isBulkEditMode}
                selectedSeatIds={selectedSeatIds}
                onSeatClick={handleSeatClick}
              />
            )}
          </div>
        ))}
      </div>
    </TabsContent>
  );
}
