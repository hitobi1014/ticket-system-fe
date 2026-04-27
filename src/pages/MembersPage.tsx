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
      <ul>
        {members.map((member) => (
          <li key={member.id}>
            {member.name} (티켓: {member.allocatedTickets})
            <button onClick={() => removeMember(member.id)}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
