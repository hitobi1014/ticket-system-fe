import { useMemo, useRef, useState } from 'react';
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
import { Input } from '@/components/ui/input.tsx';
import { IconUserEdit } from '@tabler/icons-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils.ts';
import { headerTitleClass } from '@/constant/styles.ts';
import useAuthStore from '@/store/authStore.ts';
import useFloorStore from '@/store/floorStore.ts';
import useSeatGuideStore from '@/store/seatGuideStore.ts';
import { findSeatsByMemberId } from '@/lib/seatUtils.ts';
import type { SeatGuestNameUpdate } from '@/types';
import MySeatPreview from '@/components/dialog/MySeatPreview';

export default function GuestNameInputModal() {
  const { currentMember } = useAuthStore();
  const { updateSeatGuestNames } = useFloorStore();
  const { floors, fetchFloors: fetchSeatGuideFloors } = useSeatGuideStore();
  const [isOpen, setIsOpen] = useState(false);
  const [guestNames, setGuestNames] = useState<Record<number, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [focusedSeatId, setFocusedSeatId] = useState<number | undefined>(undefined);
  const inputRefs = useRef(new Map<number, HTMLInputElement>());

  const mySeats = useMemo(
    () => (currentMember ? findSeatsByMemberId(floors, currentMember.id) : []),
    [floors, currentMember],
  );

  const originalGuestNames = useMemo(
    () => Object.fromEntries(mySeats.map((ctx) => [ctx.seat.id, ctx.seat.guestName ?? ''])),
    [mySeats],
  );

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setGuestNames(originalGuestNames);
    }
    setIsOpen(open);
  };

  const dirtySeatIds = useMemo(
    () =>
      Object.keys(guestNames)
        .map(Number)
        .filter((seatId) => guestNames[seatId] !== (originalGuestNames[seatId] ?? '')),
    [guestNames, originalGuestNames],
  );

  const filledCount = Object.values(guestNames).filter((name) => name.trim() !== '').length;
  const totalCount = mySeats.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((filledCount / totalCount) * 100);

  const handleClearAll = () => {
    setGuestNames(Object.fromEntries(mySeats.map((ctx) => [ctx.seat.id, ''])));
  };

  const handleSave = async () => {
    if (dirtySeatIds.length === 0) return;

    const updates: SeatGuestNameUpdate[] = dirtySeatIds.map((seatId) => ({
      seatId,
      guestName: guestNames[seatId],
    }));

    setIsSaving(true);
    try {
      await updateSeatGuestNames({ updates });
      await fetchSeatGuideFloors();
      toast.success('게스트명이 저장되었습니다.');
      setIsOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '게스트명 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="dialog" size="base">
          <IconUserEdit stroke={1.5} />
          게스트명 입력
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader className="gap-1">
          <DialogTitle className={cn(headerTitleClass)}>게스트명 입력</DialogTitle>
          <DialogDescription>배정된 좌석별로 초대할 게스트명을 입력하세요</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-6">
          {/* 좌측: 미리보기 */}
          <div className="flex flex-col">
            {mySeats.length > 0 && (
              <MySeatPreview
                mySeats={mySeats}
                floors={floors}
                currentMemberId={currentMember?.id ?? 0}
                myColor={currentMember?.color ?? '#4f46e5'}
                focusedSeatId={focusedSeatId}
                onSeatClick={(seatId) => {
                  const input = inputRefs.current.get(seatId);
                  if (input) {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    input.focus();
                  }
                }}
              />
            )}
          </div>

          {/* 우측: 입력 리스트 */}
          <div className="flex flex-col gap-y-3">
            <div className="bg-accent flex items-center justify-between rounded-md px-3 py-2 text-xs">
              <span className="text-muted-foreground">
                비워둔 좌석은 티켓에 <span className="text-primary font-semibold">"-"</span>으로
                표시됩니다
              </span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-primary shrink-0 font-medium underline-offset-2 hover:underline"
              >
                전체 비우기
              </button>
            </div>

            <div className="no-scrollbar flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
              {mySeats.map((ctx) => {
                const value = guestNames[ctx.seat.id] ?? '';
                const isFilled = value.trim() !== '';

                return (
                  <div
                    key={ctx.seat.id}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border px-3 py-2',
                      isFilled ? 'bg-accent border-transparent' : 'border-input',
                    )}
                  >
                    <span
                      className={cn(
                        'h-2 w-2 shrink-0 rounded-full',
                        isFilled ? 'bg-primary' : 'border-input border',
                      )}
                    />
                    <div className="flex shrink-0 items-center gap-1 text-xs whitespace-nowrap">
                      <span className="text-muted-foreground">{ctx.floor.name}</span>
                      <span className="text-muted-foreground">{ctx.section.name}</span>
                      <span className="text-muted-foreground">{ctx.row.rowName}열</span>
                      <span className="bg-primary text-text-foreground rounded-md px-1.5 py-0.5 font-semibold">
                        {ctx.seat.seatNumber}
                      </span>
                    </div>
                    <Input
                      ref={(el) => {
                        if (el) inputRefs.current.set(ctx.seat.id, el);
                      }}
                      value={value}
                      placeholder="게스트명 입력"
                      onChange={(e) =>
                        setGuestNames((prev) => ({ ...prev, [ctx.seat.id]: e.target.value }))
                      }
                      onFocus={() => setFocusedSeatId(ctx.seat.id)}
                    />
                  </div>
                );
              })}
        </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-primary text-sm font-medium">
                {filledCount} / {totalCount}석 입력 완료
              </p>
              <div className="bg-accent h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="dialog">닫기</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={dirtySeatIds.length === 0 || isSaving}>
            {isSaving ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
