import { Button } from '@/components/ui/button';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// 모달에서 일괄/단건 회원 좌석 할당 가능하도록

interface AssignMemberModalProps {
  seatIds?: Set<number>;
}

export function AssignMemberModal({ seatIds }: AssignMemberModalProps) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>모달제목</DialogTitle>
        <DialogDescription>모달 설명</DialogDescription>
      </DialogHeader>
      <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
        <p>모달 내용</p>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Close</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
