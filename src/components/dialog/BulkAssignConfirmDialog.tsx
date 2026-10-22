import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { SeatGroup } from '@/lib/bulkAssignUtils.ts';
import type { Member } from '@/types';

export type BulkAssignAction = 'assign' | 'cancel';

export interface BulkAssignConfirmDialogProps {
  /** null이면 닫힘 */
  action: BulkAssignAction | null;
  /** 배정 대상 회원 (선택 회원) */
  member: Member | null;
  members: Member[];
  /** 배정: 선택한 좌석 전체 / 취소: 선택한 좌석 중 배정된 좌석 */
  groups: SeatGroup[];
  isSubmitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const formatNumbers = (numbers: number[]) => numbers.join(',');

/** 일괄 배정/배정취소 확인 다이얼로그 (신규 배정과 덮어쓰기 내역을 구분해 안내) */
export default function BulkAssignConfirmDialog({
  action,
  member,
  members,
  groups,
  isSubmitting,
  onConfirm,
  onClose,
}: BulkAssignConfirmDialogProps) {
  const memberName = (id: number | null) => members.find((m) => m.id === id)?.name ?? '알 수 없음';

  const newGroups = groups.filter((g) => g.memberId == null);
  const assignedGroups = groups.filter((g) => g.memberId != null);
  const newCount = newGroups.reduce((sum, g) => sum + g.seatNumbers.length, 0);
  const totalCount = groups.reduce((sum, g) => sum + g.seatNumbers.length, 0);

  return (
    <Dialog open={action != null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-primary text-lg font-semibold">
            {action === 'cancel' ? '배정 취소' : '좌석 배정'}
          </DialogTitle>
          <DialogDescription>
            {action === 'cancel'
              ? `선택한 좌석 ${totalCount}석의 배정을 취소합니다.`
              : `${member?.name} 회원에게 총 ${totalCount}석을 배정합니다.`}
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="no-scrollbar flex max-h-[50vh] flex-col gap-y-3 overflow-y-auto">
          {action === 'assign' && newGroups.length > 0 && (
            <section className="flex flex-col gap-y-1">
              <h4 className="text-primary font-semibold">신규 배정</h4>
              {newGroups.map((g) => (
                <p key={g.sectionLabel}>
                  {g.sectionLabel} {formatNumbers(g.seatNumbers)} 좌석 (총 {g.seatNumbers.length}석)
                </p>
              ))}
              {assignedGroups.length > 0 && <p className="text-secondary">신규 {newCount}석</p>}
            </section>
          )}
          {assignedGroups.length > 0 && (
            <section className="flex flex-col gap-y-1">
              <h4 className="text-danger flex items-center gap-x-1 font-semibold">
                {action === 'assign' && <TriangleAlert size={14} />}
                {action === 'assign' ? '덮어쓰기' : '취소 대상'}
              </h4>
              {assignedGroups.map((g) => (
                <p key={`${g.memberId}-${g.sectionLabel}`}>
                  {memberName(g.memberId)} 회원의 {g.sectionLabel} {formatNumbers(g.seatNumbers)}{' '}
                  좌석 배정을{' '}
                  {action === 'assign'
                    ? `취소하고 ${member?.name} 회원에게 배정됩니다.`
                    : '취소합니다.'}
                </p>
              ))}
            </section>
          )}
        </div>
        <DialogFooter>
          <Button variant="dialog" size="base" onClick={onClose} disabled={isSubmitting}>
            닫기
          </Button>
          <Button variant="dialog" size="base" onClick={onConfirm} disabled={isSubmitting}>
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
