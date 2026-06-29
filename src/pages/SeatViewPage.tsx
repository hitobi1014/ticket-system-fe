import { useMemo, useState } from 'react';
import useFloorStore from '@/store/floorStore';
import useVenueStore from '@/store/venueStore';
import useMemberStore from '@/store/memberStore';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SeatGrid from '@/components/seat/SeatGrid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconMapPin, IconX } from '@tabler/icons-react';
import { getChoseong } from 'es-hangul';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';

export default function SeatViewPage() {
  const { floors } = useFloorStore();
  const { venue } = useVenueStore();
  const { members, getMemberRemainTicketsByMemberId } = useMemberStore();

  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(
    floors.length > 0 ? floors[0].id : null,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return [];
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

  const handleSelectMember = (memberIdStr: string | null) => {
    if (memberIdStr == null) return;
    const memberId = Number(memberIdStr);
    if (!selectedMemberIds.includes(memberId)) {
      setSelectedMemberIds((prev) => [...prev, memberId]);
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
          <ComboboxInput
            showTrigger={false}
            placeholder="회원 이름으로 좌석 찾기"
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-content-primary"
          />
          {searchQuery.trim() && (
            <ComboboxContent>
              <ComboboxList>
                <ComboboxEmpty>검색 결과 없음</ComboboxEmpty>
                {filteredMembers.map((member) => {
                  const remain = getMemberRemainTicketsByMemberId(member.id);
                  return (
                    <ComboboxItem key={member.id} value={String(member.id)}>
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: member.color ?? '#cccccc' }}
                      />
                      <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                        {member.instrument.abbr}
                      </Badge>
                      <span className="flex-1 text-sm">{member.name}</span>
                      <span className="text-muted-foreground text-xs ml-auto">
                        {remain}/{member.allocatedTickets}
                      </span>
                    </ComboboxItem>
                  );
                })}
              </ComboboxList>
            </ComboboxContent>
          )}
        </Combobox>

        {/* 층 탭 + 좌석 그리드 + 우측 패널 */}
        <div className="flex gap-x-4 flex-1 overflow-hidden">
          {/* 좌석 그리드 */}
          <Tabs
            className="flex flex-col flex-1 overflow-hidden"
            value={String(selectedFloorId)}
            onValueChange={(v) => setSelectedFloorId(Number(v))}
          >
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
                  data-[state=active]:border-b-white"
                >
                  {floor.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {floors.map((floor) => (
              <SeatGrid
                key={floor.id}
                floor={floor}
                stagePosition={venue?.stagePosition ?? 'front'}
                highlightColorMap={highlightColorMap}
              />
            ))}
          </Tabs>

          {/* 선택된 회원 목록 */}
          <div className="w-52 shrink-0 flex flex-col gap-y-2 overflow-y-auto no-scrollbar pt-1">
            {selectedMembers.length === 0 ? (
              <p className="text-content-secondary text-sm">선택된 회원 없음</p>
            ) : (
              selectedMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-x-2 bg-surface-secondary rounded-md px-3 py-2"
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
