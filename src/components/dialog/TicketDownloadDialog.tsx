import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Ticket from '@/components/Ticket.tsx';
import { cn } from '@/lib/utils.ts';
import { headerTitleClass } from '@/constant/styles.ts';
import useVenueStore from '@/store/venueStore.ts';
import type { AssignedSeatInfo, Member, MemberWithSeats } from '@/types';

interface TicketDownloadDialogProps {
  memberWithSeats: MemberWithSeats;
}

function toTicketProps(
  member: Member,
  seat: AssignedSeatInfo,
  venueName: string,
  performanceDateTime: string,
) {
  return {
    venueName,
    performanceDateTime,
    floorName: seat.floorName,
    sectionName: seat.sectionName,
    rowName: seat.rowName,
    seatNumber: seat.seatNumber,
    inviterName: member.name,
    guestName: seat.guestName,
    memo: seat.memo,
  };
}

export default function TicketDownloadDialog({ memberWithSeats }: TicketDownloadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const ticketRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const { venue } = useVenueStore();
  const { member, seats } = memberWithSeats;
  const venueName = venue?.name ?? '';
  const performanceDateTime = venue?.performanceDate ?? '';

  const handleExport = async () => {
    if (isExporting || seats.length === 0) return;
    setIsExporting(true);
    try {
      await document.fonts.ready;

      if (seats.length === 1) {
        const el = ticketRefs.current[seats[0].seatId];
        if (!el) throw new Error('티켓을 찾을 수 없습니다.');
        const dataUrl = await toPng(el, { pixelRatio: 2 });
        const blob = await (await fetch(dataUrl)).blob();
        saveAs(blob, `${member.name}_ticket.png`);
      } else {
        const zip = new JSZip();
        for (const [index, seat] of seats.entries()) {
          const el = ticketRefs.current[seat.seatId];
          if (!el) continue;
          const dataUrl = await toPng(el, { pixelRatio: 2 });
          const blob = await (await fetch(dataUrl)).blob();
          zip.file(`${member.name}_ticket_${index + 1}.png`, blob);
        }
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `${member.name}_tickets.zip`);
      }
      toast.success('티켓 다운로드가 완료되었습니다.');
      setIsOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '티켓 다운로드에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const [previewSeat, ...hiddenSeats] = seats;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>내 티켓 다운로드</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className={cn(headerTitleClass)}>공연 티켓 다운로드</DialogHeader>
        <DialogDescription>본인 티켓만 다운로드 가능합니다.</DialogDescription>

        <div>
          <p className="text-primary text-base font-semibold">미리보기</p>
          {previewSeat && (
            <Ticket
              ref={(el) => {
                ticketRefs.current[previewSeat.seatId] = el;
              }}
              {...toTicketProps(member, previewSeat, venueName, performanceDateTime)}
            />
          )}
        </div>

        {/* PNG 캡처 전용: 화면 밖에 렌더링 (display:none 금지 — 캡처 불가) */}
        {hiddenSeats.length > 0 && (
          <div className="fixed top-0 left-[-9999px] w-96" aria-hidden>
            {hiddenSeats.map((seat) => (
              <Ticket
                key={seat.seatId}
                ref={(el) => {
                  ticketRefs.current[seat.seatId] = el;
                }}
                {...toTicketProps(member, seat, venueName, performanceDateTime)}
              />
            ))}
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="dialog">닫기</Button>
          </DialogClose>
          <Button onClick={handleExport} disabled={isExporting || seats.length === 0}>
            {isExporting ? '다운로드 중...' : '다운로드'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
