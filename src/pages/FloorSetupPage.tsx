import { useEffect, useRef, useState } from 'react';
import useFloorStore from '@/store/floorStore.ts';
import useVenueStore from '@/store/venueStore.ts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils.ts';
import { pageContentClass } from '@/constant/styles.ts';
import FloorButtons from '@/components/floor/FloorButtons.tsx';
import SectionButtons from '@/components/floor/SectionButtons.tsx';
import FloorCanvas from '@/components/floor/FloorCanvas.tsx';
import ZoomControl from '@/components/common/ZoomControl.tsx';
import useZoomControls from '@/hooks/use-zoom-controls.ts';
import useSpaceKey from '@/hooks/use-space-key.ts';

export default function FloorSetupPage() {
  const isInitalized = useRef(false);
  const floors = useFloorStore((state) => state.floors);
  const venue = useVenueStore((state) => state.venue);

  const stagePosition = venue?.stagePosition ?? 'front';
  const [selectedFloorId, setSelectedFloorId] = useState<number | undefined>(undefined);
  const [selectedSectionId, setSelectedSectionId] = useState<number | undefined>(undefined);
  const [selectedAisleId, setSelectedAisleId] = useState<number | undefined>(undefined);
  const [selectedRowId, setSelectedRowId] = useState<number | undefined>(undefined);

  const { currentScale, handleScaleChange, setTransformRef, zoomIn, zoomOut } =
    useZoomControls(selectedFloorId);
  // 구역 선택 중에는 Space를 누른 채 드래그해서 화면 이동
  const isSpacePressed = useSpaceKey(selectedSectionId !== undefined);

  useEffect(() => {
    if (!isInitalized.current && floors.length > 0 && selectedFloorId == undefined) {
      setSelectedFloorId(floors[0].id);
      isInitalized.current = true;
    }
  }, [floors, selectedFloorId]);

  const selectedFloor = floors.find((x) => x.id === selectedFloorId) ?? undefined;

  return (
    <div className={cn(pageContentClass, 'flex h-full flex-col overflow-hidden')}>
      {/*상단 버튼 그룹*/}
      <FloorButtons
        selectedFloorId={selectedFloorId}
        setSelectedFloorId={setSelectedFloorId}
        selectedFloor={selectedFloor}
      />
      <Tabs
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        value={String(selectedFloorId)}
        onValueChange={(v) => setSelectedFloorId(Number(v))}
        onClick={() => {
          setSelectedSectionId(undefined);
          setSelectedRowId(undefined);
        }}
      >
        <div className="flex items-center justify-between">
          {/* 1층 탭바 */}
          <TabsList variant="default">
            {floors.map((floor) => (
              <TabsTrigger variant="default" key={floor.id} value={String(floor.id)}>
                {floor.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <ZoomControl scale={currentScale} onZoomIn={zoomIn} onZoomOut={zoomOut} />
        </div>

        {/* 2) 메인 영역 - 선택한 층의 구역/좌석 */}
        {floors.map((floor) => (
          <TabsContent
            key={floor.id}
            value={String(floor.id)}
            className="flex min-h-0 flex-1 flex-col overflow-hidden p-0"
          >
            {/* ✅ 구역 기능 버튼 그룹 */}
            <SectionButtons
              selectedSectionId={selectedSectionId}
              floor={floor}
              setSelectedSectionId={setSelectedSectionId}
              setSelectedRowId={setSelectedRowId}
              selectedFloor={selectedFloor}
              selectedAisleId={selectedAisleId}
            />

            {/* 구역 컨텐츠 시작: 구역/통로 */}
            <FloorCanvas
              floor={floor}
              stagePosition={stagePosition}
              selectedSectionId={selectedSectionId}
              selectedAisleId={selectedAisleId}
              selectedRowId={selectedRowId}
              onSelectedSectionId={setSelectedSectionId}
              onSelectedAisleId={setSelectedAisleId}
              onSelectedRowId={setSelectedRowId}
              transformRef={setTransformRef(floor.id)}
              onScaleChange={handleScaleChange}
              isSpacePressed={isSpacePressed}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
