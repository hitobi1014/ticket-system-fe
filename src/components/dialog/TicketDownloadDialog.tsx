import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Ticket from '@/components/Ticket.tsx';

interface TicketDownloadDialogProps {
  id: number;
}

export default function TicketDownloadDialog({ id }: TicketDownloadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>내 티켓 다운로드</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>공연 티켓 다운로드</DialogHeader>
        <DialogDescription>본인 티켓만 다운로드 가능합니다.</DialogDescription>
        <div>
          <p>미리보기</p>
          <Ticket />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="dialog">닫기</Button>
          </DialogClose>
          <Button>다운로드</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
