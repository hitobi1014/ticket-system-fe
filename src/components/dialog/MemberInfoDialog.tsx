import { type CreateMemberRequest, INSTRUMENTS, type Member } from '@/types';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Field, FieldLabel } from '@/components/ui/field.tsx';
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
import { useState } from 'react';
import useMemberStore from '@/store/memberStore.ts';
import { toast } from 'sonner';
import AlertDialogCustom from '@/components/dialog/AlertDialogCustom.tsx';
import { Input } from '@/components/ui/input';

interface MemberInfoModalProps {
  member?: Member; // 수정시 사용
  onClose: () => void;
}

export default function MemberInfoDialog({ member, onClose }: MemberInfoModalProps) {
  const { addMember, updateMember, removeMember, isLoading } = useMemberStore();
  const [form, setForm] = useState<CreateMemberRequest>({
    name: member?.name ?? '',
    instrumentAbbr: member?.instrument.abbr ?? INSTRUMENTS[0].abbr,
    allocatedTickets: member?.allocatedTickets ?? 0,
    color: member?.color ?? '#000000',
  });

  const isEditMode = member !== undefined;

  const handleChange = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
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
      className="sm:max-w-106.25 bg-surface-secondary border border-content-primary"
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
      <div className="flex flex-col gap-y-2 text-content-primary">
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
              const find = INSTRUMENTS.find((i) => i.abbr === v)!;
              handleChange('instrumentAbbr', find.abbr);
            }}
          >
            <SelectTrigger className="w-45 bg-surface-primary text-content-primary border-0">
              <SelectValue placeholder="선택" />
            </SelectTrigger>
            <SelectContent className="bg-surface-primary text-content-primary">
              <SelectGroup>
                {INSTRUMENTS.map((i) => (
                  <SelectItem key={i.abbr} value={i.abbr}>
                    {i.abbr}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        {/*  배정 티켓수 */}
        <Field className="max-w-sm">
          <FieldLabel htmlFor="allow-ticket-input">배정티켓</FieldLabel>
          <Input
            id="allow-ticket-input"
            aria-label="allow-ticket-input"
            type="number"
            className="bg-surface-primary border-0 no-spinners"
            value={form?.allocatedTickets}
            placeholder="배정할 티켓 수량을 입력하세요."
            onChange={(e) => handleChange('allocatedTickets', Number(e.target.value))}
          />
        </Field>

        {/* 회원 색상 */}
        <Field className="max-w-sm">
          <FieldLabel htmlFor="inline-end-input">색상</FieldLabel>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="w-6 h-6 rounded-full border border-surface-accent"
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
        </Field>
      </div>

      <DialogFooter className="flex justify-between! bg-surface-secondary pb-2.5">
        <AlertDialogCustom
          variant="dialog"
          size="sm"
          triggerText={'회원삭제'}
          title={'확인'}
          description={`[${form.name}]님을 목록에서 제거 하시겠습니까?`}
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
