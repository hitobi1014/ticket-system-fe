import useFloorStore from '@/store/floorStore.ts';
import useMemberStore from '@/store/memberStore.ts';
import { Separator } from '@/components/ui/separator.tsx';
import { getContrastTextColor } from '@/lib/uiUtils.ts';
import { clsx } from 'clsx';
import { getAssignableMember, getRemainTickets } from '@/lib/seatUtils.ts';
import type { Member } from '@/types';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useScrollHint } from '@/hooks/use-scroll-hint.ts';

export default function SeatAssignSidebar() {
  const { getRemainSeatCount } = useFloorStore();
  const { members, getAssignedCountMap } = useMemberStore();

  const assignedCountMap = getAssignedCountMap();

  const isRemainTicketZero = (member: Member): boolean => {
    return getRemainTickets(member, assignedCountMap) === 0;
  };

  const sortedMemberFromRemainSeat = getAssignableMember(members, assignedCountMap);

  const { scrollContainerRef, canScrollUp, canScrollDown } = useScrollHint([
    sortedMemberFromRemainSeat.length,
  ]);

  return (
    <div className="bg-card border-accent p-y flex h-full w-44 flex-none flex-col border-l pl-4">
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
            {sortedMemberFromRemainSeat.map((member) => (
              <div key={member.id} className="flex items-center justify-between gap-2">
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
                  <p
                    className={clsx('text-primary text-sm', {
                      'text-mist-500': isRemainTicketZero(member),
                    })}
                  >
                    {member.name}
                  </p>
                </div>
                <p
                  className={clsx('min-w-6 rounded px-2 py-0.5 text-center text-sm', {
                    'bg-destructive text-danger': isRemainTicketZero(member),
                    'bg-secondary text-primary': !isRemainTicketZero(member),
                  })}
                >
                  {getRemainTickets(member, assignedCountMap)}
                </p>
              </div>
            ))}
          </div>
          {canScrollUp && (
            <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
              <div className="bg-secondary text-secondary rounded-full p-0.5 shadow">
                <IconChevronUp size={14} stroke={2} />
              </div>
            </div>
          )}
          {canScrollDown && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
              <div className="bg-secondary text-secondary rounded-full p-0.5 shadow">
                <IconChevronDown size={14} stroke={2} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
