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
      <AlertDialogContent className="bg-surface-primary sm:max-w-md">
        <AlertDialogHeader className="text-content-primary">
          <AlertDialogTitle>
            {hasSkipped ? '⚠️ 동기화 완료 (일부 스킵)' : '✅ 동기화 완료'}
          </AlertDialogTitle>

          {/* 정상 처리 결과 */}
          <AlertDialogDescription className="text-content-secondary">
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
              <AlertDialogDescription className="text-surface-danger mt-4">
                <p className="font-bold mb-2">
                  배정 티켓 업데이트 스킵 ({skippedAllocations.length}건)
                </p>
              </AlertDialogDescription>
              <div className="max-h-48 overflow-y-auto space-y-2 bg-surface-secondary p-3 rounded-md">
                {skippedAllocations.map((skip) => (
                  <div key={skip.memberId} className="text-sm text-content-secondary">
                    <p className="font-semibold">
                      {skip.name} ({skip.instrumentAbbr})
                    </p>
                    <p className="text-xs text-surface-danger">{skip.reason}</p>
                  </div>
                ))}
              </div>
              <AlertDialogDescription className="text-content-secondary text-xs mt-2">
                💡 확인 버튼을 누르면 스킵된 회원이 빨간색으로 표시됩니다.
              </AlertDialogDescription>
            </>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter className="bg-surface-primary">
          <AlertDialogAction variant="primary" size="base" onClick={handleConfirm}>
            확인
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
