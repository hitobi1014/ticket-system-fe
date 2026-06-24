import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx';
import { DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useState } from 'react';
import type { CreateVenueRequest, StagePosition, UpdateVenueRequest } from '@/types';
import useVenueStore from '@/store/venueStore.ts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VenueInfoDialogProps {
  venue: UpdateVenueRequest | undefined;
  isUpdate: boolean;
}

const stagePositionStyle: Record<StagePosition, string> = {
  front: 'top-2 left-1/2 -translate-x-1/2',
  back: 'bottom-2 left-1/2 -translate-x-1/2',
  left: 'left-2 top-1/2 -translate-y-1/2',
  right: 'right-2 top-1/2 -translate-y-1/2',
  center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

function StagePreview({ position }: { position: StagePosition }) {
  return (
    <div className="relative h-32 rounded-lg border border-border bg-surface-primary overflow-hidden">
      <span
        className={cn(
          'absolute px-3 py-1 rounded text-xs font-semibold bg-blue-500 text-white transition-all duration-300',
          stagePositionStyle[position],
        )}
      >
        STAGE
      </span>
    </div>
  );
}

// 무대위치
const stagePositionOptions: { value: StagePosition; label: string }[] = [
  { value: 'front', label: '앞' },
  { value: 'right', label: '오른쪽' },
  { value: 'left', label: '왼쪽' },
  { value: 'center', label: '중앙' },
  { value: 'back', label: '뒤' },
];

export function VenueInfoDialog({ venue, isUpdate }: VenueInfoDialogProps) {
  const [open, setOpen] = useState(false);
  const { addVenue, updateVenue, isLoading } = useVenueStore();

  const [form, setForm] = useState<CreateVenueRequest | UpdateVenueRequest>({
    name: venue?.name ?? '',
    address: venue?.address ?? '',
    performanceDate: venue?.performanceDate ?? '',
    stagePosition: venue?.stagePosition ?? 'front',
    totalSeats: venue?.totalSeats ?? 0,
  });

  const handleChange = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (isUpdate) {
      if (venue?.id == null) {
        toast.error('venue id 없음');
        return;
      }
      const req: UpdateVenueRequest = {
        totalSeats: form.totalSeats,
        performanceDate: form.performanceDate,
        stagePosition: form.stagePosition,
        name: form.name,
        address: form.address,
        id: venue.id,
      };
      try {
        await updateVenue(req);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '공연장 정보 수정 실패');
        return;
      }
      toast.success('공연장 수정을 성공했습니다.');
    } else {
      const req: CreateVenueRequest = {
        performanceDate: form.performanceDate,
        stagePosition: form.stagePosition,
        name: form.name,
        address: form.address,
        totalSeats: form.totalSeats,
      };
      try {
        await addVenue(req);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '공연장 정보 등록 실패');
        return;
      }
      toast.success('공연장 등록을 성공했습니다.');
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>공연장 정보</Button>
      </DialogTrigger>
      <DialogContent className="min-w-140 bg-surface-secondary text-content-primary">
        <DialogHeader>
          <DialogTitle className="text-content-primary flex items-center gap-x-2">
            {isUpdate ? '공연 정보 수정' : '공연 정보 등록'}
          </DialogTitle>
          <DialogDescription className="text-content-secondary">
            공연장 기본 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-y-2 text-content-primary">
          {/*1. 공연장명*/}
          <Field className="max-w-xs">
            <FieldLabel htmlFor="name-input">공연장 이름</FieldLabel>
            <Input
              id="name-input"
              aria-label="name"
              value={form.name}
              type="text"
              className="bg-surface-primary border-0"
              placeholder="예) 롯데콘서트홀"
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </Field>
          {/*2. 주소*/}
          <Field className="max-w-xs">
            <FieldLabel htmlFor="address-input">공연장 주소</FieldLabel>
            <Input
              id="address-input"
              aria-label="address"
              value={form.address}
              type="text"
              className="bg-surface-primary border-0"
              placeholder="예) 서울 송파구 xx로 50"
              onChange={(e) => handleChange('address', e.target.value)}
            />
          </Field>

          <div className="flex gap-x-4">
            {/*3-1. 공연일시*/}
            <Field>
              <FieldLabel htmlFor="performance-date">공연일시</FieldLabel>
              <Input
                id="performance-date"
                aria-label="performance-date"
                value={form.performanceDate}
                type="date"
                className="bg-surface-primary border-0"
                placeholder="2026.01.01"
                onChange={(e) => handleChange('performanceDate', e.target.value)}
              />
            </Field>
            {/*3-2. 총 좌석 수*/}
            <Field>
              <FieldLabel htmlFor="total-count-input">총 좌석 수</FieldLabel>
              <Input
                id="total-count-input"
                aria-label="total-count"
                value={form.totalSeats}
                min={1}
                type="number"
                className="bg-surface-primary border-0 no-spinners"
                onChange={(e) => handleChange('totalSeats', Number(e.target.value))}
              />
            </Field>
          </div>
          {/*4. 무대 위치*/}
          <Field>
            <FieldLabel htmlFor="stage-position-input">무대 위치</FieldLabel>
            {/*5. 무대 선택 버튼*/}
            <div className="flex justify-around flex-wrap gap-2">
              {stagePositionOptions.map((v) => (
                <Button
                  key={v.value}
                  variant={form.stagePosition === v.value ? 'primary' : 'dialog'}
                  onClick={() => handleChange('stagePosition', v.value)}
                >
                  {v.label} ({v.value})
                </Button>
              ))}
            </div>
          </Field>
          {/*6. 무대 미리보기*/}
          <StagePreview position={form.stagePosition} />
        </div>

        <DialogFooter className="flex bg-surface-secondary">
          <DialogClose asChild>
            <Button variant="dialog">취소</Button>
          </DialogClose>
          <Button variant="dialog" disabled={isLoading} onClick={handleSave}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
