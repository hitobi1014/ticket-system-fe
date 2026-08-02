import { IconBrandInstagram } from '@tabler/icons-react';
import { Separator } from '@/components/ui/separator';

export default function Ticket() {
  return (
    <div className="text-text-foreground">
      {/*상단*/}
      <section className="bg-primary/90">
        <header>
          <div className="flex items-center justify-between gap-x-2">
            <IconBrandInstagram stroke={2} />
            <p>NO. A-014579</p>
          </div>
          <div>
            <p>예술의 전당 콘서트홀</p>
            <p>2026.08.14 (금) 19:30</p>
          </div>
        </header>
        <div>
          <p>INVITATION</p>
          <p>아래 연주자가 당신을 공연에 초대합니다</p>
          <p>유태환</p>
        </div>
        <div>
          <p>초대받는 분</p>
          <p>김민준 님</p>
        </div>
      </section>
      <Separator />
      {/*하단*/}
      <section className="bg-primary">
        <header>
          <div>
            <p>층</p>
            <p>2F</p>
          </div>
          <div>
            <p>구역</p>
            <p>나구역</p>
          </div>
          <div>
            <p>열</p>
            <p>C</p>
          </div>
          <div>
            <p>좌석</p>
            <p>14</p>
          </div>
        </header>
        <div className="flex flex-col">
          <p>SEAT NUMBER</p>
          <p>14</p>
        </div>
      </section>
    </div>
  );
}
