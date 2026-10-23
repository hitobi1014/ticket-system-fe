import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Ticket from '@/components/Ticket.tsx';
import { cn } from '@/lib/utils.ts';
import { MOBILE_MEDIA_QUERY } from '@/lib/zoomUtils.ts';
import { useIsMobile } from '@/hooks/use-mobile.ts';
import { isIOSDevice } from '@/lib/uiUtils.ts';
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

/** 다이얼로그 제목/설명/푸터/여백이 차지하는 높이(px) — 미리보기에 쓸 수 있는 높이 계산용 */
const PREVIEW_RESERVED_PX = 200;
const MIN_PREVIEW_SCALE = 0.5;

/**
 * 티켓 미리보기: 모바일에서 화면 높이보다 크면 비율을 줄여 한 화면에 맞춘다.
 * 너무 작아지지 않도록 최소 배율을 두고, 그래도 넘치면 부모 스크롤에 맡긴다.
 */
function ScaledPreview({ children }: { children: ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<{ scale: number; height: number } | null>(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const update = () => {
      const natural = el.offsetHeight; // transform은 offsetHeight에 영향을 주지 않는다
      const available = window.innerHeight * 0.9 - PREVIEW_RESERVED_PX;
      const isMobile = window.matchMedia(MOBILE_MEDIA_QUERY).matches;
      if (!isMobile || natural === 0 || natural <= available) {
        setFit(null);
        return;
      }
      setFit({ scale: Math.max(available / natural, MIN_PREVIEW_SCALE), height: natural });
    };

    const observer = new ResizeObserver(update); // 관찰 시작 직후에도 한 번 호출된다
    observer.observe(el);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div style={fit ? { height: fit.height * fit.scale } : undefined}>
      <div
        ref={innerRef}
        style={
          fit ? { transform: `scale(${fit.scale})`, transformOrigin: 'top center' } : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}

export default function TicketDownloadDialog({ memberWithSeats }: TicketDownloadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const ticketRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const { venue } = useVenueStore();
  const { member, seats } = memberWithSeats;
  const venueName = venue?.name ?? '';
  const performanceAt = venue?.performanceAt ?? '';

  // 티켓 PNG는 다이얼로그를 열 때 미리 만들어 둔다.
  // 클릭 후에 만들면 시간이 걸려 사용자 제스처가 만료되고 navigator.share가 거부된다(NotAllowedError)
  const ticketKey = JSON.stringify([
    member.id,
    member.name,
    venueName,
    performanceAt,
    seats.map((s) => [
      s.seatId,
      s.guestName,
      s.memo,
      s.floorName,
      s.sectionName,
      s.rowName,
      s.seatNumber,
    ]),
  ]);
  const [prepared, setPrepared] = useState<{ key: string; files: File[] } | null>(null);
  const files = prepared?.key === ticketKey ? prepared.files : null;
  const isPreparing = seats.length > 0 && files === null;
  const [progress, setProgress] = useState(0); // 준비 완료한 티켓 수 (장수가 많을 때 진행 표시)
  const isMobile = useIsMobile() === true;
  const isIOS = isMobile && isIOSDevice();

  // 부모가 다시 렌더링돼 seats 참조가 바뀌어도 재생성하지 않도록 내용 키(ticketKey)로만 재실행
  const latestRef = useRef({ seats, memberName: member.name });
  useEffect(() => {
    latestRef.current = { seats, memberName: member.name };
  });

  useEffect(() => {
    if (!isOpen) return;
    const { seats, memberName } = latestRef.current;
    if (seats.length === 0) return;
    let cancelled = false;

    const prepare = async () => {
      try {
        await document.fonts.ready;
        setProgress(0);
        const result: File[] = [];
        for (const [index, seat] of seats.entries()) {
          const el = ticketRefs.current[seat.seatId];
          if (!el) continue;
          const dataUrl = await toPng(el, { pixelRatio: 2 });
          const blob = await (await fetch(dataUrl)).blob();
          const fileName =
            seats.length === 1
              ? `${memberName}_ticket.png`
              : `${memberName}_ticket_${index + 1}.png`;
          result.push(new File([blob], fileName, { type: 'image/png' }));
          if (!cancelled) setProgress(result.length);
        }
        if (!cancelled) setPrepared({ key: ticketKey, files: result });
      } catch (e) {
        console.error(e);
        if (!cancelled) setPrepared({ key: ticketKey, files: [] }); // 클릭 시 오류 안내
      }
    };
    void prepare();

    return () => {
      cancelled = true;
    };
  }, [isOpen, ticketKey]);

  const finish = (message: string) => {
    toast.success(message);
    setIsOpen(false);
  };

  /** 파일로 저장 (안드로이드: 기기 '다운로드' 폴더 → 갤러리의 '다운로드' 앨범) */
  const saveFiles = async (list: File[]) => {
    for (const [index, file] of list.entries()) {
      if (index > 0) await new Promise((resolve) => setTimeout(resolve, 300)); // 연속 다운로드 누락 방지
      saveAs(file, file.name);
    }
  };

  /**
   * 공유 시트로 내보내기 (iOS: '이미지 N개 저장'으로 사진 앱에 저장 / 안드로이드: 앱으로 공유)
   * share는 클릭 직후 제스처가 유효할 때만 허용되므로 호출 앞에 await를 두지 않는다.
   * @return 완료 여부 (사용자가 공유를 취소하면 false)
   */
  const shareFiles = async (list: File[]) => {
    if (!navigator.canShare?.({ files: list })) {
      await saveFiles(list); // 공유 미지원: 파일 다운로드로 대체
      return true;
    }
    try {
      await navigator.share({ files: list });
      return true;
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return false; // 사용자가 공유 취소
      if (!(e instanceof DOMException && e.name === 'NotAllowedError')) throw e;
      await saveFiles(list); // 공유 거부: 파일 다운로드로 대체
      return true;
    }
  };

  /** mode: PC는 항상 'save'(1장 PNG / 여러 장 zip), 모바일은 'save'(파일 저장) 또는 'share'(공유 시트) */
  const handleExport = async (mode: 'save' | 'share') => {
    if (isExporting || files === null) return;
    if (files.length === 0) {
      toast.error('티켓 이미지를 만들지 못했습니다. 다시 열어 시도해주세요.');
      return;
    }
    setIsExporting(true);
    try {
      if (isMobile && mode === 'share') {
        if (await shareFiles(files)) finish('티켓 저장/공유가 완료되었습니다.');
      } else if (isMobile || files.length === 1) {
        await saveFiles(files);
        finish(
          isMobile
            ? "티켓을 저장했습니다. 갤러리의 '다운로드' 앨범에서 확인하세요."
            : '티켓 다운로드가 완료되었습니다.',
        );
      } else {
        const zip = new JSZip();
        for (const file of files) zip.file(file.name, file);
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `${member.name}_tickets.zip`);
        finish('티켓 다운로드가 완료되었습니다.');
      }
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
      <DialogContent className="flex max-h-[90dvh] flex-col gap-3 overflow-hidden">
        <DialogHeader className={cn(headerTitleClass, 'shrink-0')}>공연 티켓 다운로드</DialogHeader>
        <DialogDescription className="shrink-0">
          본인 티켓만 다운로드 가능합니다.
          {isIOS &&
            " 공유 창에서 '이미지 저장'을 선택하면 사진 앱에 저장되고, 앱을 선택해 공유할 수도 있습니다."}
          {isMobile &&
            !isIOS &&
            " 저장은 갤러리의 '다운로드' 앨범에 이미지로 저장되고, 공유는 앱을 선택해 보냅니다."}
        </DialogDescription>

        {/* 미리보기만 스크롤: 제목과 푸터(다운로드 버튼)는 항상 보인다 */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <p className="text-primary text-base font-semibold">미리보기</p>
          {previewSeat && (
            <ScaledPreview>
              <Ticket {...toTicketProps(member, previewSeat, venueName, performanceAt)} />
            </ScaledPreview>
          )}
          {seats.length === 0 && (
            <div>
              <p>배정된 좌석이 없습니다</p>
              <p>관리자에게 문의하세요</p>
            </div>
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
        ) : null}

        <DialogFooter className="shrink-0">
          <DialogClose asChild>
            <Button variant="dialog">닫기</Button>
          </DialogClose>
          {isMobile ? (
            <>
              {/* iOS는 공유 시트 하나로 사진 앱 저장과 공유를 모두 할 수 있다 */}
              {!isIOS && (
                <Button
                  onClick={() => handleExport('save')}
                  disabled={isExporting || isPreparing || seats.length === 0}
                >
                  {isPreparing
                    ? `이미지 준비 중 (${progress}/${seats.length})`
                    : '사진 앨범에 저장'}
                </Button>
              )}
              <Button
                onClick={() => handleExport('share')}
                disabled={isExporting || isPreparing || seats.length === 0}
              >
                {isPreparing && isIOS
                  ? `이미지 준비 중 (${progress}/${seats.length})`
                  : isIOS
                    ? '이미지 저장 / 공유'
                    : '공유'}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => handleExport('save')}
              disabled={isExporting || isPreparing || seats.length === 0}
            >
              {isPreparing
                ? `이미지 준비 중 (${progress}/${seats.length})`
                : isExporting
                  ? '다운로드 중...'
                  : '다운로드'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
