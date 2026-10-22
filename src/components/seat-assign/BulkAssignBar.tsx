import { IconX } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';

export interface BulkAssignBarProps {
  memberName: string;
  /** 현재 잔여 티켓 / 배정 완료 티켓 / 배정 티켓 */
  remainTickets: number;
  assignedTickets: number;
  allocatedTickets: number;
  selectedCount: number;
  /** 선택한 좌석 중 이미 배정된 좌석 수 (덮어쓰기 대상) */
  overwriteCount: number;
  onAssign: () => void;
  onCancelAssign: () => void;
  onExit: () => void;
}

/** 일괄 편집 모드 상단 바: 선택 회원/티켓 현황과 배정·배정취소·모드 종료 */
export default function BulkAssignBar({
  memberName,
  remainTickets,
  assignedTickets,
  allocatedTickets,
  selectedCount,
  overwriteCount,
  onAssign,
  onCancelAssign,
  onExit,
}: BulkAssignBarProps) {
  return (
    <div
      data-tour="bulk-bar"
      className="bg-card flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-md px-4 py-2 text-sm"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <Badge>{memberName}</Badge>
        <span>
          잔여 {remainTickets} → {remainTickets - selectedCount}
        </span>
        <span className="text-secondary">
          배정 완료 {assignedTickets} / 배정 티켓 {allocatedTickets}
        </span>
        <span>
          선택 {selectedCount}석{overwriteCount > 0 && ` (덮어쓰기 ${overwriteCount}석)`}
        </span>
        <span data-tour="bulk-shortcut" className="text-secondary text-xs">
          Shift: 덮어쓰기 · Space: 화면 이동
        </span>
      </div>
      <div className="flex items-center gap-x-2">
        {overwriteCount > 0 && (
          <Button variant="cancel" size="base" onClick={onCancelAssign}>
            배정취소 ({overwriteCount}석)
          </Button>
        )}
        <Button size="base" onClick={onAssign} disabled={selectedCount === 0}>
          배정
        </Button>
        <Button variant="dialog" size="base" onClick={onExit}>
          <IconX stroke={2} />
          선택 해제
        </Button>
      </div>
    </div>
  );
}
