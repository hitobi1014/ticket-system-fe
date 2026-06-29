import useFloorStore from '@/store/floorStore.ts';
import useVenueStore from '@/store/venueStore.ts';
import useMemberStore from '@/store/memberStore.ts';
import { useMemo, useState } from 'react';
import { IconMapPin, IconSearch } from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import SeatGrid from '@/components/seat/SeatGrid.tsx';
import { Tabs } from '@/components/ui/tabs';

export default function SeatViewPage() {
  const { floors } = useFloorStore();
  const { venue } = useVenueStore();
  const { members } = useMemberStore();

  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(
    floors.length > 0 ? floors[0].id : null,
  );
  const [searchQuery, setSearchQuery] = useState('');

  const highlightMemberIds = useMemo(() => {
    if (!searchQuery.trim()) return undefined;
    const matched = members.filter((m) => m.name.includes(searchQuery.trim())).map((m) => m.id);
    return matched.length > 0 ? new Set(matched) : undefined;
  }, [searchQuery, members]);

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
        {/* 회원 검색바 */}
        <div className="relative">
          <IconSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-content-primary"
            stroke={1.5}
            size={18}
          />
          <Input
            className="pl-9 text-content-primary"
            aria-label="Search"
            placeholder="회원 이름으로 좌석 찾기"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* 층 탭 + 좌석 그리드 */}
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
              highlightMemberIds={highlightMemberIds}
            />
          ))}
        </Tabs>
      </div>
    </div>
  );
}
