import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import useFloorStore from '@/store/floorStore';
import useVenueStore from '@/store/venueStore';
import useMemberStore from '@/store/memberStore';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SeatGrid from '@/components/seat/SeatGrid';
import { Button } from '@/components/ui/button';
import { IconMapPin, IconMinus, IconPlus, IconZoomIn } from '@tabler/icons-react';
import type { ReactZoomPanPinchContentRef } from 'react-zoom-pan-pinch';
import { pageContentClass } from '@/constant/styles.ts';
import MemberSearchComboBox from '@/components/input/MemberSearchComboBox.tsx';
import TicketDownloadDialog from '@/components/dialog/TicketDownloadDialog.tsx';
import { getMockMemberWithSeats } from '@/mocks/tickets.ts';

export default function SeatViewPage() {
  const { floors } = useFloorStore();
  const { venue } = useVenueStore();
  const { members } = useMemberStore();

  const [selectedFloorId, setSelectedFloorId] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [pulsingMemberIds, setPulsingMemberIds] = useState<Set<number>>(new Set());
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

  const selectedMembers = useMemo(
    () => members.filter((m) => selectedMemberIds.includes(m.id)),
    [selectedMemberIds, members],
  );

  const highlightColorMap = useMemo(
    () => new Map(selectedMembers.map((m) => [m.id, m.color ?? '#4f46e5'])),
    [selectedMembers],
  );

  const highlightedFloorIds = useMemo(() => {
    if (!highlightColorMap.size) return new Set<number>();
    return new Set(
      floors
        .filter((floor) =>
          floor.rows.some((floorRow) =>
            floorRow.items.some(
              (item) =>
                item.kind === 'section' &&
                item.rows.some((row) =>
                  row.seats.some(
                    (seat) =>
                      seat.assignedMemberId != null && highlightColorMap.has(seat.assignedMemberId),
                  ),
                ),
            ),
          ),
        )
        .map((f) => f.id),
    );
  }, [floors, highlightColorMap]);

  return (
    <div className={cn(pageContentClass, 'flex h-full flex-col overflow-hidden')}>
      {/* 공연장명 + 공연일 */}
      <header className="px-4 py-3">
        <div className="flex items-center gap-x-2">
          <IconMapPin stroke={1.5} className="text-primary" />
          <div>
            <p className="text-primary text-lg leading-tight font-semibold">
              {venue?.name ?? '공연장'}
            </p>
            {venue?.performanceDate && (
              <p className="text-secondary text-sm">{venue.performanceDate}</p>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-y-4 overflow-hidden p-4">
        {/* 상단 콤보박스, 기능 버튼 */}
        <div className="flex items-center justify-between gap-x-4">
          <MemberSearchComboBox
            selectedMemberIds={selectedMemberIds}
            setSelectedMemberIds={setSelectedMemberIds}
            setPulsingMemberIds={setPulsingMemberIds}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedMembers={selectedMembers}
          />
          <TicketDownloadDialog memberWithSeats={getMockMemberWithSeats(1)} />
        </div>
        {/* 층 탭 + 좌석 그리드 + 우측 패널 */}
        <div className="flex flex-1 gap-x-4 overflow-hidden">
          {/* 좌석 그리드 */}
          <Tabs
            className="flex flex-1 flex-col overflow-hidden"
            value={String(selectedFloorId)}
            onValueChange={(v) => setSelectedFloorId(Number(v))}
          >
            <div className="flex items-center justify-between">
              <TabsList variant="default">
                {floors.map((floor) => (
                  <TabsTrigger
                    key={floor.id}
                    variant="default"
                    value={String(floor.id)}
                    /*TODO 사용안하면 삭제*/
                    // className={cn(highlightedFloorIds.has(floor.id) && 'gap-x-1.5')}
                  >
                    {floor.name}
                    {highlightedFloorIds.has(floor.id) && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Zoom controls */}
              <div ref={zoomDropdownRef} className="relative">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-primary"
                  onClick={() => setShowZoomDropdown((v) => !v)}
                >
                  <IconZoomIn stroke={1.5} size={18} />
                </Button>
                {showZoomDropdown && (
                  <div className="bg-popover border-accent absolute top-full right-0 z-50 mt-1 flex items-center gap-x-0.5 rounded-md border px-1.5 py-1 shadow-md">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-primary"
                      onClick={() => activeTransform?.zoomOut(0.25)}
                    >
                      <IconMinus stroke={2} size={14} />
                    </Button>
                    <span className="text-primary w-10 text-center text-xs tabular-nums">
                      {Math.round(currentScale * 100)}%
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-primary"
                      onClick={() => activeTransform?.zoomIn(0.25)}
                    >
                      <IconPlus stroke={2} size={14} />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {floors.map((floor) => (
              <SeatGrid
                key={floor.id}
                floor={floor}
                stagePosition={venue?.stagePosition ?? 'front'}
                highlightColorMap={highlightColorMap}
                pulsingMemberIds={pulsingMemberIds}
                enableZoom
                isActive={floor.id === selectedFloorId}
                transformRef={(ref) => {
                  transformRefs.current.set(floor.id, ref);
                }}
                onScaleChange={handleScaleChange}
              />
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
