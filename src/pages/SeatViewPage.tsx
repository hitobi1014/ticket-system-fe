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

export default function SeatViewPage() {
  const { floors } = useFloorStore();
  const { venue } = useVenueStore();
  const { members, getMemberRemainTicketsByMemberId } = useMemberStore();

  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(
    floors.length > 0 ? floors[0].id : null,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [pulsingMemberIds, setPulsingMemberIds] = useState<Set<number>>(new Set());
  const [currentScale, setCurrentScale] = useState(1);
  const [showZoomDropdown, setShowZoomDropdown] = useState(false);

  const transformRefs = useRef(new Map<number, ReactZoomPanPinchContentRef | null>());
  const zoomDropdownRef = useRef<HTMLDivElement>(null);
  const selectedFloorIdRef = useRef(selectedFloorId);

  useEffect(() => {
    selectedFloorIdRef.current = selectedFloorId;
    setCurrentScale(1);
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
      }, 1500);
    }
    setSearchQuery('');
  };

  const handleRemoveMember = (memberId: number) => {
    setSelectedMemberIds((prev) => prev.filter((id) => id !== memberId));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 공연장명 + 공연일 */}
      <div className="bg-surface-secondary border-b border-surface-accent py-3 px-4">
        <div className="flex items-center gap-x-2">
          <IconMapPin stroke={1.5} className="text-content-primary" />
          <div>
            <h2 className="text-content-primary text-lg font-medium leading-tight">
              {venue?.name ?? '공연장'}
            </h2>
            {venue?.performanceDate && (
              <p className="text-content-secondary text-sm">{venue.performanceDate}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden p-4 gap-y-4">
        {/* 회원 검색 Combobox */}
        <Combobox
          value=""
          onValueChange={handleSelectMember}
          inputValue={searchQuery}
          onInputValueChange={(v) => setSearchQuery(v)}
          filter={() => true}
        >
          <div className="flex items-center gap-x-2">
            <ComboboxInput
              showTrigger={false}
              placeholder="회원 이름으로 좌석 찾기"
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-60 text-content-primary"
            />
            {/* 선택된 회원 목록
            간략하게 color 이름 표기
            ex) o 김안나
            */}
            <div className="flex gap-x-2">
              {selectedMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex justify-center items-center gap-x-1 rounded-md bg-surface-accent px-2"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: member.color ?? '#cccccc' }}
                  />
                  <span className="text-content-primary text-sm flex-1 truncate">
                    {member.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="shrink-0 text-content-primary"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <IconX stroke={2} size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          {
            <ComboboxContent>
              <ComboboxList>
                {filteredMembers.length === 0 ? (
                  <p className="py-2 text-center text-sm text-muted-foreground">검색 결과 없음</p>
                ) : (
                  filteredMembers.map((member) => {
                    const remain = getMemberRemainTicketsByMemberId(member.id);
                    return (
                      <ComboboxItem key={member.id} value={String(member.id)}>
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: member.color ?? '#cccccc' }}
                        />
                        <Badge variant="secondary" className="px-1.5 py-0 w-4 text-xs">
                          {member.instrument.abbr}
                        </Badge>
                        <span className="flex-1 text-sm">{member.name}</span>
                        <span className="text-muted-foreground text-xs ml-auto">
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
        <div className="flex gap-x-4 flex-1 overflow-hidden">
          {/* 좌석 그리드 */}
          <Tabs
            className="flex flex-col flex-1 overflow-hidden"
            value={String(selectedFloorId)}
            onValueChange={(v) => setSelectedFloorId(Number(v))}
          >
            <div className="flex items-center justify-between">
              <TabsList className="bg-transparent flex gap-x-2">
                {floors.map((floor) => (
                  <TabsTrigger
                    key={floor.id}
                    value={String(floor.id)}
                    className={cn(
                      `cursor-pointer text-content-primary text-base rounded-none border-b-2 border-transparent
                      hover:text-content-danger
                      data-[state=active]:text-content-primary
                      data-[state=active]:bg-transparent
                      data-[state=active]:shadow-none
                      data-[state=active]:border-b-white`,
                      highlightedFloorIds.has(floor.id) && 'gap-x-1.5',
                    )}
                  >
                    {floor.name}
                    {highlightedFloorIds.has(floor.id) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-content-primary shrink-0" />
                    )}
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
      </div>
    </div>
  );
}
