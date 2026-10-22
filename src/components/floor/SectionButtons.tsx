import { useState } from 'react';
import { toast } from 'sonner';
import { IconLayoutColumns, IconMinus, IconTrash } from '@tabler/icons-react';
import AddSectionDialog from '@/components/dialog/section/AddSectionDialog.tsx';
import AlertDialogCustom from '@/components/dialog/AlertDialogCustom.tsx';
import MoveSectionDialog from '@/components/dialog/floor/MoveSectionDialog.tsx';
import SeatLegend from '@/components/floor/SeatLegend.tsx';
import { AlertDialogDescription } from '@/components/ui/alert-dialog';
import { findAisleInFloor, findFloorRowBySectionId, findSectionInFloor } from '@/lib/floorUtils.ts';
import useFloorStore from '@/store/floorStore.ts';
import type { CreateAisleRequest, Floor } from '@/types';

export interface SectionButtonsProps {
  floor: Floor;
  selectedSectionId: number | undefined;
  setSelectedSectionId: (id: number | undefined) => void;
  setSelectedRowId: (id: number | undefined) => void;
  selectedFloor: Floor | undefined;
  selectedAisleId: number | undefined;
}

export default function SectionButtons({
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

  const selectedSection = findSectionInFloor(selectedFloor, selectedSectionId);
  const selectedFloorRow = findFloorRowBySectionId(selectedFloor, selectedSectionId);
  const selectedAisle = findAisleInFloor(selectedFloor, selectedAisleId);

  const handleRemoveAisle = async () => {
    if (!selectedAisle) return;

    try {
      await removeAisle(selectedAisle.id);
      toast.success(`[${selectedAisle.label}] 통로 삭제 성공`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '통로 삭제를 실패했습니다.');
    }
  };

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
    if (selectedSection?.id == undefined) {
      toast.warning('선택된 구역이 없습니다.');
      return;
    }
    try {
      await removeSection(selectedSection.id);
      toast.success(`[${selectedSection.name}] 구역 삭제 성공`);
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
          <MoveSectionDialog
            floor={floor}
            onSaved={() => {
              setSelectedSectionId(undefined);
              setSelectedRowId(undefined);
            }}
          />
          <AlertDialogCustom
            title={'구역 삭제'}
            triggerText={'구역 삭제'}
            icon={<IconMinus stroke={2} />}
            size={'base'}
            description={
              <AlertDialogDescription className="text-danger font-semibold">
                [{selectedSection?.name}] 구역을 정말 삭제하시겠습니까?
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
                [{selectedAisle?.label}] 통로 정말 삭제하시겠습니까?
              </AlertDialogDescription>
            }
            actions={[{ text: '통로 삭제', onClick: handleRemoveAisle }]}
            disabled={selectedAisleId == undefined}
          />
        </div>
      </div>
      <SeatLegend />
    </div>
  );
}
