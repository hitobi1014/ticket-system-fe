import useFloorStore from '../store/floorStore.ts';
import useVenueStore from '@/store/venueStore.ts';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Aisle, CreateAisleRequest, CreateFloorRequest, Floor, Section } from '@/types';
import SectionCard from '@/components/seat/SectionCard.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconLayoutColumns, IconMinus, IconPlus, IconTrash, IconZoomIn } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import AddSectionDialog from '@/components/dialog/AddSectionDialog.tsx';
import AlertDialogCustom from '@/components/dialog/AlertDialogCustom.tsx';
import { toast } from 'sonner';
import { cn } from '@/lib/utils.ts';
import StageBar from '@/components/seat-assign/StageBar.tsx';
import {
  type ReactZoomPanPinchContentRef,
  TransformComponent,
  TransformWrapper,
  useTransformEffect,
} from 'react-zoom-pan-pinch';
import { headerTitleClass, pageContentClass } from '@/constant/styles.ts';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AlertDialogDescription } from '@/components/ui/alert-dialog';

function ScaleTracker({ onScaleChange }: { onScaleChange?: (scale: number) => void }) {
  useTransformEffect((state) => {
    onScaleChange?.(state.state.scale);
  });
  return null;
}

export default function FloorSetupPage() {
  const isInitalized = useRef(false);
  const floors = useFloorStore((state) => state.floors);
  const venue = useVenueStore((state) => state.venue);

  const stagePosition = venue?.stagePosition ?? 'front';
  const [selectedFloorId, setSelectedFloorId] = useState<number | undefined>(undefined);
  const [selectedSectionId, setSelectedSectionId] = useState<number | undefined>(undefined);
  const [selectedAisleId, setSelectedAisleId] = useState<number | undefined>(undefined);
  const [selectedRowId, setSelectedRowId] = useState<number | undefined>(undefined);

  const [currentScale, setCurrentScale] = useState(1);
  const [showZoomDropdown, setShowZoomDropdown] = useState(false);

  useEffect(() => {
    if (!isInitalized.current && floors.length > 0 && selectedFloorId == undefined) {
      setSelectedFloorId(floors[0].id);
      isInitalized.current = true;
    }
  }, [floors, selectedFloorId]);

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

  const isMac = navigator.platform.toUpperCase().includes('MAC');
  const selectedFloor = floors.find((x) => x.id === selectedFloorId) ?? undefined;

  const handleZoomOut = useCallback(() => {
    const activeTransform = transformRefs.current.get(selectedFloorId ?? -1);
    activeTransform?.zoomOut(0.25);
  }, [selectedFloorId]);

  const handleZoomIn = useCallback(() => {
    const activeTransform = transformRefs.current.get(selectedFloorId ?? -1);
    activeTransform?.zoomIn(0.25);
  }, [selectedFloorId]);

  return (
    <div className={cn(pageContentClass, 'flex h-full flex-col overflow-hidden')}>
      {/*상단 버튼 그룹*/}
      <FloorButtons
        selectedFloorId={selectedFloorId}
        setSelectedFloorId={setSelectedFloorId}
        selectedFloor={selectedFloor}
      />
      <Tabs
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        value={String(selectedFloorId)}
        onValueChange={(v) => setSelectedFloorId(Number(v))}
        onClick={() => {
          setSelectedSectionId(undefined);
          setSelectedRowId(undefined);
        }}
      >
        <div className="flex items-center justify-between">
          {/* 1층 탭바 */}
          <TabsList variant="default">
            {floors.map((floor) => (
              <TabsTrigger variant="default" key={floor.id} value={String(floor.id)}>
                {floor.name}
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
              <div className="bg-popover text-primary border-accent absolute top-full right-0 z-50 mt-1 flex items-center gap-x-0.5 rounded-md border px-1.5 py-1 shadow-md">
                <Button variant="ghost" size="icon-xs" onClick={handleZoomOut}>
                  <IconMinus stroke={2} size={14} />
                </Button>
                <span className="w-10 text-center text-xs tabular-nums">
                  {Math.round(currentScale * 100)}%
                </span>
                <Button variant="ghost" size="icon-xs" onClick={handleZoomIn}>
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
            <SectionButtons
              selectedSectionId={selectedSectionId}
              floor={floor}
              setSelectedSectionId={setSelectedSectionId}
              setSelectedRowId={setSelectedRowId}
              selectedFloor={selectedFloor}
              selectedAisleId={selectedAisleId}
            />

            {/* 구역 컨텐츠 시작: 구역/통로 */}
            <div
              className={cn(
                'bg-card mt-4 flex min-h-0 flex-1 gap-2 overflow-hidden rounded-md p-4',
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

interface FloorButtonsProps {
  selectedFloorId: number | undefined;
  setSelectedFloorId: (id: number | undefined) => void;
  selectedFloor: Floor | undefined;
}

function FloorButtons({ selectedFloorId, setSelectedFloorId, selectedFloor }: FloorButtonsProps) {
  const addFloor = useFloorStore((state) => state.addFloor);
  const removeFloor = useFloorStore((state) => state.removeFloor);
  const floors = useFloorStore((state) => state.floors);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [floorInfo, setFloorInfo] = useState<string>('');

  const handleAddFloor = async () => {
    const req: CreateFloorRequest = {
      name: floorInfo.trim(),
    };
    try {
      const savedFloor = await addFloor(req);
      setSelectedFloorId(savedFloor.id);
      setFloorInfo('');
      setIsModalOpen(false);
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

    toast.success('층 삭제 성공했습니다.');
    // 삭제한 층이 현재 선택된 층이면 -> 첫 번째 층으로 이동
    const remaining = floors.filter((f) => f.id !== selectedFloorId);
    setSelectedFloorId(remaining.length > 0 ? remaining[0].id : undefined);
  };

  return (
    <div className="flex items-center justify-end gap-x-2">
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger>
          <Button variant="default" size="base">
            층 추가
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className={cn(headerTitleClass)}>층 추가</DialogHeader>
          <DialogDescription>층 이름을 입력하세요</DialogDescription>
          <Input
            type="text"
            aria-label="input-floor"
            onChange={(e) => setFloorInfo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                void handleAddFloor();
              }
            }}
            value={floorInfo}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="dialog" onClick={() => setIsModalOpen(false)}>
                닫기
              </Button>
            </DialogClose>
            <Button variant="dialog" onClick={handleAddFloor} disabled={!floorInfo.trim()}>
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialogCustom
        variant={'default'}
        size={'base'}
        title={'층 삭제'}
        triggerText={'층 삭제'}
        description={
          <AlertDialogDescription className="whitespace-pre-line">
            선택한 층 [{selectedFloor?.name}]을 삭제하시겠습니까?
          </AlertDialogDescription>
        }
        actions={[{ text: '삭제', onClick: handleRemoveFloor }]}
      />
    </div>
  );
}

interface SectionButtonsProps {
  floor: Floor;
  selectedSectionId: number | undefined;
  setSelectedSectionId: (id: number | undefined) => void;
  setSelectedRowId: (id: number | undefined) => void;
  selectedFloor: Floor | undefined;
  selectedAisleId: number | undefined;
}

function SectionButtons({
  floor,
  selectedSectionId,
  setSelectedSectionId,
  setSelectedRowId,
  selectedFloor,
  selectedAisleId,
}: SectionButtonsProps) {
  const addAisle = useFloorStore((state) => state.addAisle);
  const removeSection = useFloorStore((state) => state.removeSection);
  const removeAisle = useFloorStore((state) => state.removeAisle);

  const [addSectionDialogKey, setAddSectionDialogKey] = useState<number>(0);

  const selectedSection =
    selectedFloor?.rows
      .flatMap((r) => r.items)
      .filter((item): item is Section => item.kind === 'section')
      .find((x) => x.id === selectedSectionId) ?? null;

  const selectedFloorRow =
    selectedFloor?.rows.find((r) =>
      r.items.some((item) => item.kind === 'section' && item.id === selectedSectionId),
    ) ?? null;

  const findAisle = selectedFloor?.rows
    .flatMap((r) => r.items)
    .find((item): item is Aisle => item.kind === 'aisle' && item.id === selectedAisleId);

  const handleRemoveAisle = async () => {
    if (!findAisle) return;

    try {
      await removeAisle(findAisle.id);
      toast.success(`[${findAisle.label}] 통로 삭제 성공`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '통로 삭제를 실패했습니다.');
    }
  };

  const findSection = selectedFloor?.rows
    .flatMap((r) => r.items)
    .find((item): item is Section => item.kind === 'section' && item.id === selectedSectionId);

  const handleAddAisle = async (direction: 'left' | 'right') => {
    if (!selectedFloor || !selectedSectionId || !selectedFloorRow?.id) {
      toast.warning('구역을 먼저 선택해주세요');
      return;
    }

    const req: CreateAisleRequest = {
      label: '통로',
      sectionId: selectedSectionId,
      floorRowId: selectedFloorRow.id,
      direction: direction,
    };

    try {
      await addAisle(selectedFloor.id, req);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '통로 추가에 실패했습니다.');
    }
  };

  const handleRemoveSection = async () => {
    if (findSection?.id == undefined) {
      toast.warning('선택된 구역이 없습니다.');
      return;
    }
    try {
      await removeSection(findSection.id);
      toast.success(`[${findSection.name}] 구역 삭제 성공`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '구역 삭제에 실패했습니다.');
    }
  };

  return (
    <div role="group" className="flex items-center justify-between gap-x-2">
      <div className="flex shrink-0">
        <div className="flex justify-end gap-x-2">
          <AddSectionDialog
            key={addSectionDialogKey}
            floorId={floor.id}
            onConfirm={() => {
              // 구역 추가 완료 시 선택 상태 초기화
              setSelectedSectionId(undefined);
              setSelectedRowId(undefined);
              setAddSectionDialogKey((prev) => prev + 1);
            }}
          />
          <AlertDialogCustom
            title={'구역 삭제'}
            triggerText={'구역 삭제'}
            icon={<IconMinus stroke={2} />}
            size={'base'}
            description={
              <AlertDialogDescription className="text-danger font-semibold">
                [{findSection?.name}] 구역을 정말 삭제하시겠습니까?
              </AlertDialogDescription>
            }
            actions={[{ text: '삭제', onClick: handleRemoveSection }]}
            disabled={selectedSectionId == undefined}
          />
        </div>

        <div className="bg-primary mx-1 my-1.5 w-0.5 self-stretch" />
        <div className="flex justify-end gap-x-2">
          <AlertDialogCustom
            size="base"
            title="통로 추가"
            triggerText="통로 추가"
            description={
              <AlertDialogDescription className="whitespace-pre-line">
                선택한 [{selectedSection?.name}] 기준으로 통로를 추가합니다.
              </AlertDialogDescription>
            }
            actions={[
              { text: '← 좌측', onClick: () => handleAddAisle('left') },
              { text: '우측 →', onClick: () => handleAddAisle('right') },
            ]}
            icon={<IconLayoutColumns stroke={2} />}
            disabled={selectedSectionId == undefined}
            variant={'default'}
          />
          <AlertDialogCustom
            size="base"
            title="통로 삭제"
            triggerText="통로 삭제"
            icon={<IconTrash stroke={2} />}
            description={
              <AlertDialogDescription className="text-danger font-semibold">
                [{findAisle?.label}] 통로 정말 삭제하시겠습니까?
              </AlertDialogDescription>
            }
            actions={[{ text: '통로 삭제', onClick: handleRemoveAisle }]}
            disabled={selectedAisleId == undefined}
          />
        </div>
      </div>
      <div className="flex gap-x-4 p-2">
        <div className="flex items-center gap-x-2">
          <span className="bg-success flex h-6 w-6 shrink-0 rounded-md" />
          <span>배정 완료 석</span>
        </div>
        <div className="flex items-center gap-x-2">
          <span className="bg-danger/50 flex h-6 w-6 shrink-0 rounded-md border-0" />
          <span>숨긴 좌석</span>
        </div>
        <div className="flex items-center gap-x-2">
          <span className="border-primary flex h-6 w-6 shrink-0 rounded-md border" />
          <span>배정 가능 석</span>
        </div>
      </div>
    </div>
  );
}
