import useFloorStore from '@/store/floorStore.ts';
import useVenueStore from '@/store/venueStore.ts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/dialog.tsx';
import { AssignMemberModal } from '@/components/dialog/AssignMemberModal.tsx';
import SeatAssignSidebar from '@/components/seat-assign/SeatAssignSidebar.tsx';
import SeatAssignGrid from '@/components/seat-assign/SeatAssignGrid.tsx';
import ZoomControl from '@/components/common/ZoomControl.tsx';
import useZoomControls from '@/hooks/use-zoom-controls.ts';
import { cn } from '@/lib/utils.ts';
import { pageContentClass } from '@/constant/styles.ts';

export default function SeatAssignPage() {
  const { floors } = useFloorStore();
  const { venue } = useVenueStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFloorId, setSelectedFloorId] = useState<number | undefined>(undefined);
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (floors.length > 0 && selectedFloorId == undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedFloorId(floors[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floors]);

  const { currentScale, handleScaleChange, setTransformRef, zoomIn, zoomOut } =
    useZoomControls(selectedFloorId);

  return (
    <div className="flex h-full overflow-hidden">
      <Tabs
        className={cn(pageContentClass, 'flex min-h-0 flex-1 flex-col overflow-hidden')}
        value={String(selectedFloorId)}
        onValueChange={(v) => setSelectedFloorId(Number(v))}
      >
        <div className="flex items-center justify-between">
          <TabsList variant="default">
            {floors.map((floor) => (
              <TabsTrigger variant="default" key={floor.id} value={String(floor.id)}>
                {floor.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Zoom controls */}
          <ZoomControl scale={currentScale} onZoomIn={zoomIn} onZoomOut={zoomOut} />
        </div>

        {/* 좌측 메인 */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {floors.map((floor) => (
            <SeatAssignGrid
              key={floor.id}
              floor={floor}
              stagePosition={venue?.stagePosition ?? 'front'}
              isBulkEditMode={isBulkEditMode}
              setIsBulkEditMode={setIsBulkEditMode}
              selectedSeatIds={selectedSeatIds}
              setSelectedSeatIds={setSelectedSeatIds}
              setIsModalOpen={setIsModalOpen}
              transformRef={setTransformRef(floor.id)}
              onScaleChange={handleScaleChange}
            />
          ))}
        </div>
      </Tabs>
      <SeatAssignSidebar />

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
