import useFloorStore from '../store/floorStore.ts';
import { useState } from 'react';
import type { Aisle, ButtonItem, CreateAisleRequest, CreateFloorRequest, Section } from '@/types';
import SectionCard from '@/components/seat/SectionCard.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconLayoutColumns, IconMinus, IconPlus, IconTrash } from '@tabler/icons-react';
import FunctionButtons from '@/components/common/FunctionButtons.tsx';
import { Button } from '@/components/ui/button';
import AddSectionDialog from '@/components/dialog/AddSectionDialog.tsx';
import AlertDialogCustom from '@/components/dialog/AlertDialogCustom.tsx';
import { toast } from 'sonner';

export default function FloorSetupPage() {
  const { floors, addFloor, removeSection, addAisle, removeAisle, removeFloor } = useFloorStore();
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(
    floors.length > 0 ? floors[0].id : null,
  );
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedAisleId, setSelectedAisleId] = useState<number | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [addSectionDialogKey, setAddSectionDialogKey] = useState<number>(0);

  const selectedFloor = floors.find((x) => x.id === selectedFloorId) ?? null;
  const selectedSection =
    selectedFloor?.rows
      .flatMap((r) => r.items)
      .filter((item): item is Section => item.kind === 'section')
      .find((x) => x.id === selectedSectionId) ?? null;
  const selectedFloorRow =
    selectedFloor?.rows.find((r) =>
      r.items.some((item) => item.kind === 'section' && item.id === selectedSectionId),
    ) ?? null;

  const handleAddFloor = async () => {
    const name = window.prompt('층 이름을 입력하세요.'); // TODO 나중에 모달로 입력 바꾸기
    if (!name?.trim()) return;
    const req: CreateFloorRequest = {
      name: name.trim(),
    };
    const savedFloor = await addFloor(req);
    setSelectedFloorId(savedFloor.id);
  };

  const handleRemoveFloor = async () => {
    // TODO 추후확인 해당 층에  Section 있으면 경고 메시지
    if (selectedFloorId == null) return;
    await removeFloor(selectedFloorId);

    toast('층 삭제 성공했습니다.');
    // 삭제한 층이 현재 선택된 층이면 -> 첫 번째 층으로 이동
    const remaining = floors.filter((f) => f.id !== selectedFloorId);
    setSelectedFloorId(remaining.length > 0 ? remaining[0].id : null);
  };

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

  // TODO 좌/우측 값 받기
  const handleAddAisle = async (direction: 'left' | 'right') => {
    const floorRowId = selectedFloorRow?.id;

    if (selectedFloor == null) return;
    if (selectedSectionId === null) return;
    if (floorRowId == null) return;

    const req: CreateAisleRequest = {
      label: '통로',
      sectionId: selectedSectionId,
      floorRowId: floorRowId,
      direction: direction,
    };
    await addAisle(selectedFloor.id, req);
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
    // TODO 추후 여유있을때 층 추가 Dialog로 변경하기
    {
      text: '층 추가',
      icon: <IconPlus stroke={2} />,
      onClick: handleAddFloor,
    },
    {
      text: '층 삭제',
      icon: <IconMinus stroke={2} />,
      confirm: {
        triggerText: '층 삭제',
        title: '층 삭제 확인',
        description: `선택한 층 [${selectedFloor?.name}]을 삭제하시겠습니까?`,
        actions: [{ text: '삭제', onClick: handleRemoveFloor }],
      },
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
              hover:text-amber-300
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
            className="flex flex-col flex-1 overflow-hidden p-0"
          >
            {/* ✅ 구역 기능 버튼 그룹 */}
            <div className="flex gap-x-2 shrink-0">
              <div className="flex gap-x-2 justify-end">
                <AddSectionDialog
                  key={addSectionDialogKey}
                  floorId={floor.id}
                  onConfirm={() => {
                    // 구역 추가 완료 시 선택 상태 초기화
                    setSelectedSectionId(null);
                    setSelectedRowId(null);
                    setAddSectionDialogKey((prev) => prev + 1);
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
                <AlertDialogCustom
                  variant="secondary"
                  size="base"
                  title="통로 추가"
                  triggerText="통로 추가"
                  description={`선택한 [${selectedSection?.name}] 기준으로 통로를 추가합니다.`}
                  actions={[
                    { text: '← 좌측', onClick: () => handleAddAisle('left') },
                    { text: '우측 →', onClick: () => handleAddAisle('right') },
                  ]}
                  icon={<IconLayoutColumns stroke={2} />}
                  disabled={selectedSectionId === null}
                />
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

            {/* 구역 컨텐츠 시작: 구역/통로 */}
            <div className="flex flex-col mt-4 gap-y-4 flex-1 overflow-auto no-scrollbar pt-1 px-2">
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
