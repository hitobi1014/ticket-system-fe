import useMemberStore from '@/store/memberStore.ts';
import { useState } from 'react';
import { INSTRUMENTS, type Member } from '@/types/member.ts';
import { VENUE } from '@/constant/venue.ts';
import { HexColorPicker } from 'react-colorful';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Table,
  TableBody,
  // TableCaption,
  TableCell,
  // TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  // } from '@/components/ui/table';
} from '@/components/ui/table';

import useFloorStore from '@/store/floorStore.ts';
import { ButtonGroup } from '@/components/ui/button-group.tsx';
import { Button } from '@/components/ui/button.tsx';
import MemberInfoModal from '@/components/modal/MemberInfoModal.tsx';
import { Dialog } from '@/components/ui/dialog.tsx';

const TABLE_HEADS = [
  '이름',
  '악기',
  '배정 티켓',
  '잔여 티켓',
  '배정된 좌석 수',
  '회원 색상',
  '삭제',
];

export default function MembersPage() {
  const { members, addMember, removeMember, updateTickets, distributeTickets, updateMemberColor } =
    useMemberStore();
  const { getTotalSeatCount } = useFloorStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [ticket, setTicket] = useState(0);
  const [selectedMember, setSelectedMember] = useState<Member | undefined>(undefined);

  const totalAllocated = members.reduce((sum, m) => sum + m.allocatedTickets, 0);
  const remainingTickets = VENUE.totalSeats - totalAllocated;

  const handleAddMember = () => {
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    // TODO 악기, 포인트 임시 추가 => 모달로 변경예정
    addMember({
      name: name.trim(),
      allocatedTickets: ticket,
      instrument: INSTRUMENTS[0],
      point: 0,
    });
    setName('');
    setTicket(0);
    setIsAdding(false);
  };

  const handleRemoveMember = (member: Member) => {
    const result = confirm(`${member.name}님을 목록에서 제거 하시겠습니까?`);
    if (!result) {
      return;
    }
    removeMember(member.id);
  };

  const handleUpdateTicket = (memberId: number, ticket: number) => {
    const member = members.find((member) => member.id === memberId);
    if (!member) return;

    const isIncreasing = ticket > member.allocatedTickets;
    if (isIncreasing && remainingTickets <= 0) {
      alert('현재 남아있는 좌석 수가 없습니다.');
      return;
    }

    updateTickets(memberId, ticket);
  };

  return (
    <div>
      <h1>회원관리</h1>
      <ButtonGroup>
        {/*TODO 회원 등록되면 삭제하기*/}
        {/*<Button onClick={() => setIsAdding(true)}>회원 추가</Button>*/}
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
            <TableRow>
              {TABLE_HEADS.map((head) => (
                <TableHead key={head}>{head}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/*'이름', '악기', '배정 티켓', '잔여 티켓', '배정된 좌석 수', '티켓색상', '삭제',*/}
            {/* 신규 회원 추가시 */}
            {isAdding && (
              <TableRow>
                {/* 이름 */}
                <TableCell>
                  <input
                    placeholder="이름"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </TableCell>
                {/* 악기 */}
                <TableCell></TableCell>
                <TableCell>
                  <input
                    type="number"
                    min={0}
                    value={ticket}
                    onChange={(e) => setTicket(Number(e.target.value))}
                  />
                </TableCell>
                <TableCell>-</TableCell> {/* 잔여티켓 */}
                <TableCell>-</TableCell>
                <TableCell>
                  <input type="color" />
                </TableCell>
                <TableCell>
                  <button onClick={handleAddMember}>확인</button>
                  <button onClick={() => setIsAdding(false)}>취소</button>
                </TableCell>
              </TableRow>
            )}
            {/* 회원 목록 */}
            {members.map((member) => {
              return (
                <TableRow
                  key={member.id}
                  onClick={() => {
                    setSelectedMember(member);
                  }}
                >
                  <TableCell>{member.name}</TableCell>
                  <TableCell>
                    <Select value={member.instrument.abbr}>
                      <SelectTrigger className="w-45">
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {INSTRUMENTS.map((i) => (
                            <SelectItem value={i.abbr}>{i.abbr}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <input
                      style={{ textAlign: 'right' }}
                      type="number"
                      min={0}
                      value={member.allocatedTickets}
                      onChange={(e) => handleUpdateTicket(member.id, Number(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>{member.allocatedTickets}</TableCell>
                  <TableCell>{member.allocatedTickets}</TableCell>

                  <TableCell>
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
                  <TableCell>
                    <button onClick={() => handleRemoveMember(member)}>회원 삭제</button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <MemberInfoModal
          member={selectedMember}
          onClose={() => {
            setIsModalOpen(false);
          }}
        />
      </Dialog>
    </div>
  );
}
