import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { IconArmchair } from '@tabler/icons-react';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useState } from 'react';
import { toast } from 'sonner';
import useFloorStore from '@/store/floorStore.ts';
import type { CreateSeatRequest } from '@/types';
import { cn } from '@/lib/utils.ts';
import { headerTitleClass } from '@/constant/styles.ts';

interface AddSeatDialogProps {
  triggerDisabled: boolean;
  selectedRowId: number;
}

export default function AddSeatDialog({ triggerDisabled, selectedRowId }: AddSeatDialogProps) {
  const addSeat = useFloorStore((state) => state.addSeat);
  const [isAddSeatDialogOpen, setIsAddSeatDialogOpen] = useState(false);
  const [addSeatCount, setAddSeatCount] = useState(0);

  /**
   * 입력 받은 좌석 수 만큼 해당 열에 좌석 추가
   */
  const handleAddSeat = async () => {
    if (addSeatCount === 0) {
      toast.warning(`1개 이상의 좌석수를 입력해주세요 \n 입력값 :${addSeatCount}`);
      return;
    }

    const req: CreateSeatRequest = {
      addSeatCount: addSeatCount,
    };

    try {
      await addSeat(selectedRowId, req);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '좌석 추가에 실패했습니다.');
    } finally {
      setIsAddSeatDialogOpen(false);
    }
  };

  return (
    <Dialog open={isAddSeatDialogOpen} onOpenChange={setIsAddSeatDialogOpen}>
      <DialogTrigger asChild>
        <Button size="xs" disabled={triggerDisabled}>
          <IconArmchair stroke={2} />
          좌석 추가
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className={cn(headerTitleClass)}>추가 좌석 설정</DialogHeader>
        <Field>
          <FieldLabel htmlFor="input-seat-count">추가 좌석 수</FieldLabel>
          <Input
            id="input-seat-count"
            aria-label="input-seat-count"
            type="number"
            className="no-spinners"
            onChange={(e) => setAddSeatCount(Number(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSeat();
              }
            }}
          />
          <FieldDescription>추가하실 좌석 수를 입력해주세요</FieldDescription>
        </Field>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="dialog">닫기</Button>
          </DialogClose>
          <Button onClick={handleAddSeat}>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
