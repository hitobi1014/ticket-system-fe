import { useState } from 'react';
import useMemberStore from '@/store/memberStore.ts';
import useFloorStore from '@/store/floorStore.ts';
import { INSTRUMENTS, type Member } from '@/types/member.ts';
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
import { IconCloudDown, IconTicket, IconUserPlus } from '@tabler/icons-react';
import MemberInfoDialog from '@/components/dialog/MemberInfoDialog.tsx';
import MemberInfoCard, { type MemberInfoCardProps } from '@/components/member/MemberInfoCard.tsx';
import FunctionButtons from '@/components/common/FunctionButtons.tsx';

import type { ButtonItem } from '@/types/index';
import CustomSpinner from '@/components/common/CustomSpinner.tsx';
import { toast } from 'sonner';
import useVenueStore from '@/store/venueStore.ts';
import { VenueInfoDialog } from '@/components/dialog/VenueInfoDialog.tsx';

const COL_WIDTHS = ['5%', '14%', '11%', '10%', '10%', '10%', '10%', '11%'];
const ColGroup = () => (
  <colgroup>
    {COL_WIDTHS.map((w, i) => (
      <col key={i} style={{ width: w }} />
    ))}
  </colgroup>
);
const TABLE_HEADS = [
  '순위',
  '이름',
  '파트',
  '출석점수',
  '배정 티켓',
  '잔여 티켓',
  '좌석 배정 완료',
  '회원 색상',
]; // 8개

export default function MembersPage() {
  const {
    members,
    isLoading,
    syncFromSheet,
    getMemberAssignedTicketsByMemberId,
    getMemberRemainTicketsByMemberId,
    distributeTickets,
  } = useMemberStore();
  const { getRemainSeatCount, getAssignedSeatCount, getUnallocatedTickedCount } = useFloorStore();
  const { venue, getTotalSeatCount } = useVenueStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | undefined>(undefined);

  const memberInfoCards: MemberInfoCardProps[] = [
    { title: '총 좌석', boldText: getTotalSeatCount(), textPostFix: '석' },
    { title: '미배분 티켓', boldText: getUnallocatedTickedCount(), textPostFix: '장' },
    {
      title: '미배정 좌석',
      boldText: getRemainSeatCount(),
      textPostFix: '석',
    },
    {
      title: '배정 완료 좌석',
      boldText: getAssignedSeatCount(),
      textPostFix: '석',
    },
    { title: '등록 회원', boldText: members.length, textPostFix: '명' },
  ];

  const functionButtons: ButtonItem[] = [
    {
      dialog: (
        <VenueInfoDialog
          key={venue?.id}
          venueId={venue?.id}
          venue={venue ?? undefined}
          isUpdate={venue?.id != null}
        />
      ),
    },
    {
      text: '회원 목록 동기화',
      icon: <IconCloudDown stroke={2} />,
      disabled: isLoading.sync,
      confirm: {
        title: '회원 목록 가져오기',
        description:
          '출석 앱에 등록된 회원 목록을 기반으로 가져옵니다. \n💡목록에 없는 회원은 삭제됩니다.',
        actions: [
          {
            text: '가져오기',
            onClick: async () => {
              try {
                const data = await syncFromSheet();
                const status = data.stats;
                toast.success(
                  `동기화 완료: 추가 ${status.inserted}건, 수정: ${status.updated}건, 삭제: ${status.deleted}건, 총 처리건수: ${status.total}`,
                );
              } catch (e) {
                toast.error(`회원 목록가져오기 실패: ${e}`);
              }
            },
          },
        ],
        triggerText: '가져오기',
      },
    },
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
      onClick: async () => {
        try {
          await distributeTickets();
          toast.success('티켓 균등 배분이 완료되었습니다.');
        } catch (e) {
          toast.error(e instanceof Error ? e.message : '티켓 배분에 실패했습니다.');
        }
      },
      disabled: members.length === 0 || getTotalSeatCount() === 0 || isLoading.distribute,
    },
  ];

  if (isLoading.fetch) {
    return <CustomSpinner text="로딩중" />;
  }

  return (
    <div className="flex h-full flex-col gap-y-4 overflow-hidden">
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
        <div className="flex flex-1 flex-col overflow-hidden rounded-lg">
          {/*헤더 고정*/}
          <div className="shrink-0">
            <Table className="bg-surface-secondary">
              <ColGroup />
              <TableHeader className="w-25">
                <TableRow>
                  {TABLE_HEADS.map((head) => (
                    <TableHead
                      key={head}
                      className="border-b border-b-mist-300 text-center text-gray-300"
                    >
                      {head}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
            </Table>
          </div>

          {/* 바디만 스크롤 */}
          <div className="no-scrollbar flex-1 overflow-y-auto">
            <Table className="bg-surface-secondary text-content-primary">
              <ColGroup />
              <TableBody className="divide-y divide-mist-300">
                {/*'이름', '악기', '배정 티켓', '잔여 티켓', '배정된 좌석 수', '티켓색상', '삭제',*/}
                {/* 회원 목록 */}
                {members.map((member) => {
                  return (
                    <TableRow
                      key={member.id}
                      className="cursor-pointer text-center"
                      onClick={() => {
                        setSelectedMember(member);
                        setIsModalOpen(true);
                      }}
                    >
                      <TableCell>{member.seq}</TableCell>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>
                        <Badge className="bg-mist-500 text-white">
                          {member.instrument.abbr} /{' '}
                          {INSTRUMENTS[member.instrument.abbr as keyof typeof INSTRUMENTS] ??
                            '알 수 없음'}
                        </Badge>
                      </TableCell>
                      <TableCell>{member.point}</TableCell>
                      {/* 배정티켓 */}
                      <TableCell>{member.allocatedTickets}</TableCell>
                      {/* 잔여티켓 */}
                      <TableCell>{getMemberRemainTicketsByMemberId(member.id)}</TableCell>
                      {/* 배정된좌석수 */}
                      <TableCell>{getMemberAssignedTicketsByMemberId(member.id)}</TableCell>
                      <TableCell>
                        <button
                          className="h-6 w-6 rounded-full"
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
