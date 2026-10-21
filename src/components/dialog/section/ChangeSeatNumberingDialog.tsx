import { useState } from 'react';
import { toast } from 'sonner';
import { IconListNumbers } from '@tabler/icons-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import SeatNumberingOption from '@/components/dialog/section/SeatNumberingOption.tsx';
import { DEFAULT_SEAT_NUMBERING } from '@/lib/sectionUtils.ts';
import useFloorStore from '@/store/floorStore.ts';
import type { SeatNumbering, Section } from '@/types';

export interface ChangeSeatNumberingDialogProps {
  section: Section;
}

/** 이미 만들어진 구역의 좌석 번호 방식 변경 (서버가 구역 전체를 재채번) */
export default function ChangeSeatNumberingDialog({ section }: ChangeSeatNumberingDialogProps) {
  const updateSeatNumbering = useFloorStore((state) => state.updateSeatNumbering);

  const current = section.seatNumbering ?? DEFAULT_SEAT_NUMBERING;
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState<SeatNumbering>(current);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) setValue(current); // 열 때마다 현재 방식으로 초기화
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await updateSeatNumbering(section.id, value);
      toast.success(`[${section.name}] 좌석 번호 방식을 변경했습니다.`);
      setIsOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '좌석 번호 방식 변경에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="xs" onClick={(e) => e.stopPropagation()}>
          <IconListNumbers stroke={2} />
          번호 방식
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-150" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="text-primary">좌석 번호 방식 변경</DialogTitle>
          <DialogDescription>
            [{section.name}] 구역의 좌석 번호가 모두 다시 부여됩니다. 이미 배정된 좌석의 번호도
            바뀔 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <SeatNumberingOption value={value} onChange={setValue} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="dialog">취소</Button>
          </DialogClose>
          <Button variant="dialog" disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? '변경 중...' : '변경'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
