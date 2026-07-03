import { type CreateMemberRequest, INSTRUMENTS, type Member } from '@/types';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field.tsx';
import { AlertDialogDescription } from '@/components/ui/alert-dialog.tsx';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { HexColorPicker } from 'react-colorful';
import { useEffect, useState } from 'react';
import useMemberStore from '@/store/memberStore.ts';
import { toast } from 'sonner';
import AlertDialogCustom from '@/components/dialog/AlertDialogCustom.tsx';
import { Input } from '@/components/ui/input';

interface MemberInfoModalProps {
  member?: Member; // 수정시 사용
  onClose: () => void;
}

export default function MemberInfoDialog({ member, onClose }: MemberInfoModalProps) {
  const { addMember, updateMember, removeMember, getAssignedCountMap, isLoading } =
    useMemberStore();
  const [form, setForm] = useState<CreateMemberRequest>({
    name: member?.name ?? '',
    instrumentAbbr: member?.instrument.abbr ?? '지휘',
    allocatedTickets: member?.allocatedTickets ?? 0,
    color: member?.color ?? '#000000',
  });
  const [assignedSeatCount, setAssignedSeatsCount] = useState<number | null>(null);

  const isEditMode = member !== undefined;

  useEffect(() => {
    if (member?.id) {
      // [수정 일때] 좌석 배정 완료건
      const map = getAssignedCountMap();
      setAssignedSeatsCount(map[member.id]);
    }
  }, [member?.id, getAssignedCountMap]);

  const handleChange = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
    if (field === 'allocatedTickets') {
      const numValue = value as number; // 타입 단언
      if (assignedSeatCount != null && numValue < assignedSeatCount) {
        toast.error(
          `변경한 배정티켓 수량(${numValue})이 좌석 배정 완료된수(${assignedSeatCount})보다 적을 수 없습니다.`,
        );
        return;
      }
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    let msg;
    if (isEditMode) {
      await updateMember(member.id, form);
      msg = `${form.name}님 회원 정보 수정을 성공했습니다.`;
    } else {
      await addMember(form);
      msg = `${form.name}님 회원 등록을 성공했습니다.`;
    }
    toast(msg);
    onClose();
  };

  const handleRemoveMember = async () => {
    if (member === undefined) return;
    try {
      await removeMember(member.id);
      toast.success(`${member.name} 회원이 삭제되었습니다.`);
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '회원 삭제에 실패햇습니다.');
    }
  };

  return (
    <DialogContent
      className="bg-surface-secondary border-content-primary border sm:max-w-106.25"
      onInteractOutside={onClose}
    >
      <DialogHeader>
        {/* 회원 등록/수정 */}
        <DialogTitle className="text-content-primary flex items-center gap-x-2">
          회원 등록
        </DialogTitle>
      </DialogHeader>
      {/*등록수정항목*/}

      {/*[ '이름', '악기', '배정 티켓', '배정된 좌석 수', */}
      <div className="text-content-primary flex flex-col gap-y-2">
        {/* 이름, 악기, 색상*/}
        <div className="flex items-center gap-x-2">
          {/*  이름 */}
          <Field className="max-w-sm">
            <FieldLabel htmlFor="name-input">이름</FieldLabel>
            <Input
              id="name-input"
              aria-label="name"
              value={form?.name}
              type="triggerText"
              className="bg-surface-primary border-0"
              placeholder="이름을 입력하세요"
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </Field>

          {/*  악기 */}
          <Field className="max-w-sm">
            <FieldLabel htmlFor="inline-end-input">악기</FieldLabel>
            <Select
              value={form?.instrumentAbbr}
              onValueChange={(v) => {
                handleChange('instrumentAbbr', v);
              }}
            >
              <SelectTrigger className="bg-surface-primary text-content-primary w-45 border-0">
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent className="bg-surface-primary text-content-primary">
                <SelectGroup>
                  {Object.entries(INSTRUMENTS).map(([abbr, name]) => (
                    <SelectItem key={abbr} value={abbr}>
                      <p className="w-8">{abbr}</p>
                      <p>[{name}]</p>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          {/* 회원 색상 */}
          <div className="flex w-16 shrink-0 flex-col items-center gap-y-2">
            <p>색상</p>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="border-surface-accent h-8 w-8 shrink-0 cursor-pointer rounded-full border"
                  style={{ backgroundColor: form?.color }}
                />
              </PopoverTrigger>
              <PopoverContent>
                <HexColorPicker
                  color={form?.color}
                  onChange={(color) => handleChange('color', color)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex gap-x-4">
          {/*  배정 티켓수 */}
          <Field className="max-w-sm">
            <FieldLabel htmlFor="allow-ticket-input">배정티켓</FieldLabel>
            <Input
              id="allow-ticket-input"
              aria-label="allow-ticket-input"
              type="number"
              className="bg-surface-primary no-spinners border-0"
              min={0}
              value={form?.allocatedTickets}
              placeholder="배정할 티켓 수량을 입력하세요."
              onChange={(e) => handleChange('allocatedTickets', Number(e.target.value))}
            />
            {assignedSeatCount != null && assignedSeatCount > 0 && (
              <FieldDescription className="text-surface-danger text-xs">
                이미 배정된 좌석({assignedSeatCount})보다 적게 설정할 수 없습니다.
              </FieldDescription>
            )}
          </Field>
          <Field className="max-w-sm">
            <FieldLabel htmlFor="assigned-ticket-input">좌석 배정 완료</FieldLabel>
            <Input
              id="assigned-ticket-input"
              aria-label="assigned-ticket-input"
              readOnly={true}
              value={assignedSeatCount ?? 0}
              className="bg-surface-accent border-0"
            />
          </Field>
        </div>
      </div>

      <DialogFooter className="bg-surface-secondary flex justify-between! pb-2.5">
        <AlertDialogCustom
          variant="dialog"
          size="sm"
          triggerText={'회원삭제'}
          title={'확인'}
          description={
            <>
              <AlertDialogDescription className="text-content-secondary whitespace-pre-line">
                [{form.name}]님을 목록에서 제거 하시겠습니까?
              </AlertDialogDescription>
              <AlertDialogDescription className="text-surface-danger mt-2">
                <p className="font-bold">⚠️ 주의: 이 작업은 되돌릴 수 없습니다.</p>
                {assignedSeatCount != null && assignedSeatCount > 0 && (
                  <p className="text-xs">배정 완료된 좌석({assignedSeatCount}석)도 삭제됩니다.</p>
                )}
              </AlertDialogDescription>
            </>
          }
          actions={[{ text: '확인', onClick: () => handleRemoveMember() }]}
          disabled={isLoading.remove}
        />
        <div className="flex gap-2">
          <Button variant="dialog" onClick={() => onClose()}>
            닫기
          </Button>
          <Button
            variant="dialog"
            onClick={() => handleSave()}
            disabled={isEditMode ? isLoading.update : isLoading.add}
          >
            {isEditMode ? '수정' : '등록'}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );
}
