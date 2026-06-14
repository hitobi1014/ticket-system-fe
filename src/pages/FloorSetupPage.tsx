import useFloorStore from '../store/floorStore.ts';
import { useState } from 'react';
import type { Aisle, ButtonItem, CreateFloorRequest, Section } from '@/types';
import SectionCard from '@/components/seat/SectionCard.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconLayoutColumns, IconMinus, IconPlus, IconTrash } from '@tabler/icons-react';
import FunctionButtons from '@/components/common/FunctionButtons.tsx';
import { Button } from '@/components/ui/button';
import AddSectionDialog from '@/components/dialog/AddSectionDialog.tsx';

export default function FloorSetupPage() {
  const { floors, addFloor, removeSection, addAisle, removeAisle } = useFloorStore();
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(
    floors.length > 0 ? floors[0].id : null,
  );
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedAisleId, setSelectedAisleId] = useState<number | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

  const selectedFloor = floors.find((x) => x.id === selectedFloorId) ?? null;

  const handleAddFloor = () => {
    const name = window.prompt('층 이름을 입력하세요.'); // TODO 나중에 모달로 입력 바꾸기
    if (!name?.trim()) return;
    const newId = floors.reduce((max, f) => Math.max(max, f.id), 0) + 1;
    const req: CreateFloorRequest = {
      id: newId,
      name: name.trim(),
    };
    addFloor(req);
    setSelectedFloorId(req.id);
  };

  const handleRemoveFloor = () => {
    const isRemove = window.confirm(`정말로 삭제하시겠습니까? ${selectedFloorId}`); // id말고 name 확인하며 물어보기

    // TODO 추후확인 해당 층에  Section 있으면 경고 메시지
    if (!isRemove) return;
    // removeFloor(selectedFloorId);
    //
    // // 삭제한 층이 현재 선택된 층이면 -> 첫 번째 층으로 이동
    // if (selectedFloorId === selectedFloorId) {
    //   const remaining = floors.filter((f) => f.selectedFloorId !== selectedFloorId);
    //   setSelectedFloorId(remaining.length > 0 ? remaining[0].id : null);
    // }
  };

  // handleAddSection은 AddSectionDialog로 대체됨 (삭제 예정)

  const handleRemoveSection = () => {
    if (selectedSectionId === null) return;

    const findItem = selectedFloor?.rows
      .flatMap((r) => r.items)
      .find((item): item is Section => item.kind === 'section' && item.id === selectedSectionId);
    if (!findItem) return;

    const isRemove = window.confirm(`${findItem.name} 구역을 정말 삭제하시겠습니까?`);
    if (!isRemove) return;

    removeSection(findItem.id);
  };

  const handleAddAisle = () => {
    if (!selectedFloor) return;
    const aisleLabel = window.prompt('통로명 입력(선택)');

    const maxAisleId = floors
      .flatMap((f) => f.rows.flatMap((r) => r.items))
      .filter((item): item is Aisle => item.kind === 'aisle')
      .reduce((max, aisle) => Math.max(max, aisle.id), 0);

    addAisle(selectedFloor.id, {
      id: maxAisleId + 1,
      kind: 'aisle',
      label: aisleLabel ?? '',
    });
  };

  const handleRemoveAisle = () => {
    if (selectedAisleId === null) return;

    const findItem = selectedFloor?.rows
      .flatMap((r) => r.items)
      .find((item): item is Aisle => item.kind === 'aisle' && item.id === selectedAisleId);
    if (!findItem) return;

    const isRemove = window.confirm(`${findItem.label} 통로 정말 삭제하시겠습니까?`);
    if (!isRemove) return;

    removeAisle(findItem.id);
  };

  const floorButtons: ButtonItem[] = [
    {
      text: '층 추가',
      icon: <IconPlus stroke={2} />,
      onClick: handleAddFloor,
    },
    {
      text: '층 삭제',
      icon: <IconMinus stroke={2} />,
      onClick: handleRemoveFloor,
    },
  ];

  return (
    <div className="bg-surface-primary h-full flex flex-col overflow-hidden">
      {/*상단 버튼 그룹*/}
      <FunctionButtons buttons={floorButtons} />;
      <Tabs
        className="flex flex-col flex-1 overflow-hidden"
        value={String(selectedFloorId)}
        onValueChange={(v) => setSelectedFloorId(Number(v))}
        onClick={() => {
          setSelectedSectionId(null);
          setSelectedRowId(null);
        }}
      >
        {/* 1층 탭바 */}
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

        {/* 2) 메인 영역 - 선택한 층의 구역/좌석 */}
        {floors.map((floor) => (
          <TabsContent
            key={floor.id}
            value={String(floor.id)}
            className="p-0 gap-x-1 overflow-x-auto"
          >
            {/* 구역 기능 버튼 그룹 */}
            <div className="flex gap-x-2">
              <div className="flex gap-x-2 justify-end">
                <AddSectionDialog
                  key={floor.id}
                  floorId={floor.id}
                  onConfirm={() => {
                    // 구역 추가 완료 시 선택 상태 초기화
                    setSelectedSectionId(null);
                    setSelectedRowId(null);
                  }}
                />

                <Button
                  size="base"
                  variant="secondary"
                  onClick={handleRemoveSection}
                  disabled={selectedSectionId === null}
                >
                  <IconMinus stroke={2} />
                  구역 삭제
                </Button>
              </div>
              <div className="w-0.5 self-stretch bg-mist-400 mx-1 my-1.5 " />
              <div className="flex gap-x-2 justify-end">
                <Button variant="secondary" size="base" onClick={handleAddAisle}>
                  <IconLayoutColumns stroke={2} /> 통로 추가
                </Button>
                <Button
                  variant="secondary"
                  size="base"
                  onClick={handleRemoveAisle}
                  disabled={selectedAisleId === null}
                >
                  <IconTrash stroke={2} /> 통로 삭제
                </Button>
              </div>
            </div>

            {/* 구역인지 통로인지 구분*/}
            <div className="flex flex-col mt-4 gap-y-4 flex-1 px-2">
              {floor.rows.map((floorRow) => (
                <div key={floorRow.id} className="flex gap-x-4">
                  {floorRow.items.map((item) => (
                    <SectionCard
                      key={item.id}
                      item={item}
                      selectedSectionId={selectedSectionId}
                      selectedAisleId={selectedAisleId}
                      selectedRowId={selectedRowId}
                      onSelectedSectionId={setSelectedSectionId}
                      onSelectedAisleId={setSelectedAisleId}
                      onSelectedRowId={setSelectedRowId}
                    />
                  ))}
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
