import useMemberStore from '@/store/memberStore.ts';
import { useState } from 'react';
import type { Member } from '@/types/member.ts';
import { VENUE } from '@/constant/venue.ts';

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

const TABLE_HEADS = ['이름', '배정 티켓', '잔여 티켓', '배정된 좌석 수', '티켓색상', '삭제'];

export default function MembersPage() {
  const { members, addMember, removeMember, updateTickets, distributeTickets } = useMemberStore();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [ticket, setTicket] = useState(0);

  const totalAllocated = members.reduce((sum, m) => sum + m.allocatedTickets, 0);
  const remainingTickets = VENUE.totalSeats - totalAllocated;

  const handleAddMember = () => {
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    addMember({ name: name.trim(), allocatedTickets: ticket });
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
      <button onClick={() => setIsAdding(true)}>회원 추가</button>
      <button onClick={distributeTickets} disabled={members.length === 0}>
        티켓 균등 배분
      </button>
      <h1>총 좌석 수 {VENUE.totalSeats} </h1>
      <h1>잔여 좌석 수 {remainingTickets} </h1>
      <h1>회원에게 배정된 좌석 수 {totalAllocated} </h1>

      {members.length === 0 ? (
        <p>등록된 회원이 없습니다.</p>
      ) : (
        <Table>
          <TableHeader className="w-[100px]">
            <TableRow>
              {TABLE_HEADS.map((head) => (
                <TableHead key={head}>{head}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* 신규 회원 추가시 */}
            {isAdding && (
              <TableRow>
                <TableCell>
                  <input
                    placeholder="이름"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <input
                    type="number"
                    min={0}
                    value={ticket}
                    onChange={(e) => setTicket(Number(e.target.value))}
                  />
                </TableCell>
                <TableCell>-</TableCell>
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
                <TableRow key={member.id}>
                  <TableCell>{member.name}</TableCell>
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
                  <TableCell>{member.color}</TableCell>
                  <TableCell>
                    <button onClick={() => handleRemoveMember(member)}>회원 삭제</button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
