import { type CreateMemberRequest, INSTRUMENTS, type Member } from '@/types';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
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

interface MemberInfoModalProps {
  member?: Member; // 수정시 사용
  onClose: () => void;
}

export default function MemberInfoModal({ member, onClose }: MemberInfoModalProps) {
  const { addMember, updateMember, removeMember } = useMemberStore();
  const [form, setForm] = useState<CreateMemberRequest>({
    name: member?.name ?? '',
    point: member?.point ?? 0,
    instrument: member?.instrument ?? INSTRUMENTS[0],
    allocatedTickets: member?.allocatedTickets ?? 0,
    color: member?.color,
  });

  const isEditMode = member !== undefined;

  const handleChange = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    let msg;
    if (isEditMode) {
      updateMember(member.id, form);
      msg = `${form.name}님 회원 정보 수정을 성공했습니다.`;
    } else {
      addMember(form);
      msg = `${form.name}님 회원 등록을 성공했습니다.`;
    }
    toast(msg);
    onClose();
  };

  const handleRemoveMember = () => {
    if (member === undefined) return;
    removeMember(member.id);
  };

  return (
    <DialogContent className="sm:max-w-106.25" onInteractOutside={onClose}>
      <DialogHeader>
        {/* 회원 등록/수정 */}
        <DialogTitle className="popup-title">회원 등록</DialogTitle>
      </DialogHeader>
      {/*등록수정항목*/}
      {/*[ '이름', '악기', '배정 티켓', '배정된 좌석 수', */}
      <div>
        {/*  이름 */}
        <Field className="max-w-sm">
          <FieldLabel htmlFor="inline-end-input">이름</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="inline-end-input"
              value={form?.name}
              type="triggerText"
              placeholder="이름을 입력하세요"
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </InputGroup>
        </Field>

        {/*  악기 */}
        <Field className="max-w-sm">
          <FieldLabel htmlFor="inline-end-input">악기</FieldLabel>
          <Select
            value={form?.instrument.abbr}
            onValueChange={(v) => {
              const find = INSTRUMENTS.find((i) => i.abbr === v)!;
              handleChange('instrument', find);
            }}
          >
            <SelectTrigger className="w-45">
              <SelectValue placeholder="선택" />
            </SelectTrigger>
            <SelectContent>
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

        {/* 상점 */}
        <Field className="max-w-sm">
          <FieldLabel htmlFor="inline-end-input">상점</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="inline-end-input"
              type="number"
              value={form?.point}
              placeholder="상점을 입력하세요."
              onChange={(e) => handleChange('point', Number(e.target.value))}
            />
          </InputGroup>
        </Field>

        {/*  배정 티켓수 */}
        <Field className="max-w-sm">
          <FieldLabel htmlFor="inline-end-input">배정티켓</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="inline-end-input"
              type="number"
              value={form?.allocatedTickets}
              placeholder="배정할 티켓 수량을 입력하세요."
              onChange={(e) => handleChange('allocatedTickets', Number(e.target.value))}
            />
          </InputGroup>
        </Field>

        {/* 회원 색상 */}
        <Field className="max-w-sm">
          <FieldLabel htmlFor="inline-end-input">색상</FieldLabel>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="w-6 h-6 rounded-full border border-gray-300"
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
      <DialogFooter className="flex justify-between!">
        <AlertDialogCustom
          variant="primary"
          size="sm"
          dialogActionBtnText="확인"
          triggerText={'회원삭제'}
          title={'확인'}
          description={`[${form.name}]님을 목록에서 제거 하시겠습니까?`}
          onConfirm={() => handleRemoveMember()}
        />
        <div className="flex gap-2">
          <Button variant="close" onClick={() => onClose()}>
            닫기
          </Button>
          <Button variant={isEditMode ? 'modify' : 'confirm'} onClick={() => handleSave()}>
            {isEditMode ? '수정' : '등록'}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );
}
