import useFloorStore from '../store/floorStore.ts';
import { useState } from 'react';
import type { Aisle, ButtonItem, CreateFloorRequest, Section } from '@/types';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import SectionCard from '@/components/seat/SectionCard.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconMinus, IconPlus, IconTicket, IconUserPlus } from '@tabler/icons-react';
import FunctionButtons from '@/components/common/FunctionButtons.tsx';

export default function FloorSetupPage() {
  const {
    floors,
    getTotalSeatCount,
    addFloor,
    removeFloor,
    addSection,
    removeSection,
    addAisle,
    removeAisle,
  } = useFloorStore();
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(
    floors.length > 0 ? floors[0].id : null,
  );
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedAisleId, setSelectedAisleId] = useState<number | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

  const selectedFloor = floors.find((x) => x.id === selectedFloorId) ?? null;
  const selectedSection = selectedFloor?.items.find(
    (item): item is Section => item.kind === 'section' && item.id === selectedSectionId,
  );

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

  const handleRemoveFloor = (id: number) => {
    const isRemove = window.confirm(`정말로 삭제하시겠습니까? ${id}`); // id말고 name 확인하며 물어보기

    // TODO 추후확인 해당 층에  Section 있으면 경고 메시지
    if (!isRemove) return;
    removeFloor(id);

    // 삭제한 층이 현재 선택된 층이면 -> 첫 번째 층으로 이동
    if (selectedFloorId === id) {
      const remaining = floors.filter((f) => f.id !== id);
      setSelectedFloorId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleAddSection = () => {
    if (!selectedFloor) return;
    const sectionName = window.prompt('구역명을 입력하세요.');
    if (!sectionName?.trim()) {
      alert('구역명은 빈 값으로 입력할 수 없습니다.');
      return;
    }
    const maxSectionId = floors
      .flatMap((f) => f.items)
      .filter((item): item is Section => item.kind === 'section')
      .reduce((max, section) => Math.max(max, section.id), 0);

    addSection(selectedFloor.id, {
      id: maxSectionId + 1,
      name: sectionName,
    });
  };

  const handleRemoveSection = () => {
    if (selectedSectionId === null) return;

    const findItem = selectedFloor?.items.find(
      (item): item is Section => item.kind === 'section' && item.id === selectedSectionId,
    );
    if (!findItem) return;

    const isRemove = window.confirm(`${findItem.name} 구역을 정말 삭제하시겠습니까?`);
    if (!isRemove) return;

    removeSection(findItem.id);
  };

  const handleAddAisle = () => {
    if (!selectedFloor) return;
    const aisleLabel = window.prompt('통로명 입력(선택)');

    const maxAisleId = floors
      .flatMap((f) => f.items)
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

    const findItem = selectedFloor?.items.find(
      (item): item is Aisle => item.kind === 'aisle' && item.id === selectedAisleId,
    );
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
      // TODO: 층 삭제 추가하기
    },
  ];

  return (
    <div>
      {/*상단 버튼 그룹*/}
      <FunctionButtons buttons={floorButtons} />;
      <Tabs
        className="secondary-bg"
        value={String(selectedFloorId)}
        onValueChange={(v) => setSelectedFloorId(Number(v))}
      >
        {/* 1층 탭바 */}
        <TabsList className="secondary-bg">
          {floors.map((floor) => (
            <TabsTrigger key={floor.id} value={String(floor.id)}>
              {floor.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {/*  나머지 렌더링*/}
        {/* 2) 메인 영역 - 선택한 층의 구역/좌석 */}
        {/*여기가 TabContent 표현부분 */}
        {floors.map((floor) => (
          <TabsContent key={floor.id} value={String(floor.id)}>
            <div className="flex items-center">
              <ButtonGroup>
                <Button onClick={() => handleAddSection()}>구역추가</Button>
                <Button
                  disabled={selectedSectionId === null}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSection();
                  }}
                >
                  구역 삭제
                </Button>
                <Button onClick={() => handleAddAisle()}>통로추가</Button>
                <Button
                  disabled={selectedAisleId === null}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveAisle();
                  }}
                >
                  통로삭제
                </Button>
              </ButtonGroup>
              <span className="ml-2 bg-gray-400 text-white">
                선택된 구역: {selectedSection?.name}/{selectedRowId}
              </span>
            </div>
            {/* 구역인지 통로인지 구분*/}
            <div className="flex mt-4">
              {floor.items.map((item) => (
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
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
