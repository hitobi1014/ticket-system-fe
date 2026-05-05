import useMemberStore from '@/store/memberStore.ts';
import { useState } from 'react';
import type { Member } from '@/types/member.ts';
import { VENUE } from '@/constant/venue.ts';

/*
TODO 총 좌석 수가 0일떄는 회원 티켓 추가로 늘리지 못하게 막기
 */

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
      {/*<input placeholder="회원 이름" onChange={(e) => setName(e.target.value)} value={name} />*/}
      {/*<input*/}
      {/*  type="number"*/}
      {/*  min={0}*/}
      {/*  placeholder="배정 티켓 수"*/}
      {/*  value={ticket}*/}
      {/*  onChange={(e) => setTicket(Number(e.target.value))}*/}
      {/*/>*/}

      {members.length === 0 ? (
        <p>등록된 회원이 없습니다.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>이름</th>
              <th>배정 티켓</th>
              <th>잔여 티켓</th>
              <th>배정된 좌석 수</th>
              <th>티켓색상</th>
              <th>삭제</th>
            </tr>
          </thead>
          <tbody>
            {/* 신규 회원 추가시 */}
            {isAdding && (
              <tr>
                <td>
                  <input
                    placeholder="이름"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    value={ticket}
                    onChange={(e) => setTicket(Number(e.target.value))}
                  />
                </td>
                <td>-</td>
                <td>-</td>
                <td>
                  <input type="color" />
                </td>
                <td>
                  <button onClick={handleAddMember}>확인</button>
                  <button onClick={() => setIsAdding(false)}>취소</button>
                </td>
              </tr>
            )}
            {/* 회원 목록 */}
            {members.map((member) => (
              <tr key={member.id}>
                <td>{member.name}</td>
                <td>
                  <input
                    style={{ textAlign: 'right' }}
                    type="number"
                    min={0}
                    value={member.allocatedTickets}
                    onChange={(e) => updateTickets(member.id, Number(e.target.value))}
                  />
                </td>
                <td>{member.allocatedTickets}</td>
                <td>{member.allocatedTickets}</td>
                <td>{member.color}</td>
                <td>
                  <button onClick={() => handleRemoveMember(member)}>회원 삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
