import { useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils.ts';
import { headerTitleClass } from '@/constant/styles.ts';
import useFloorStore from '@/store/floorStore.ts';
import type { CreateFloorRequest } from '@/types';

export interface AddFloorDialogProps {
  /** 층 추가 성공 시 새로 생성된 층 id 전달 */
  onAdded: (floorId: number) => void;
}

export default function AddFloorDialog({ onAdded }: AddFloorDialogProps) {
  const addFloor = useFloorStore((state) => state.addFloor);

  const [isOpen, setIsOpen] = useState(false);
  const [floorName, setFloorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // state는 다음 렌더에 반영되므로, 같은 틱에 연속 호출되는 경우를 막기 위해 ref로 동기 가드
  const submittingRef = useRef(false);

  const handleAddFloor = async () => {
    const name = floorName.trim();
    if (!name || submittingRef.current) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    const req: CreateFloorRequest = { name };
    try {
      const savedFloor = await addFloor(req);
      onAdded(savedFloor.id);
      setFloorName('');
      setIsOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '층 추가에 실패했습니다.');
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="base">
          층 추가
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className={cn(headerTitleClass)}>층 추가</DialogHeader>
        <DialogDescription>층 이름을 입력하세요</DialogDescription>
        <Input
          type="text"
          aria-label="input-floor"
          onChange={(e) => setFloorName(e.target.value)}
          onKeyDown={(e) => {
            // 한글 IME 조합 중 Enter는 keydown이 2번 발생하므로 조합 확정 이벤트는 무시
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              void handleAddFloor();
            }
          }}
          value={floorName}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="dialog">닫기</Button>
          </DialogClose>
          <Button
            variant="dialog"
            onClick={handleAddFloor}
            disabled={!floorName.trim() || isSubmitting}
          >
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
