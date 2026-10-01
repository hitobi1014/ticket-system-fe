import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox.tsx';
import { Button } from '@/components/ui/button.tsx';
import { IconX } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge.tsx';
import { type Dispatch, type SetStateAction, useMemo } from 'react';
import useMemberStore from '@/store/memberStore.ts';
import { getChoseong } from 'es-hangul';
import type { Member } from '@/types';

interface MemberSearchComboBoxProps {
  selectedMemberIds: number[];
  setSelectedMemberIds: Dispatch<SetStateAction<number[]>>;
  setPulsingMemberIds: Dispatch<SetStateAction<Set<number>>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  selectedMembers: Member[];
}

export default function MemberSearchComboBox({
  selectedMemberIds,
  setSelectedMemberIds,
  setPulsingMemberIds,
  searchQuery,
  setSearchQuery,
  selectedMembers,
}: MemberSearchComboBoxProps) {
  const members = useMemberStore((state) => state.members);
  const getMemberRemainTicketsByMemberId = useMemberStore(
    (state) => state.getMemberRemainTicketsByMemberId,
  );

  const handleSelectMember = (memberIdStr: string | null) => {
    if (memberIdStr == null) return;
    const memberId = Number(memberIdStr);
    if (!selectedMemberIds.includes(memberId)) {
      setSelectedMemberIds((prev) => [...prev, memberId]);
      setPulsingMemberIds((prev) => new Set(prev).add(memberId));
      setTimeout(() => {
        setPulsingMemberIds((prev) => {
          const next = new Set(prev);
          next.delete(memberId);
          return next;
        });
      }, 3000);
    }
    setSearchQuery('');
  };

  const handleRemoveMember = (memberId: number) => {
    setSelectedMemberIds((prev) => prev.filter((id) => id !== memberId));
  };

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    return members.filter((m) => {
      const choseong = getChoseong(m.name);
      return choseong.includes(searchQuery) || m.name.includes(searchQuery.trim());
    });
  }, [searchQuery, members]);

  return (
    <Combobox
      value=""
      onValueChange={handleSelectMember}
      inputValue={searchQuery}
      onInputValueChange={(v) => setSearchQuery(v)}
      filter={() => true}
    >
      <ComboboxInput
        showTrigger={false}
        placeholder="회원 이름으로 좌석 찾기"
        onChange={(e) => setSearchQuery(e.target.value)}
        className="text-primary border-primary w-60 border"
      />
      {/* 선택된 회원 목록
            간략하게 color 이름 표기
            ex) o 김안나
            화면 범위를 넘어가면 잘리지 않고 가로 스크롤되도록 처리
            */}
      {selectedMembers.length > 0 && (
        <div className="no-scrollbar flex gap-x-2 overflow-x-auto py-1">
          {selectedMembers.map((member) => (
            <div
              key={member.id}
              className="border-border flex shrink-0 items-center justify-center gap-x-1 rounded-md border px-2"
            >
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: member.color ?? '#cccccc' }}
              />
              <span className="text-text-primary text-sm whitespace-nowrap">{member.name}</span>
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-primary shrink-0"
                onClick={() => handleRemoveMember(member.id)}
              >
                <IconX stroke={2} size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
      {
        <ComboboxContent>
          <ComboboxList>
            {filteredMembers.length === 0 ? (
              <p className="py-2 text-center text-sm">검색 결과 없음</p>
            ) : (
              filteredMembers.map((member) => {
                const remain = getMemberRemainTicketsByMemberId(member.id);
                return (
                  <ComboboxItem key={member.id} value={String(member.id)}>
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: member.color ?? '#cccccc' }}
                    />
                    <Badge variant="default" className="w-8 px-1.5 py-0 text-xs">
                      {member.instrument.abbr}
                    </Badge>
                    <span className="flex-1 text-sm">{member.name}</span>
                    <span className="text-muted-foreground ml-auto text-xs">
                      잔여:{remain} / 배정:{member.allocatedTickets}
                    </span>
                  </ComboboxItem>
                );
              })
            )}
          </ComboboxList>
        </ComboboxContent>
      }
    </Combobox>
  );
}
