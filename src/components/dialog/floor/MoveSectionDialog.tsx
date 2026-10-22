import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { IconArrowsMove } from '@tabler/icons-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import FloorLayoutBoard from '@/components/dialog/floor/FloorLayoutBoard.tsx';
import useFloorLayoutEditor from '@/hooks/use-floor-layout-editor.ts';
import { cn } from '@/lib/utils.ts';
import { toFloorLayoutRequest } from '@/lib/floorUtils.ts';
import { headerTitleClass } from '@/constant/styles.ts';
import useFloorStore from '@/store/floorStore.ts';
import type { Floor } from '@/types';

export interface MoveSectionDialogProps {
  floor: Floor;
  /** 저장 완료 시 호출 (선택 상태 초기화 등) */
  onSaved?: () => void;
}

/** 구역/통로를 드래그해서 구역 열 간에 이동하는 다이얼로그 */
export default function MoveSectionDialog({ floor, onSaved }: MoveSectionDialogProps) {
  const updateFloorLayout = useFloorStore((state) => state.updateFloorLayout);
  const { draft, isDirty, open, move, reset } = useFloorLayoutEditor();

  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);

  const handleOpenChange = (next: boolean) => {
    if (next) open(floor.rows);
    setIsOpen(next);
  };

  const handleSave = async () => {
    if (!isDirty || savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    try {
      await updateFloorLayout(floor.id, toFloorLayoutRequest(draft));
      toast.success('구역 위치를 변경했습니다.');
      onSaved?.();
      setIsOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '구역 위치 변경에 실패했습니다.');
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" size="base" disabled={floor.rows.length === 0}>
          <IconArrowsMove stroke={2} />
          구역 이동
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] min-w-150 grid-rows-[auto_auto_minmax(0,1fr)_auto]">
        <DialogHeader className={cn(headerTitleClass)}>구역 이동 - {floor.name}</DialogHeader>
        <DialogDescription>
          구역을 드래그해서 원하는 구역 열의 위치(구역 사이)로 옮기세요. 줄 사이로 옮기면 새 구역
          열이 만들어집니다.
        </DialogDescription>
        <div className="no-scrollbar min-h-0 overflow-auto">
          <FloorLayoutBoard rows={draft} onMove={move} />
        </div>
        <DialogFooter>
          <Button variant="dialog" onClick={reset} disabled={!isDirty || isSaving}>
            초기화
          </Button>
          <DialogClose asChild>
            <Button variant="dialog">닫기</Button>
          </DialogClose>
          <Button variant="dialog" onClick={handleSave} disabled={!isDirty || isSaving}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
