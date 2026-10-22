import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog.tsx';
import type { SyncMemberResponse } from '@/types/member.ts';

interface SyncResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  syncResult: SyncMemberResponse | null;
  onHighlightMembers: (memberIds: number[]) => void;
}

export default function SyncResultDialog({
  open,
  onOpenChange,
  syncResult,
  onHighlightMembers,
}: SyncResultDialogProps) {
  if (!syncResult) return null;

  const { stats, skippedAllocations } = syncResult;
  const hasSkipped = skippedAllocations && skippedAllocations.length > 0;

  const handleConfirm = () => {
    if (hasSkipped && skippedAllocations) {
      const skippedMemberIds = skippedAllocations.map((s) => s.memberId);
      onHighlightMembers(skippedMemberIds);
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="text-primary">
          <AlertDialogTitle>
            {hasSkipped ? '⚠️ 동기화 완료 (일부 스킵)' : '✅ 동기화 완료'}
          </AlertDialogTitle>

          {/* 정상 처리 결과 */}
          <AlertDialogDescription className="text-secondary">
            <div className="space-y-1">
              <p>추가: {stats.inserted}건</p>
              <p>수정: {stats.updated}건</p>
              <p>삭제: {stats.deleted}건</p>
              <p className="font-semibold">총 처리: {stats.total}건</p>
            </div>
          </AlertDialogDescription>

          {/* 스킵된 항목 */}
          {hasSkipped && (
            <>
              <AlertDialogDescription className="text-destructive mt-4">
                <p className="mb-2 font-bold">
                  배정 티켓 업데이트 스킵 ({skippedAllocations.length}건)
                </p>
              </AlertDialogDescription>
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-md p-3">
                {skippedAllocations.map((skip) => (
                  <div key={skip.memberId} className="text-secondary text-sm">
                    <p className="font-semibold">
                      {skip.name} ({skip.instrumentAbbr})
                    </p>
                    <p className="text-destructive text-xs">{skip.reason}</p>
                  </div>
                ))}
              </div>
              <AlertDialogDescription className="text-secondary mt-2 text-xs">
                💡 확인 버튼을 누르면 스킵된 회원이 빨간색으로 표시됩니다.
              </AlertDialogDescription>
            </>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogAction variant="outline" size="base" onClick={handleConfirm}>
            확인
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
