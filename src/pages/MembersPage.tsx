import useMemberStore from '@/store/memberStore.ts';
import { useState } from 'react';
import { type Member } from '@/types/member.ts';
import { VENUE } from '@/constant/venue.ts';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import useFloorStore from '@/store/floorStore.ts';
import { ButtonGroup } from '@/components/ui/button-group.tsx';
import { Button } from '@/components/ui/button.tsx';
import MemberInfoModal from '@/components/modal/MemberInfoModal.tsx';
import { Dialog } from '@/components/ui/dialog.tsx';

const TABLE_HEADS = ['이름', '악기', '배정 티켓', '잔여 티켓', '배정된 좌석 수', '회원 색상'];

export default function MembersPage() {
  const {
    members,
    getMemberAssignedTickets,
    getMemberRemainTickets,
    distributeTickets,
    updateMemberColor,
  } = useMemberStore();
  const { getTotalSeatCount } = useFloorStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | undefined>(undefined);

  const totalAllocated = members.reduce((sum, m) => sum + m.allocatedTickets, 0);
  const remainingTickets = VENUE.totalSeats - totalAllocated;

  return (
    <div>
      <h1>회원관리</h1>
      <ButtonGroup>
        <Button onClick={() => setIsModalOpen(true)}>회원 추가</Button>
        <Button
          onClick={distributeTickets}
          disabled={members.length === 0 || getTotalSeatCount() === 0}
        >
          티켓 균등 배분
        </Button>
      </ButtonGroup>
      <h1>총 좌석 수 {getTotalSeatCount()} </h1>
      <h1>잔여 좌석 수 {remainingTickets} </h1>
      <h1>회원에게 배정된 좌석 수 {totalAllocated} </h1>

      {members.length === 0 ? (
        <p>등록된 회원이 없습니다.</p>
      ) : (
        <Table>
          <TableHeader className="w-25">
            <TableRow className="divide-x border-t">
              {TABLE_HEADS.map((head) => (
                <TableHead key={head} className="text-center">
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/*'이름', '악기', '배정 티켓', '잔여 티켓', '배정된 좌석 수', '티켓색상', '삭제',*/}
            {/* 회원 목록 */}
            {members.map((member) => {
              return (
                <TableRow
                  key={member.id}
                  className="divide-x cursor-pointer"
                  onClick={() => {
                    setSelectedMember(member);
                    setIsModalOpen(true);
                  }}
                >
                  <TableCell className="text-center">{member.name}</TableCell>
                  <TableCell className="text-center">{member.instrument.abbr}</TableCell>
                  {/* 배정티켓 */}
                  <TableCell className="text-right">{member.allocatedTickets}</TableCell>
                  {/* 잔여티켓 */}
                  <TableCell className="text-right">{getMemberRemainTickets(member.id)}</TableCell>
                  {/* 배정된좌석수 */}
                  <TableCell className="text-right">
                    {getMemberAssignedTickets(member.id)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="w-6 h-6 rounded-full border border-gray-300"
                          style={{ backgroundColor: member.color }}
                        />
                      </PopoverTrigger>
                      <PopoverContent>
                        <HexColorPicker
                          color={member.color}
                          onChange={(color) => updateMemberColor(member.id, color)}
                        />
                      </PopoverContent>
                    </Popover>
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
