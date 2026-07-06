import useFloorStore from '../store/floorStore.ts';
import useVenueStore from '@/store/venueStore.ts';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Aisle, ButtonItem, CreateAisleRequest, CreateFloorRequest, Section } from '@/types';
import SectionCard from '@/components/seat/SectionCard.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconLayoutColumns, IconMinus, IconPlus, IconTrash, IconZoomIn } from '@tabler/icons-react';
import FunctionButtons from '@/components/common/FunctionButtons.tsx';
import { Button } from '@/components/ui/button';
import AddSectionDialog from '@/components/dialog/AddSectionDialog.tsx';
import AlertDialogCustom from '@/components/dialog/AlertDialogCustom.tsx';
import { AlertDialogDescription } from '@/components/ui/alert-dialog.tsx';
import { toast } from 'sonner';
import { cn } from '@/lib/utils.ts';
import StageBar from '@/components/seat-assign/StageBar.tsx';
import {
  TransformWrapper,
  TransformComponent,
  useTransformEffect,
  type ReactZoomPanPinchContentRef,
} from 'react-zoom-pan-pinch';

function ScaleTracker({ onScaleChange }: { onScaleChange?: (scale: number) => void }) {
  useTransformEffect((state) => {
    onScaleChange?.(state.state.scale);
  });
  return null;
}

export default function FloorSetupPage() {
  const { floors, addFloor, removeSection, addAisle, removeAisle, removeFloor } = useFloorStore();
  const { venue } = useVenueStore();
  const stagePosition = venue?.stagePosition ?? 'front';
  const [selectedFloorId, setSelectedFloorId] = useState<number | undefined>(undefined);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedAisleId, setSelectedAisleId] = useState<number | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [addSectionDialogKey, setAddSectionDialogKey] = useState<number>(0);
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

  const isMac = navigator.platform.toUpperCase().includes('MAC');

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
    try {
      const savedFloor = await addFloor(req);
      setSelectedFloorId(savedFloor.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '층 추가에 실패했습니다.');
    }
  };

  const handleRemoveFloor = async () => {
    // TODO 추후확인 해당 층에  Section 있으면 경고 메시지
    if (selectedFloorId == null) return;

    try {
      await removeFloor(selectedFloorId);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '층 삭제에 실패했습니다.');
    }

    toast('층 삭제 성공했습니다.');
    // 삭제한 층이 현재 선택된 층이면 -> 첫 번째 층으로 이동
    const remaining = floors.filter((f) => f.id !== selectedFloorId);
    setSelectedFloorId(remaining.length > 0 ? remaining[0].id : undefined);
  };

  const handleRemoveSection = async () => {
    if (selectedSectionId === null) return;

    const findItem = selectedFloor?.rows
      .flatMap((r) => r.items)
      .find((item): item is Section => item.kind === 'section' && item.id === selectedSectionId);
    if (!findItem) return;

    const isRemove = window.confirm(`${findItem.name} 구역을 정말 삭제하시겠습니까?`);
    if (!isRemove) return;

    try {
      await removeSection(findItem.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '구역 삭제에 실패했습니다.');
    }
  };

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

    try {
      await addAisle(selectedFloor.id, req);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '통로 추가에 실패했습니다.');
    }
  };

  const handleRemoveAisle = async () => {
    if (selectedAisleId === null) return;

    const findItem = selectedFloor?.rows
      .flatMap((r) => r.items)
      .find((item): item is Aisle => item.kind === 'aisle' && item.id === selectedAisleId);
    if (!findItem) return;

    const isRemove = window.confirm(`${findItem.label} 통로 정말 삭제하시겠습니까?`);
    if (!isRemove) return;

    await removeAisle(findItem.id);
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
        description: (
          <AlertDialogDescription className="text-content-secondary whitespace-pre-line">
            선택한 층 [{selectedFloor?.name}]을 삭제하시겠습니까?
          </AlertDialogDescription>
        ),
        actions: [{ text: '삭제', onClick: handleRemoveFloor }],
      },
    },
  ];

  return (
    <div className="bg-surface-primary flex h-full flex-col overflow-hidden">
      {/*상단 버튼 그룹*/}
      <FunctionButtons buttons={floorButtons} />
      <Tabs
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        value={String(selectedFloorId)}
        onValueChange={(v) => setSelectedFloorId(Number(v))}
        onClick={() => {
          setSelectedSectionId(null);
          setSelectedRowId(null);
        }}
      >
        <div className="flex items-center justify-between">
          {/* 1층 탭바 */}
          <TabsList className="flex gap-x-2 bg-transparent">
            {floors.map((floor) => (
              <TabsTrigger
                key={floor.id}
                value={String(floor.id)}
                className="text-content-primary data-[state=active]:text-content-primary cursor-pointer rounded-none border-b-2 border-transparent text-base hover:text-amber-300 data-[state=active]:border-b-white data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                {floor.name}
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
              <div className="bg-popover border-surface-accent absolute top-full right-0 z-50 mt-1 flex items-center gap-x-0.5 rounded-md border px-1.5 py-1 shadow-md">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-content-accent"
                  onClick={() => activeTransform?.zoomOut(0.25)}
                >
                  <IconMinus stroke={2} size={14} />
                </Button>
                <span className="text-content-accent w-10 text-center text-xs tabular-nums">
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

        {/* 2) 메인 영역 - 선택한 층의 구역/좌석 */}
        {floors.map((floor) => (
          <TabsContent
            key={floor.id}
            value={String(floor.id)}
            className="flex min-h-0 flex-1 flex-col overflow-hidden p-0"
          >
            {/* ✅ 구역 기능 버튼 그룹 */}
            <div className="flex items-center justify-between gap-x-2">
              <div className="flex shrink-0">
                <div className="flex justify-end gap-x-2">
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
                <div className="mx-1 my-1.5 w-0.5 self-stretch bg-mist-400" />
                <div className="flex justify-end gap-x-2">
                  <AlertDialogCustom
                    variant="secondary"
                    size="base"
                    title="통로 추가"
                    triggerText="통로 추가"
                    description={
                      <AlertDialogDescription className="text-content-secondary whitespace-pre-line">
                        선택한 [{selectedSection?.name}] 기준으로 통로를 추가합니다.
                      </AlertDialogDescription>
                    }
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
              <div className="bg-surface-secondary flex gap-x-4 p-2">
                <div className="flex items-center gap-x-2">
                  <span className="flex h-6 w-6 shrink-0 rounded-md bg-red-400" />
                  <span className="text-content-primary">배정 완료 석</span>
                </div>
                <div className="flex items-center gap-x-2">
                  <span className="bg-surface-danger flex h-6 w-6 shrink-0 rounded-md border-0 text-transparent opacity-15" />
                  <span className="text-content-primary">숨긴 좌석</span>
                </div>
                <div className="flex items-center gap-x-2">
                  <span className="bg-surface-primary flex h-6 w-6 shrink-0 rounded-md" />
                  <span className="text-content-primary">배정 가능 석</span>
                </div>
              </div>
            </div>

            {/* 구역 컨텐츠 시작: 구역/통로 */}
            <div
              className={cn(
                'mt-4 flex min-h-0 flex-1 gap-2 overflow-hidden',
                stagePosition === 'left' || stagePosition === 'right' ? 'flex-row' : 'flex-col',
              )}
            >
              {(stagePosition === 'front' || stagePosition === 'left') && (
                <StageBar position={stagePosition} />
              )}
              <div className="min-h-0 flex-1 cursor-grab overflow-hidden active:cursor-grabbing">
                <TransformWrapper
                  ref={(ref) => {
                    transformRefs.current.set(floor.id, ref);
                  }}
                  initialScale={1}
                  minScale={0.5}
                  maxScale={2}
                  wheel={{ step: isMac ? 0.01 : 0.5, activationKeys: [isMac ? 'Meta' : 'Control'] }}
                  panning={{ allowLeftClickPan: true }}
                  doubleClick={{ disabled: true }}
                >
                  <ScaleTracker onScaleChange={handleScaleChange} />
                  <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                    <div className="flex w-max flex-col gap-y-4 px-2 pt-1 pb-4">
                      {floor.rows.map((floorRow) => (
                        <div key={floorRow.id} className="flex gap-x-4">
                          {floorRow.items.map((item) => (
                            <SectionCard
                              key={`${item.kind}-${item.id}`}
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
                  </TransformComponent>
                </TransformWrapper>
              </div>
              {(stagePosition === 'back' || stagePosition === 'right') && (
                <StageBar position={stagePosition} />
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
