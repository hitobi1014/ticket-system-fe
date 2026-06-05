import useFloorStore from '@/store/floorStore.ts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { useState } from 'react';
import AssignRow from '@/components/seat/AssignRow.tsx';

export default function SeatAssignPage() {
  const { floors } = useFloorStore();

  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(
    floors.length > 0 ? floors[0].id : null,
  );

  return (
    <div>
      <div>
        <Tabs value={String(selectedFloorId)} onValueChange={(v) => setSelectedFloorId(Number(v))}>
          <div className="bg-gray-700 flex py-2 items-center">
            <span className="text-white mx-4">좌석배정</span>
            <TabsList>
              {floors.map((floor) => (
                <TabsTrigger key={floor.id} value={String(floor.id)}>
                  {floor.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {floors.map((floor) => (
            <TabsContent key={floor.id} value={String(floor.id)} className="flex">
              {floor.items.map((item) => (
                <div key={item.id} className="flex">
                  {item.kind === 'aisle' ? (
                    <div key={item.id} className="border-2 border-dashed bg-gray-100">
                      통로: {item.label}
                    </div>
                  ) : (
                    <AssignRow section={item} />
                  )}
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <div>
        <div>좌측메인영역</div>
        <div>우측사이드영역</div>
      </div>
    </div>
  );
}
