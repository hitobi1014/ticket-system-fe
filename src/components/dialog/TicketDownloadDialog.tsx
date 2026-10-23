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
import { MOBILE_MEDIA_QUERY } from '@/lib/zoomUtils.ts';
import { formatPlayerName, getDisplayMemberName } from '@/lib/formatUtils.ts';
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
  performanceAt: string,
) {
  return {
    venueName,
    performanceAt,
    floorName: seat.floorName,
    sectionName: seat.sectionName,
    rowName: seat.rowName,
    seatNumber: seat.seatNumber,
    inviterName: formatPlayerName(getDisplayMemberName(member.name), member.instrument?.name),
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
  const performanceAt = venue?.performanceAt ?? '';

  const handleExport = async () => {
    if (isExporting || seats.length === 0) return;
    setIsExporting(true);
    try {
      await document.fonts.ready;

      // 티켓별 PNG 생성
      const files: File[] = [];
      for (const [index, seat] of seats.entries()) {
        const el = ticketRefs.current[seat.seatId];
        if (!el) continue;
        const dataUrl = await toPng(el, { pixelRatio: 2 });
        const blob = await (await fetch(dataUrl)).blob();
        const fileName =
          seats.length === 1
            ? `${member.name}_ticket.png`
            : `${member.name}_ticket_${index + 1}.png`;
        files.push(new File([blob], fileName, { type: 'image/png' }));
      }
      if (files.length === 0) throw new Error('티켓을 찾을 수 없습니다.');

      if (files.length === 1) {
        saveAs(files[0], files[0].name);
      } else if (window.matchMedia(MOBILE_MEDIA_QUERY).matches) {
        // 모바일: zip 대신 이미지로 저장. 공유 시트(이미지 저장)를 우선 쓰고, 미지원이면 개별 다운로드
        if (navigator.canShare?.({ files })) {
          try {
            await navigator.share({ files });
          } catch (e) {
            if (e instanceof DOMException && e.name === 'AbortError') return; // 사용자가 공유 취소
            throw e;
          }
        } else {
          for (const file of files) saveAs(file, file.name);
        }
      } else {
        const zip = new JSZip();
        for (const file of files) zip.file(file.name, file);
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

  const previewSeat = seats[0];

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
            <Ticket {...toTicketProps(member, previewSeat, venueName, performanceAt)} />
          )}
        </div>

        {/* PNG 캡처 전용: 화면 밖 고정 너비(w-96)에 모든 티켓을 렌더링해 이미지 크기를 통일
            (미리보기는 다이얼로그 너비에 따라 크기가 달라지므로 캡처 대상에서 제외)
            display:none 금지 — 캡처 불가 */}
        {seats.length > 0 ? (
          <div className="fixed top-0 left-[-9999px] w-96" aria-hidden>
            {seats.map((seat) => (
              <Ticket
                key={seat.seatId}
                ref={(el) => {
                  ticketRefs.current[seat.seatId] = el;
                }}
                {...toTicketProps(member, seat, venueName, performanceAt)}
              />
            ))}
          </div>
        ) : (
          <div>
            <p>배정된 좌석이 없습니다</p>
            <p>관리자에게 문의하세요</p>
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
