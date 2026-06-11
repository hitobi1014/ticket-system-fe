import useFloorStore from '@/store/floorStore.ts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog.tsx';
import { AssignMemberModal } from '@/components/dialog/AssignMemberModal.tsx';
import SeatAssignSidebar from '@/components/seat-assign/SeatAssignSidebar.tsx';
import SeatAssignGrid from '@/components/seat-assign/SeatAssignGrid.tsx';

export default function SeatAssignPage() {
  const { floors } = useFloorStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(
    floors.length > 0 ? floors[0].id : null,
  );
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);

  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<number>>(new Set());

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
                <TabsList>
                  {floors.map((floor) => (
                    <TabsTrigger key={floor.id} value={String(floor.id)}>
                      {floor.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <div className="flex gap-x-4">
                {/* 좌측 메인 */}
                {floors.map((floor) => (
                  <SeatAssignGrid
                    key={floor.id}
                    floor={floor}
                    isBulkEditMode={isBulkEditMode}
                    setIsBulkEditMode={setIsBulkEditMode}
                    selectedSeatIds={selectedSeatIds}
                    setSelectedSeatIds={setSelectedSeatIds}
                    setIsModalOpen={setIsModalOpen}
                  />
                ))}
                <SeatAssignSidebar />
              </div>
            </Tabs>
          </div>
        </div>
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
