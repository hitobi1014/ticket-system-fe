import useFloorStore from '@/store/floorStore.ts';
import useMemberStore from '@/store/memberStore.ts';
import { Separator } from '@/components/ui/separator.tsx';
import { getContrastTextColor } from '@/lib/uiUtils.ts';
import { clsx } from 'clsx';
import { getAssignableMember } from '@/lib/seatUtils.ts';

export default function SeatAssignSidebar() {
  const { getRemainSeatCount } = useFloorStore();
  const { members } = useMemberStore();

  // const sortingMember = members.sort((a, b) => {
  //   // 잔여티켓 내림차순
  //   if (b.allocatedTickets !== a.allocatedTickets) {
  //     return b.allocatedTickets - a.allocatedTickets;
  //   }
  //   // 같으면 이름 가나다순
  //   return a.name.localeCompare(b.name, 'ko');
  // });

  const isAllowTicketZero = (allocatedTickets: number): boolean => {
    return allocatedTickets == 0;
  };

  return (
    <div className="w-44 flex flex-col h-full border-l border-surface-accent pl-4 p-y">
      <div className="bg-surface-secondary rounded-lg pl-3 py-2 shrink-0">
        <h5 className="text-content-secondary">잔여 좌석</h5>
        <h3 className="text-content-primary font-bold">{getRemainSeatCount()}</h3>
      </div>
      <div className="flex flex-col flex-1 gap-y-2 mt-2 min-h-0">
        <h3 className="text-content-secondary text-sm shrink-0">회원별 잔여 티켓</h3>
        <Separator className="shrink-0" />
        <div className="flex flex-col flex-1 min-h-0 no-scrollbar overflow-y-auto gap-y-1.5">
          {/*{sortingMember.map((member) => (*/}
          {getAssignableMember(members).map((member) => (
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
                    'text-mist-500': isAllowTicketZero(member.allocatedTickets),
                  })}
                >
                  {member.name}
                </p>
              </div>
              <p
                className={clsx('px-2 py-0.5 rounded text-sm min-w-6 text-center', {
                  'bg-surface-danger text-content-danger': isAllowTicketZero(
                    member.allocatedTickets,
                  ),
                  'bg-surface-secondary text-content-primary': !isAllowTicketZero(
                    member.allocatedTickets,
                  ),
                })}
              >
                {member.allocatedTickets}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
