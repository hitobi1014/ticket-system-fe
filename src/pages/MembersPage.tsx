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
import { IconUserPlus, IconTicket, IconUsers } from '@tabler/icons-react';
import '@/pages/MemberPage.css';
import MemberInfoModal from '@/components/modal/MemberInfoModal.tsx';
import MemberInfoCard, { type MemberInfoCardProps } from '@/components/member/MemberInfoCard.tsx';
import PageHeader from '@/components/common/PageHeader.tsx';

const COL_WIDTHS = ['15%', '12%', '14%', '14%', '14%', '12%'];
const ColGroup = () => (
  <colgroup>
    {COL_WIDTHS.map((w, i) => (
      <col key={i} style={{ width: w }} />
    ))}
  </colgroup>
);
const TABLE_HEADS = ['이름', '악기', '배정 티켓', '잔여 티켓', '배정된 좌석 수', '회원 색상']; // 6개

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
    <div className="flex flex-col h-full overflow-hidden gap-y-4">
      <PageHeader title={'회원관리'} icon={<IconUsers stroke={1.5} />} />
      <div className="flex gap-x-2">
        <Button className="function-button" onClick={() => setIsModalOpen(true)}>
          <IconUserPlus stroke={2} />
          회원 추가
        </Button>
        <Button
          className="function-button"
          onClick={distributeTickets}
          disabled={members.length === 0 || getTotalSeatCount() === 0}
        >
          <IconTicket stroke={2} />
          티켓 균등 배분
        </Button>
      </div>
      <div className="flex gap-3">
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
        /* 테이블 wrapper - flex-col로 테이블 헤더/바디 분리 */
        <div className="flex flex-col flex-1 overflow-hidden rounded-lg border border-mist-500">
          {/*헤더 고정*/}
          <div className="shrink-0">
            <Table className="secondary-bg">
              <ColGroup />
              <TableHeader className="w-25 ">
                <TableRow>
                  {TABLE_HEADS.map((head) => (
                    <TableHead
                      key={head}
                      className="text-center text-gray-300 border-b border-b-mist-300"
                    >
                      {head}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
            </Table>
          </div>

          {/* 바디만 스크롤 */}
          <div className="flex-1 overflow-y-auto">
            <Table className="secondary-bg mp-table">
              <ColGroup />
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
          </div>
        </div>
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
