import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import { toast } from 'sonner';
import type { CreateRowsRequest, FloorItem } from '@/types';
import { cn } from '@/lib/utils.ts';
import { headerTitleClass } from '@/constant/styles.ts';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field.tsx';
import { Input } from '@/components/ui/input.tsx';
import useFloorStore from '@/store/floorStore.ts';
import { useState } from 'react';

interface AddRowDialogProps {
  item: FloorItem;
}
export default function AddRowDialog({ item }: AddRowDialogProps) {
  const addRow = useFloorStore((state) => state.addRow);

  const [isOpen, setIsOpen] = useState(false);
  const [rowName, setRowName] = useState('');

  const handleAddRow = async (sectionId: number) => {
    if (rowName == undefined || rowName === '') {
      toast.warning(
        `열 이름을 다시 확인해주세요. 빈 값은 입력할 수 없습니다. \n 입력한 값: ${rowName}`,
      );
      return;
    }

    const req: CreateRowsRequest = {
      rowName: rowName,
    };
    try {
      await addRow(sectionId, req);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '행 추가에 실패했습니다.');
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="xs">
          <IconPlus stroke={2} /> 열 추가
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className={cn(headerTitleClass)}>열 정보 설정</DialogHeader>
        <Field>
          <FieldLabel htmlFor="input-row-name">열 이름</FieldLabel>
          <Input
            id="input-row-name"
            aria-label="input-row-name"
            type="text"
            onChange={(e) => setRowName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddRow(item.id);
              }
            }}
          />
          <FieldDescription>추가 할 열 이름을 입력해주세요.</FieldDescription>
        </Field>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="dialog">닫기</Button>
          </DialogClose>
          <Button onClick={() => handleAddRow(item.id)}>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
