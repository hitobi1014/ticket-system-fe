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
import { Dialog } from '@/components/ui/dialog.tsx';
import { Badge } from '@/components/ui/badge';
import { IconTicket, IconUserPlus } from '@tabler/icons-react';
import '@/pages/MemberPage.css';
import MemberInfoDialog from '@/components/dialog/MemberInfoDialog.tsx';
import MemberInfoCard, { type MemberInfoCardProps } from '@/components/member/MemberInfoCard.tsx';
import FunctionButtons from '@/components/common/FunctionButtons.tsx';

import type { ButtonItem } from '@/types/index';
import CustomSpinner from '@/components/common/CustomSpinner.tsx';

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
    isLoading,
    getMemberAssignedTicketsByMemberId,
    getMemberRemainTicketsByMemberId,
    distributeTickets,
  } = useMemberStore();
  const { getTotalSeatCount, getRemainSeatCount, getAssignedSeatCount } = useFloorStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedMember, setSelectedMember] = useState<Member | undefined>(undefined);

  // const totalAllocated = members.reduce((sum, m) => sum + m.allocatedTickets, 0);
  // const remainingTickets = VENUE.totalSeats - totalAllocated;

  const memberInfoCards: MemberInfoCardProps[] = [
    { title: '총 좌석', boldText: getTotalSeatCount(), textPostFix: '석' },
    {
      title: '미배정 좌석 ',
      boldText: getRemainSeatCount(),
      textPostFix: '석',
    },
    {
      title: '배정된 좌석',
      boldText: getAssignedSeatCount(),
      textPostFix: '석',
    },
    { title: '등록 회원', boldText: members.length, textPostFix: '명' },
  ];

  const functionButtons: ButtonItem[] = [
    {
      text: '회원 추가',
      onClick: () => {
        setSelectedMember(undefined);
        setIsModalOpen(true);
      },
      icon: <IconUserPlus stroke={2} />,
    },
    {
      text: '티켓 균등 배분',
      icon: <IconTicket stroke={2} />,
      onClick: distributeTickets,
      disabled: members.length === 0 || getTotalSeatCount() === 0,
    },
  ];

  if (isLoading) {
    return <CustomSpinner text="로딩중" />;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden gap-y-4">
      <FunctionButtons buttons={functionButtons} />
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
        <div className="flex flex-col flex-1 overflow-hidden rounded-lg ">
          {/*헤더 고정*/}
          <div className="shrink-0">
            <Table className="bg-surface-secondary">
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
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <Table className="bg-surface-secondary mp-table">
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
        <MemberInfoDialog
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
