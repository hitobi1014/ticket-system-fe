import useFloorStore from '@/store/floorStore.ts';
import useVenueStore from '@/store/venueStore.ts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog } from '@/components/ui/dialog.tsx';
import { AssignMemberModal } from '@/components/dialog/AssignMemberModal.tsx';
import SeatAssignSidebar from '@/components/seat-assign/SeatAssignSidebar.tsx';
import SeatAssignGrid from '@/components/seat-assign/SeatAssignGrid.tsx';
import { Button } from '@/components/ui/button.tsx';
import { IconMinus, IconPlus, IconZoomIn } from '@tabler/icons-react';
import type { ReactZoomPanPinchContentRef } from 'react-zoom-pan-pinch';

export default function SeatAssignPage() {
  const { floors } = useFloorStore();
  const { venue } = useVenueStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFloorId, setSelectedFloorId] = useState<number | undefined>(undefined);
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<number>>(new Set());
  const [currentScale, setCurrentScale] = useState(1);
  const [showZoomDropdown, setShowZoomDropdown] = useState(false);

  useEffect(() => {
    if (floors.length > 0 && selectedFloorId == undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedFloorId(floors[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floors]);

  const transformRefs = useRef(new Map<number, ReactZoomPanPinchContentRef | null>());
  const zoomDropdownRef = useRef<HTMLDivElement>(null);
  const selectedFloorIdRef = useRef(selectedFloorId);

  useEffect(() => {
    selectedFloorIdRef.current = selectedFloorId;
  }, [selectedFloorId]);

  useEffect(() => {
    if (!showZoomDropdown) return;
    const handler = (e: MouseEvent) => {
      if (!zoomDropdownRef.current?.contains(e.target as Node)) {
        setShowZoomDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showZoomDropdown]);

  const handleScaleChange = useCallback(
    (scale: number) => {
      if (selectedFloorIdRef.current === selectedFloorId) {
        setCurrentScale(scale);
      }
    },
    [selectedFloorId],
  );

  // eslint-disable-next-line react-hooks/refs
  const activeTransform = transformRefs.current.get(selectedFloorId ?? -1);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Tabs
        className="flex flex-col flex-1 min-h-0 overflow-hidden"
        value={String(selectedFloorId)}
        onValueChange={(v) => setSelectedFloorId(Number(v))}
      >
        <div className="flex items-center justify-between">
          <TabsList className="bg-transparent flex gap-x-2">
            {floors.map((floor) => (
              <TabsTrigger
                key={floor.id}
                value={String(floor.id)}
                className="cursor-pointer text-content-primary text-base rounded-none border-b-2 border-transparent
                      hover:text-content-danger
                      data-[state=active]:text-content-primary
                      data-[state=active]:bg-transparent
                      data-[state=active]:shadow-none
                      data-[state=active]:border-b-white
                      "
              >
                {floor.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Zoom controls */}
          <div ref={zoomDropdownRef} className="relative">
            <Button
              variant="ghost"
              size="lg"
              className="text-content-primary"
              onClick={() => setShowZoomDropdown((v) => !v)}
            >
              <IconZoomIn stroke={1.5} size={18} />
            </Button>
            {showZoomDropdown && (
              <div className="absolute top-full right-0 mt-1 flex items-center gap-x-0.5 bg-popover rounded-md px-1.5 py-1 shadow-md z-50 border border-surface-accent">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-content-accent"
                  onClick={() => activeTransform?.zoomOut(0.25)}
                >
                  <IconMinus stroke={2} size={14} />
                </Button>
                <span className="text-content-accent text-xs w-10 text-center tabular-nums">
                  {Math.round(currentScale * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-content-accent"
                  onClick={() => activeTransform?.zoomIn(0.25)}
                >
                  <IconPlus stroke={2} size={14} />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-x-4 h-full">
          {/* 좌측 메인 */}
          <div className="h-full overflow-hidden">
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
                transformRef={(ref) => {
                  transformRefs.current.set(floor.id, ref);
                }}
                onScaleChange={handleScaleChange}
              />
            ))}
          </div>
          <SeatAssignSidebar />
        </div>
      </Tabs>

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
