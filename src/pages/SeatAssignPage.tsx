import useFloorStore from '@/store/floorStore.ts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { useState } from 'react';
import AssignRow from '@/components/seat/AssignRow.tsx';
import { Toggle } from '@/components/ui/toggle';
import { SquareIcon } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog.tsx';
import { AssignMemberModal } from '@/components/modal/AssignMemberModal.tsx';
import { Button } from '@/components/ui/button.tsx';

export default function SeatAssignPage() {
  const { floors } = useFloorStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(
    floors.length > 0 ? floors[0].id : null,
  );
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);

  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<number>>(new Set());
  const handleSeatClick = (seatId: number) => {
    if (isBulkEditMode) {
      // seat id 추가 => 배열로 저장
      setIsModalOpen(false);
      setSelectedSeatIds((prev) => {
        const next = new Set(prev);
        if (next.has(seatId)) {
          next.delete(seatId);
        } else {
          next.add(seatId);
        }
        return next;
      });
    } else {
      setSelectedSeatIds(new Set([seatId]));
      setIsModalOpen(true);
    }
  };

  return (
    <div>
      <div>
        <div>
          <div>
            <Tabs
              value={String(selectedFloorId)}
              onValueChange={(v) => setSelectedFloorId(Number(v))}
            >
              <div className="bg-gray-700 flex py-2 items-center">
                <span className="text-white mx-4">좌석배정</span>
                <TabsList>
                  {floors.map((floor) => (
                    <TabsTrigger key={floor.id} value={String(floor.id)}>
                      {floor.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {floors.map((floor) => (
                <TabsContent key={floor.id} value={String(floor.id)}>
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
              ))}
            </Tabs>
          </div>
        </div>
        <div>우측사이드영역</div>
      </div>

      {/* 회원 좌석 배정 모달 => 모달은 페이지(최상위)레벨에 배치 */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsModalOpen(false);
            setSelectedSeatIds(new Set());
          }
        }}
      >
        <AssignMemberModal
          key={[...selectedSeatIds].join(',')}
          seatIds={selectedSeatIds}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSeatIds(new Set());
          }}
        />
      </Dialog>
    </div>
  );
}
