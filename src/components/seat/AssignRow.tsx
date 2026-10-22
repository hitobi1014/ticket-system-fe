import type { MouseEvent as ReactMouseEvent } from 'react';
import type { Seat, Section } from '@/types';
import { Button } from '@/components/ui/button.tsx';
import useMemberStore from '@/store/memberStore.ts';
import { useRef } from 'react';
import { getContrastTextColor } from '@/lib/uiUtils.ts';
import { cn } from '@/lib/utils.ts';
import { Badge } from '@/components/ui/badge';
import RowGap from '@/components/seat/RowGap.tsx';
import FittedRows from '@/components/seat/FittedRows.tsx';
import { getRowTransformStyle, SEAT_SIZE_PX } from '@/lib/rowLayoutUtils.ts';
import { emptySeatClass, hideSeatClass, seatSectionClass } from '@/constant/styles.ts';

interface AssignRowProps {
  section: Section;
  isBulkEditMode: boolean;
  selectedSeatIds?: Set<number>;
  onSeatClick: (seatId: number) => void;
  /** 일괄 편집 모드 좌석 선택(클릭/드래그). 클릭 토글도 mousedown에서 처리 */
  onSeatMouseDown?: (seat: Seat, e: ReactMouseEvent) => void;
  onSeatMouseEnter?: (seat: Seat, e: ReactMouseEvent) => void;
}

export default function AssignRow({
  section,
  isBulkEditMode,
  onSeatClick,
  onSeatMouseDown,
  onSeatMouseEnter,
  selectedSeatIds = new Set(),
}: AssignRowProps) {
  const { members } = useMemberStore();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const assignedSeatColor = (id: number | null) =>
    members.find((v) => v.id === id)?.color ?? '#f0fdfa';
  const assignedSeatMemberName = (id: number | null) =>
    members.find((v) => v.id === id)?.name ?? '';

  return (
    <div className={seatSectionClass}>
      <div className="flex items-center justify-between text-sm">
        <Badge>{section.name}</Badge>
        <span>{section.rows.flatMap((r) => r.seats).length}석</span>
      </div>
      <FittedRows rows={section.rows}>
      {section.rows.map((row) =>
        row.kind === 'gap' ? (
          <RowGap key={row.id} className="h-10" showLine={false} />
        ) : (
        <div
          key={row.id}
          style={getRowTransformStyle(row.layout, SEAT_SIZE_PX.assign)}
          className="flex w-fit items-center gap-x-1.5"
        >
          <p>{row.rowName}</p>
          {row.seats.map((seat) => {
            const isVisible = seat.visible;

            return (
              // 빈 좌석은 흰 배경, 배정된 좌석은 회원에게 할당된 색상
              //  1. 단건 편집: click → 회원 선택 모달
              //  2. 일괄 편집: mousedown/mouseenter로 선택 (click은 무시)
              <Button
                key={seat.id}
                ref={triggerRef}
                className={cn(
                  emptySeatClass,
                  'h-10 w-10',
                  !isVisible && hideSeatClass,
                  seat.assignedMemberId != null && 'border-0',
                  selectedSeatIds.has(seat.id) && 'border-0 ring-2 ring-red-400 ring-offset-1',
                )}
                variant="outline"
                style={
                  isVisible && seat.assignedMemberId != null
                    ? {
                        backgroundColor: assignedSeatColor(seat.assignedMemberId!),
                        color: getContrastTextColor(assignedSeatColor(seat.assignedMemberId!)),
                      }
                    : undefined
                }
                onClick={() => isVisible && !isBulkEditMode && onSeatClick(seat.id)}
                onMouseDown={isBulkEditMode ? (e) => isVisible && onSeatMouseDown?.(seat, e) : undefined}
                onMouseEnter={
                  isBulkEditMode ? (e) => isVisible && onSeatMouseEnter?.(seat, e) : undefined
                }
              >
                {isVisible && (
                  <div>
                    <p>{seat.seatNumber}</p>
                    <p className="text-xs">{assignedSeatMemberName(seat.assignedMemberId!)}</p>
                  </div>
                )}
              </Button>
            );
          })}
        </div>
        ),
      )}
      </FittedRows>
    </div>
  );
}
