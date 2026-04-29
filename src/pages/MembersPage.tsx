import useMemberStore from '@/store/memberStore.ts';
import { useState } from 'react';

export default function MembersPage() {
  const { members, addMember, removeMember } = useMemberStore();
  const [name, setName] = useState('');
  const [ticket, setTicket] = useState(0);

  const handleAddMember = () => {
    if (!name.trim()) return;
    addMember({ name: name.trim(), allocatedTickets: ticket });
    setName('');
    setTicket(0);
  };

  return (
    <div>
      <h1>회원관리</h1>
      <input placeholder="회원 이름" onChange={(e) => setName(e.target.value)} value={name} />
      <input
        type="number"
        min={0}
        placeholder="배정 티켓 수"
        value={ticket}
        onChange={(e) => setTicket(Number(e.target.value))}
      />

      <button onClick={handleAddMember}>회원 추가</button>

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
            {members.map((member) => (
              <tr key={member.id}>
                <td>{member.name}</td>
                <td>{member.allocatedTickets}</td>
                <td>{member.allocatedTickets}</td>
                <td>{member.allocatedTickets}</td>
                <td>{member.color}</td>
                <td>
                  <button onClick={() => removeMember(member.id)}>회원 삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
