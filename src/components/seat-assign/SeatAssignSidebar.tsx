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
    <div className="w-44 flex flex-col h-full border-l border-surface-accent pl-4 p-y">
      <div className="bg-surface-secondary rounded-lg pl-3 py-2 shrink-0">
        <h5 className="text-content-secondary">잔여 좌석</h5>
        <h3 className="text-content-primary font-bold">{getRemainSeatCount()}</h3>
      </div>
      <div className="flex flex-col flex-1 gap-y-2 mt-2 min-h-0">
        <h3 className="text-content-secondary text-sm shrink-0">회원별 잔여 티켓</h3>
        <Separator className="shrink-0" />
        <div className="relative flex-1 min-h-0">
          <div
            ref={scrollContainerRef}
            className="flex flex-col h-full no-scrollbar overflow-y-auto gap-y-1.5"
          >
            {sortedMemberFromRemainSeat.map((member) => (
              <div key={member.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-content-primary">
                  <p className="w-6 text-xs">{member.seq}</p>
                  <p
                    className="w-8  text-center text-xs  px-1 py-0.5 rounded font-bold"
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
                    className={clsx('text-sm text-content-primary', {
                      'text-mist-500': isRemainTicketZero(member),
                    })}
                  >
                    {member.name}
                  </p>
                </div>
                <p
                  className={clsx('px-2 py-0.5 rounded text-sm min-w-6 text-center', {
                    'bg-surface-danger text-content-danger': isRemainTicketZero(member),
                    'bg-surface-secondary text-content-primary': !isRemainTicketZero(member),
                  })}
                >
                  {getRemainTickets(member, assignedCountMap)}
                </p>
              </div>
            ))}
          </div>
          {canScrollUp && (
            <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
              <div className="bg-surface-secondary text-content-secondary rounded-full p-0.5 shadow">
                <IconChevronUp size={14} stroke={2} />
              </div>
            </div>
          )}
          {canScrollDown && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
              <div className="bg-surface-secondary text-content-secondary rounded-full p-0.5 shadow">
                <IconChevronDown size={14} stroke={2} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
