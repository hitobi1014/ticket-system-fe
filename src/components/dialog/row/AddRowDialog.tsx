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
import type { AddRowPosition, CreateRowsRequest, FloorItem } from '@/types';
import { cn } from '@/lib/utils.ts';
import { headerTitleClass } from '@/constant/styles.ts';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field.tsx';
import { Input } from '@/components/ui/input.tsx';
import useFloorStore from '@/store/floorStore.ts';
import { useState } from 'react';

const POSITION_OPTIONS: { value: AddRowPosition; label: string; needsBaseRow: boolean }[] = [
  { value: 'BEFORE', label: '선택 열 이전에 생성', needsBaseRow: true },
  { value: 'AFTER', label: '선택 열 이후에 생성', needsBaseRow: true },
  { value: 'FIRST', label: '첫 번째 열에 생성', needsBaseRow: false },
  { value: 'LAST', label: '마지막 열에 생성', needsBaseRow: false },
];

export interface AddRowDialogProps {
  item: FloorItem;
  /** 선택된 줄(열 또는 빈 줄) ID — 없으면 '선택 열' 기준 옵션은 비활성화 */
  selectedRowId?: number;
}
export default function AddRowDialog({ item, selectedRowId }: AddRowDialogProps) {
  const addRow = useFloorStore((state) => state.addRow);

  const [isOpen, setIsOpen] = useState(false);
  const [rowName, setRowName] = useState('');
  const [position, setPosition] = useState<AddRowPosition>('LAST');

  // 열 때마다 입력값 초기화
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setRowName('');
      setPosition('LAST');
    }
    setIsOpen(open);
  };

  const handleAddRow = async (sectionId: number) => {
    if (rowName == undefined || rowName === '') {
      toast.warning(
        `열 이름을 다시 확인해주세요. 빈 값은 입력할 수 없습니다. \n 입력한 값: ${rowName}`,
      );
      return;
    }

    const needsBaseRow = position === 'BEFORE' || position === 'AFTER';
    const req: CreateRowsRequest = {
      rowName: rowName,
      position,
      ...(needsBaseRow ? { baseRowId: selectedRowId } : {}),
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
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
            value={rowName}
            onChange={(e) => setRowName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddRow(item.id);
              }
            }}
          />
          <FieldDescription>추가 할 열 이름을 입력해주세요.</FieldDescription>
          <div role="radiogroup" aria-label="열 추가 위치" className="grid grid-cols-2 gap-2">
            {POSITION_OPTIONS.map((option) => {
              const disabled = option.needsBaseRow && selectedRowId == undefined;
              return (
                <label
                  key={option.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-x-2 rounded-md border px-3 py-2 text-sm',
                    disabled && 'cursor-not-allowed opacity-50',
                    position === option.value && 'border-primary',
                  )}
                >
                  <input
                    type="radio"
                    name="add-row-position"
                    className="accent-primary"
                    value={option.value}
                    checked={position === option.value}
                    disabled={disabled}
                    onChange={() => setPosition(option.value)}
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
          {selectedRowId == undefined && (
            <FieldDescription>열을 선택하면 선택 열 기준 옵션을 사용할 수 있습니다.</FieldDescription>
          )}
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
