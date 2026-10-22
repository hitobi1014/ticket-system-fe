import type { ReactNode } from 'react';
import type { Floor } from '@/types';
import { TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { getFloorVisibleSeatCount, getTotalVisibleSeatCount } from '@/lib/floorUtils.ts';

export interface FloorTabsListProps {
  floors: Floor[];
  /** 층 탭 우측에 붙는 표시(예: 하이라이트 점) */
  renderTabExtra?: (floor: Floor) => ReactNode;
}

/** 층 탭 목록: 탭에 층별 좌석 수, 탭 위에 전체 좌석 수 (숨긴 좌석 제외, 실제 층 데이터 합산) */
export default function FloorTabsList({ floors, renderTabExtra }: FloorTabsListProps) {
  return (
    <div className="flex flex-col gap-y-1">
      <p className="text-secondary px-1 text-sm">
        전체 {getTotalVisibleSeatCount(floors).toLocaleString()}석
      </p>
      <TabsList variant="default">
        {floors.map((floor) => (
          <TabsTrigger variant="default" key={floor.id} value={String(floor.id)}>
            {floor.name}({getFloorVisibleSeatCount(floor).toLocaleString()}석)
            {renderTabExtra?.(floor)}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
}
