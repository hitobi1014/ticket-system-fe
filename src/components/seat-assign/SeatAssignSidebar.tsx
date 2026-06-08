import useFloorStore from '@/store/floorStore.ts';
import useMemberStore from '@/store/memberStore.ts';
import { Separator } from '@/components/ui/separator.tsx';
import { getContrastTextColor } from '@/lib/uiUtils.ts';
import type { Member } from '@/types';
import { clsx } from 'clsx';

export default function SeatAssignSidebar() {
  const { getRemainSeatCount } = useFloorStore();
  const { members } = useMemberStore();

  const sortingMember = members.sort((a, b) => {
    // 잔여티켓 내림차순
    if (b.allocatedTickets !== a.allocatedTickets) {
      return b.allocatedTickets - a.allocatedTickets;
    }
    // 같으면 이름 가나다순
    return a.name.localeCompare(b.name, 'ko');
  });

  const isAllowTicketZero = (member: Member): boolean => {
    return member.allocatedTickets === 0;
  };

  return (
    <div className="w-36 border-l border-gray-700 pl-4 p-y">
      <div className="bg-gray-800 rounded-lg pl-3 py-2">
        <h5 className="text-gray-200">잔여 좌석</h5>
        <h3 className="text-white font-bold">{getRemainSeatCount()}</h3>
      </div>
      <div className="flex flex-col gap-y-2 mt-2">
        <h3 className="text-gray-500 text-sm">회원별 잔여 티켓</h3>
        <Separator />
        <div className="flex flex-col gap-y-1.5">
          {sortingMember.map((member) => (
            <div key={member.id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <p
                  className="w-8 text-center text-xs  px-1 py-0.5 rounded font-bold"
                  style={{
                    backgroundColor: member.color,
                    color: getContrastTextColor(member.color ?? '#ffffff'),
                  }}
                >
                  {member.instrument.abbr}
                </p>
                <p
                  className={clsx('text-sm', {
                    'text-gray-400': isAllowTicketZero(member),
                  })}
                >
                  {member.name}
                </p>
              </div>
              <p className="bg-gray-700 px-2 py-0.5 rounded text-sm text-white min-w-[24px] text-center">
                {member.allocatedTickets}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
