import { IconBrandInstagram } from '@tabler/icons-react';

export interface TicketProps {
  ticketNo?: string; // ex) A-014579, 없으면 상단 표기 생략
  venueName: string;
  performanceDateTime: string;
  floorName: string;
  sectionName: string;
  rowName: string;
  seatNumber: number;
  inviterName: string; // 초대자명 = 배정 회원명 (member.name), 필수
  guestName?: string; // 초대받는 분, 추후 Seat에 필드 추가 후 연결 예정 — 현재는 옵션
  memo?: string;
  ref?: React.Ref<HTMLDivElement>;
}

export default function Ticket({
  ticketNo,
  venueName,
  performanceDateTime,
  floorName,
  sectionName,
  rowName,
  seatNumber,
  inviterName,
  guestName,
  ref,
}: TicketProps) {
  return (
    <div
      ref={ref}
      className="bg-primary text-text-foreground w-full max-w-sm overflow-hidden rounded-3xl shadow-lg"
    >
      {/*상단*/}
      <section className="flex flex-col gap-y-8 px-6 pt-6 pb-10">
        <header className="flex flex-col gap-y-4">
          <div className="flex items-center justify-between">
            <div className="text-primary flex size-8 items-center justify-center rounded-md bg-amber-400">
              <IconBrandInstagram stroke={2} size={18} />
            </div>
            {ticketNo && <p className="text-text-foreground/50 text-xs">NO. {ticketNo}</p>}
          </div>
          <div className="flex flex-col gap-y-1">
            <p className="text-base font-bold">{venueName}</p>
            <p className="text-text-foreground/50 text-xs">{performanceDateTime}</p>
          </div>
        </header>
        <div className="flex flex-col gap-y-2">
          <p className="text-xs font-semibold tracking-widest text-amber-400">INVITATION</p>
          <p className="text-text-foreground/70 text-sm">아래 연주자가 당신을 공연에 초대합니다</p>
          <p className="text-lg font-bold">{inviterName}</p>
        </div>
        <div className="flex flex-col gap-y-1">
          <p className="text-text-foreground/50 text-xs">초대받는 분</p>
          <p className="text-lg font-bold">{guestName ? `${guestName} 님` : '-'}</p>
        </div>
      </section>

      {/*절취선*/}
      <div className="relative">
        <div className="bg-popover absolute top-1/2 left-0 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full" />
        <div className="bg-popover absolute top-1/2 right-0 size-6 translate-x-1/2 -translate-y-1/2 rounded-full" />
        <div className="border-text-foreground/20 mx-6 border-t-2 border-dashed" />
      </div>

      {/*하단*/}
      <section className="ticket-bottom-bg flex flex-col gap-y-4 px-6 pt-8 pb-8">
        <header className="grid grid-cols-4 gap-x-2">
          <div className="flex flex-col gap-y-1">
            <p className="text-text-foreground/50 text-base">층</p>
            <p className="text-2xl font-bold">{floorName}</p>
          </div>
          <div className="flex flex-col gap-y-1">
            <p className="text-text-foreground/50 text-base">구역</p>
            <p className="text-2xl font-bold">{sectionName}</p>
          </div>
          <div className="flex flex-col gap-y-1">
            <p className="text-text-foreground/50 text-base">열</p>
            <p className="text-2xl font-bold">{rowName}</p>
          </div>
          <div className="flex flex-col gap-y-1">
            <p className="text-text-foreground/50 text-base">좌석</p>
            <p className="text-2xl font-bold">{seatNumber}</p>
          </div>
        </header>
        <div className="bg-text-foreground/5 flex flex-col items-center gap-y-1 rounded-2xl py-6">
          <p className="text-xs font-semibold tracking-widest text-amber-400">SEAT NUMBER</p>
          <p className="text-5xl font-bold text-amber-400">{seatNumber}</p>
        </div>
      </section>
    </div>
  );
}
