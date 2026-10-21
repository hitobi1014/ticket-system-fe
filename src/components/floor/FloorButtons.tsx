import { toast } from 'sonner';
import AlertDialogCustom from '@/components/dialog/AlertDialogCustom.tsx';
import AddFloorDialog from '@/components/dialog/floor/AddFloorDialog.tsx';
import { AlertDialogDescription } from '@/components/ui/alert-dialog';
import useFloorStore from '@/store/floorStore.ts';
import type { Floor } from '@/types';

export interface FloorButtonsProps {
  selectedFloorId: number | undefined;
  setSelectedFloorId: (id: number | undefined) => void;
  selectedFloor: Floor | undefined;
}

export default function FloorButtons({
  selectedFloorId,
  setSelectedFloorId,
  selectedFloor,
}: FloorButtonsProps) {
  const removeFloor = useFloorStore((state) => state.removeFloor);
  const floors = useFloorStore((state) => state.floors);

  const handleRemoveFloor = async () => {
    // TODO 추후확인 해당 층에  Section 있으면 경고 메시지
    if (selectedFloorId == null) return;

    try {
      await removeFloor(selectedFloorId);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '층 삭제에 실패했습니다.');
      return;
    }

    toast.success('층 삭제 성공했습니다.');
    // 삭제한 층이 현재 선택된 층이면 -> 첫 번째 층으로 이동
    const remaining = floors.filter((f) => f.id !== selectedFloorId);
    setSelectedFloorId(remaining.length > 0 ? remaining[0].id : undefined);
  };

  return (
    <div className="flex items-center justify-end gap-x-2">
      <AddFloorDialog onAdded={setSelectedFloorId} />
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
