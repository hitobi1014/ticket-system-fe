import { useState } from 'react';
import useMemberStore from '@/store/memberStore.ts';
import useFloorStore from '@/store/floorStore.ts';
import { type Member } from '@/types/member.ts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button.tsx';
import { Dialog } from '@/components/ui/dialog.tsx';
import { Badge } from '@/components/ui/badge';
import { IconUserPlus, IconTicket } from '@tabler/icons-react';
import '@/pages/MemberPage.css';
import MemberInfoModal from '@/components/modal/MemberInfoModal.tsx';
import MemberInfoCard, { type MemberInfoCardProps } from '@/components/member/MemberInfoCard.tsx';

const TABLE_HEADS = ['이름', '악기', '배정 티켓', '잔여 티켓', '배정된 좌석 수', '회원 색상'];

export default function MembersPage() {
  const {
    members,
    getMemberAssignedTicketsByMemberId,
    getMemberRemainTicketsByMemberId,
    distributeTickets,
  } = useMemberStore();
  const { getTotalSeatCount } = useFloorStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | undefined>(undefined);

  // const totalAllocated = members.reduce((sum, m) => sum + m.allocatedTickets, 0);
  // const remainingTickets = VENUE.totalSeats - totalAllocated;

  const memberInfoCards: MemberInfoCardProps[] = [
    { title: '총 좌석', boldText: useFloorStore.getState().getTotalSeatCount(), textPostFix: '석' },
    {
      title: '잔여 좌석 ',
      boldText: useFloorStore.getState().getRemainSeatCount(),
      textPostFix: '석',
    },
    {
      title: '배정된 좌석',
      boldText: useFloorStore.getState().getAssignedSeatCount(),
      textPostFix: '석',
    },
    { title: '등록 회원', boldText: members.length, textPostFix: '명' },
  ];

  return (
    <div className="flex flex-col gap-y-4">
      <h1 className="popup-title">회원관리</h1>
      <div className="flex gap-x-2 mt-4">
        <Button className="mp-button" onClick={() => setIsModalOpen(true)}>
          <IconUserPlus stroke={2} />
          회원 추가
        </Button>
        <Button
          className="mp-button"
          onClick={distributeTickets}
          disabled={members.length === 0 || getTotalSeatCount() === 0}
        >
          <IconTicket stroke={2} />
          티켓 균등 배분
        </Button>
      </div>
      <div className="flex gap-3 mt-4">
        {memberInfoCards.map((card) => (
          <MemberInfoCard
            key={card.title}
            title={card.title}
            boldText={card.boldText}
            textPostFix={card.textPostFix}
          />
        ))}
      </div>

      {members.length === 0 ? (
        <p>등록된 회원이 없습니다.</p>
      ) : (
        <Table className="sub-bg-color mp-table">
          <TableHeader className="w-25 ">
            <TableRow className="mp-table-border">
              {TABLE_HEADS.map((head) => (
                <TableHead key={head} className="text-center text-gray-300">
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="mp-table-border">
            {/*'이름', '악기', '배정 티켓', '잔여 티켓', '배정된 좌석 수', '티켓색상', '삭제',*/}
            {/* 회원 목록 */}
            {members.map((member) => {
              return (
                <TableRow
                  key={member.id}
                  className="text-center cursor-pointer "
                  onClick={() => {
                    setSelectedMember(member);
                    setIsModalOpen(true);
                  }}
                >
                  <TableCell>{member.name}</TableCell>
                  <TableCell>
                    <Badge className="bg-mist-500 text-white">{member.instrument.abbr}</Badge>
                  </TableCell>
                  {/* 배정티켓 */}
                  <TableCell>{member.allocatedTickets}</TableCell>
                  {/* 잔여티켓 */}
                  <TableCell>{getMemberRemainTicketsByMemberId(member.id)}</TableCell>
                  {/* 배정된좌석수 */}
                  <TableCell>{getMemberAssignedTicketsByMemberId(member.id)}</TableCell>
                  <TableCell>
                    <button
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: member.color }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <MemberInfoModal
          key={selectedMember?.id ?? 'new'}
          member={selectedMember}
          onClose={() => {
            setIsModalOpen(false);
          }}
        />
      </Dialog>
    </div>
  );
}
