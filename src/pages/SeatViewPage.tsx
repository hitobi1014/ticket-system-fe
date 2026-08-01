import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import useFloorStore from '@/store/floorStore';
import useVenueStore from '@/store/venueStore';
import useMemberStore from '@/store/memberStore';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SeatGrid from '@/components/seat/SeatGrid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconMapPin, IconMinus, IconPlus, IconX, IconZoomIn } from '@tabler/icons-react';
import { getChoseong } from 'es-hangul';
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import type { ReactZoomPanPinchContentRef } from 'react-zoom-pan-pinch';
import { pageContentClass } from '@/constant/styles.ts';

export default function SeatViewPage() {
  const { floors } = useFloorStore();
  const { venue } = useVenueStore();
  const { members, getMemberRemainTicketsByMemberId } = useMemberStore();

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

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    return members.filter((m) => {
      const choseong = getChoseong(m.name);
      return choseong.includes(searchQuery) || m.name.includes(searchQuery.trim());
    });
  }, [searchQuery, members]);

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

  const handleSelectMember = (memberIdStr: string | null) => {
    if (memberIdStr == null) return;
    const memberId = Number(memberIdStr);
    if (!selectedMemberIds.includes(memberId)) {
      setSelectedMemberIds((prev) => [...prev, memberId]);
      setPulsingMemberIds((prev) => new Set(prev).add(memberId));
      setTimeout(() => {
        setPulsingMemberIds((prev) => {
          const next = new Set(prev);
          next.delete(memberId);
          return next;
        });
      }, 3000);
    }
    setSearchQuery('');
  };

  const handleRemoveMember = (memberId: number) => {
    setSelectedMemberIds((prev) => prev.filter((id) => id !== memberId));
  };

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
        {/* 회원 검색 Combobox */}
        <Combobox
          value=""
          onValueChange={handleSelectMember}
          inputValue={searchQuery}
          onInputValueChange={(v) => setSearchQuery(v)}
          filter={() => true}
        >
          <ComboboxInput
            showTrigger={false}
            placeholder="회원 이름으로 좌석 찾기"
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-primary border-primary w-60 border"
          />
          {/* 선택된 회원 목록
            간략하게 color 이름 표기
            ex) o 김안나
            화면 범위를 넘어가면 잘리지 않고 가로 스크롤되도록 처리
            */}
          {selectedMembers.length > 0 && (
            <div className="no-scrollbar flex gap-x-2 overflow-x-auto py-1">
              {selectedMembers.map((member) => (
                <div
                  key={member.id}
                  className="border-border flex shrink-0 items-center justify-center gap-x-1 rounded-md border px-2"
                >
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: member.color ?? '#cccccc' }}
                  />
                  <span className="text-text-primary text-sm whitespace-nowrap">{member.name}</span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-primary shrink-0"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <IconX stroke={2} size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}
          {
            <ComboboxContent>
              <ComboboxList>
                {filteredMembers.length === 0 ? (
                  <p className="py-2 text-center text-sm">검색 결과 없음</p>
                ) : (
                  filteredMembers.map((member) => {
                    const remain = getMemberRemainTicketsByMemberId(member.id);
                    return (
                      <ComboboxItem key={member.id} value={String(member.id)}>
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: member.color ?? '#cccccc' }}
                        />
                        <Badge variant="default" className="w-8 px-1.5 py-0 text-xs">
                          {member.instrument.abbr}
                        </Badge>
                        <span className="flex-1 text-sm">{member.name}</span>
                        <span className="text-muted-foreground ml-auto text-xs">
                          잔여:{remain} / 배정:{member.allocatedTickets}
                        </span>
                      </ComboboxItem>
                    );
                  })
                )}
              </ComboboxList>
            </ComboboxContent>
          }
        </Combobox>

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
