import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import useSeatGuideStore from '@/store/seatGuideStore';
import useVenueStore from '@/store/venueStore';
import useMemberStore from '@/store/memberStore';
import useAuthStore from '@/store/authStore';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SeatGrid from '@/components/seat/SeatGrid';
import { Button } from '@/components/ui/button';
import { IconArmchair, IconHelp, IconMapPin } from '@tabler/icons-react';
import ZoomControl from '@/components/common/ZoomControl.tsx';
import useZoomControls from '@/hooks/use-zoom-controls.ts';
import { pageContentClass } from '@/constant/styles.ts';
import MemberSearchComboBox from '@/components/input/MemberSearchComboBox.tsx';
import TicketDownloadDialog from '@/components/dialog/TicketDownloadDialog.tsx';
import GuestNameInputModal from '@/components/dialog/GuestNameInputModal.tsx';
import { findSeatsByMemberId, toAssignedSeatInfo } from '@/lib/seatUtils.ts';
import type { MemberWithSeats } from '@/types';
import { formatPerformanceAt } from '@/lib/formatUtils.ts';
import useSeatViewTour from '@/hooks/use-seat-view-tour.ts';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export default function SeatViewPage() {
  const { floors, displayMode, setDisplayMode, fetchFloors, clearStore } = useSeatGuideStore();
  const { venue } = useVenueStore();
  const { members } = useMemberStore();
  const { currentMember, isAdmin } = useAuthStore();

  const [selectedFloorId, setSelectedFloorId] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [pulsingMemberIds, setPulsingMemberIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (floors.length > 0 && selectedFloorId == undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedFloorId(floors[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floors]);

  useEffect(() => {
    clearStore();
    fetchFloors();
  }, [currentMember?.id, clearStore, fetchFloors]);

  // 좌석 데이터와 회원 정보가 모두 로드된 뒤 온보딩 투어 실행 (첫 방문 1회)
  const { startTour } = useSeatViewTour(
    floors.length > 0 && members.length > 0 && selectedFloorId !== undefined,
  );

  // 회원 선택(검색): 좌석 하이라이트 대상에 추가하고 잠시 강조 (콤보박스 선택과 내 좌석 보기 공용)
  const handleSelectMember = (memberId: number) => {
    setSelectedMemberIds((prev) => (prev.includes(memberId) ? prev : [...prev, memberId]));
    setPulsingMemberIds((prev) => new Set(prev).add(memberId));
    setTimeout(() => {
      setPulsingMemberIds((prev) => {
        const next = new Set(prev);
        next.delete(memberId);
        return next;
      });
    }, 3000);
  };

  const { currentScale, handleScaleChange, setTransformRef, zoomIn, zoomOut } =
    useZoomControls(selectedFloorId);

  const selectedMembers = useMemo(
    () => members.filter((m) => selectedMemberIds.includes(m.id)),
    [selectedMemberIds, members],
  );

  const myMemberWithSeats: MemberWithSeats | null = useMemo(() => {
    const member = members.find((m) => m.id === currentMember?.id);
    if (!member) return null;

    return {
      member,
      seats: findSeatsByMemberId(floors, member.id).map(toAssignedSeatInfo),
    };
  }, [members, floors, currentMember]);

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
      <header className="flex items-center justify-between gap-x-2 px-4 py-3">
        <div className="flex items-center gap-x-2">
          <IconMapPin stroke={1.5} className="text-primary" />
          <div>
            <p className="text-primary text-lg leading-tight font-semibold">
              {venue?.name ?? '공연장'}
            </p>
            {venue?.performanceAt && (
              <p className="text-secondary text-sm">{formatPerformanceAt(venue.performanceAt)}</p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary"
          aria-label="사용 방법 보기"
          onClick={startTour}
        >
          <IconHelp stroke={1.5} className="size-5" />
        </Button>
      </header>

      <main className="flex flex-1 flex-col gap-y-4 overflow-hidden p-4">
        {/* 상단 콤보박스, 기능 버튼 */}
        <div className="flex items-start justify-between gap-x-4">
          <MemberSearchComboBox
            selectedMemberIds={selectedMemberIds}
            setSelectedMemberIds={setSelectedMemberIds}
            onSelectMember={handleSelectMember}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedMembers={selectedMembers}
          />
          <div className="flex shrink-0 items-center gap-x-2">
            <div data-tour="guest-name">
              <GuestNameInputModal />
            </div>
            {currentMember && (
              <Button
                variant="dialog"
                size="base"
                onClick={() => handleSelectMember(currentMember.id)}
              >
                <IconArmchair stroke={1.5} />내 좌석 보기
              </Button>
            )}
            {myMemberWithSeats && (
              <div data-tour="my-ticket">
                <TicketDownloadDialog memberWithSeats={myMemberWithSeats} />
              </div>
            )}
          </div>
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
                  <TabsTrigger key={floor.id} variant="default" value={String(floor.id)}>
                    {floor.name}
                    {highlightedFloorIds.has(floor.id) && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="flex items-center gap-x-2">
                {isAdmin() && (
                  <ToggleGroup
                    type="single"
                    value={displayMode}
                    onValueChange={(value) => {
                      if (value) setDisplayMode(value as 'member' | 'guest');
                    }}
                    spacing={0}
                  >
                    <ToggleGroupItem
                      value="member"
                      variant="outline"
                      size="sm"
                      className="data-[state=on]:bg-primary cursor-pointer data-[state=on]:text-white"
                    >
                      연주자
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="guest"
                      variant="outline"
                      size="sm"
                      className="data-[state=on]:bg-primary cursor-pointer data-[state=on]:text-white"
                    >
                      게스트
                    </ToggleGroupItem>
                  </ToggleGroup>
                )}

                {/* Zoom controls */}
                <ZoomControl
                  data-tour="zoom"
                  scale={currentScale}
                  onZoomIn={zoomIn}
                  onZoomOut={zoomOut}
                />
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
                transformRef={setTransformRef(floor.id)}
                onScaleChange={handleScaleChange}
                displayMode={displayMode}
                currentMemberId={currentMember?.id}
              />
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
