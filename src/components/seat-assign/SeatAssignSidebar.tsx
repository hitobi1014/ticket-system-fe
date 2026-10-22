import useFloorStore from '@/store/floorStore.ts';
import useMemberStore from '@/store/memberStore.ts';
import { Separator } from '@/components/ui/separator.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { getContrastTextColor } from '@/lib/uiUtils.ts';
import { getAssignableMember, getRemainTickets } from '@/lib/seatUtils.ts';
import type { Member } from '@/types';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useScrollHint } from '@/hooks/use-scroll-hint.ts';
import { cn } from '@/lib/utils.ts';

interface MemberTicketRowProps {
  member: Member;
  remainTickets: number;
  isSelected: boolean;
  onSelect?: (memberId: number) => void;
}

/** 회원별 잔여 티켓 행. onSelect가 있으면 일괄 편집 모드 진입점으로 클릭 가능 */
function MemberTicketRow({ member, remainTickets, isSelected, onSelect }: MemberTicketRowProps) {
  const isDone = remainTickets === 0;

  return (
    <button
      type="button"
      disabled={!onSelect}
      onClick={() => onSelect?.(member.id)}
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-md px-1 py-0.5 text-left',
        onSelect && 'hover:bg-accent cursor-pointer',
        isSelected && 'bg-accent ring-primary ring-1',
        isDone && 'opacity-60',
      )}
    >
      <div className="text-primary flex items-center gap-2">
        <p className="w-6 text-xs">{member.seq}</p>
        <p
          className="w-8 rounded px-1 py-0.5 text-center text-xs font-bold"
          style={
            member.color != null
              ? {
                  backgroundColor: member.color,
                  color: getContrastTextColor(member.color ?? '#ffffff'),
                }
              : undefined
          }
        >
          {member.instrument.abbr}
        </p>
        <p className={cn('text-primary text-sm', isDone && 'text-mist-500')}>{member.name}</p>
      </div>
      <p className="min-w-6 rounded px-2 py-0.5 text-center text-sm">{remainTickets}</p>
    </button>
  );
}

export interface SeatAssignSidebarProps {
  /** 일괄 편집 모드로 선택된 회원 */
  selectedMemberId: number | null;
  /** 잔여 티켓이 있는 회원 클릭 (같은 회원을 다시 클릭하면 선택 해제는 호출 측에서 처리) */
  onSelectMember: (memberId: number) => void;
}

export default function SeatAssignSidebar({
  selectedMemberId,
  onSelectMember,
}: SeatAssignSidebarProps) {
  const { getRemainSeatCount } = useFloorStore();
  const { members, getAssignedCountMap } = useMemberStore();

  const assignedCountMap = getAssignedCountMap();

  // 정렬: 잔여 있는 회원(seq순) → 잔여 0인 회원(seq순)
  const sortedMembers = getAssignableMember(members, assignedCountMap);
  const activeMembers = sortedMembers.filter((m) => getRemainTickets(m, assignedCountMap) > 0);
  const doneMembers = sortedMembers.filter((m) => getRemainTickets(m, assignedCountMap) === 0);

  const { scrollContainerRef, canScrollUp, canScrollDown } = useScrollHint([sortedMembers.length]);

  const scrollClass = cn('pointer-events-none absolute inset-x-0 flex justify-center');
  const scrollIconClass = 'bg-primary text-text-foreground rounded-full p-0.5 shadow';

  return (
    <div className="bg-card border-accent flex h-full flex-none flex-col border-l px-6 py-3">
      <header className="shrink-0 rounded-lg py-2">
        <p className="text-secondary">잔여 좌석</p>
        <p className="text-primary font-bold">{getRemainSeatCount()}</p>
      </header>
      <div className="mt-2 flex min-h-0 flex-1 flex-col gap-y-2">
        <h3 className="text-secondary shrink-0 text-sm">회원별 잔여 티켓</h3>
        <Separator className="shrink-0" />
        <div className="relative min-h-0 flex-1">
          <div
            ref={scrollContainerRef}
            className="no-scrollbar flex h-full flex-col gap-y-1.5 overflow-y-auto"
          >
            {activeMembers.map((member) => (
              <MemberTicketRow
                key={member.id}
                member={member}
                remainTickets={getRemainTickets(member, assignedCountMap)}
                isSelected={selectedMemberId === member.id}
                onSelect={onSelectMember}
              />
            ))}
            {doneMembers.length > 0 && (
              <>
                {activeMembers.length > 0 && <Separator className="my-1 shrink-0" />}
                <Badge variant="secondary" className="shrink-0 self-start">
                  배정 완료
                </Badge>
                {doneMembers.map((member) => (
                  <MemberTicketRow
                    key={member.id}
                    member={member}
                    remainTickets={0}
                    isSelected={false}
                  />
                ))}
              </>
            )}
          </div>
          {canScrollUp && (
            <div className={cn(scrollClass, 'top-0')}>
              <div className={scrollIconClass}>
                <IconChevronUp size={14} stroke={2} />
              </div>
            </div>
          )}
          {canScrollDown && (
            <div className={cn(scrollClass, 'bottom-0')}>
              <div className={scrollIconClass}>
                <IconChevronDown size={14} stroke={2} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
