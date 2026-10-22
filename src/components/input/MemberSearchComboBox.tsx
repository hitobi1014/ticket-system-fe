import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { type Dispatch, type KeyboardEvent, type SetStateAction, useMemo, useRef } from 'react';
import useMemberStore from '@/store/memberStore.ts';
import useSeatGuideStore from '@/store/seatGuideStore.ts';
import { getAssignedCountMapFromFloors, getRemainTickets } from '@/lib/seatUtils.ts';
import { getDisplayMemberName } from '@/lib/formatUtils.ts';
import { getChoseong } from 'es-hangul';

interface MemberSearchComboBoxProps {
  selectedMemberIds: number[];
  onSelectMember: (memberId: number) => void;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
}

export default function MemberSearchComboBox({
  selectedMemberIds,
  onSelectMember,
  searchQuery,
  setSearchQuery,
}: MemberSearchComboBoxProps) {
  const members = useMemberStore((state) => state.members);
  // 좌석안내 페이지가 사용하는 floors 기준으로 회원별 배정완료석을 한 번만 집계
  const floors = useSeatGuideStore((state) => state.floors);
  const assignedCountMap = useMemo(() => getAssignedCountMapFromFloors(floors), [floors]);
  const selectedMemberIdSet = useMemo(() => new Set(selectedMemberIds), [selectedMemberIds]);
  const highlightedValueRef = useRef<string | null>(null);

  const handleSelectMember = (memberIdStr: string | null) => {
    if (memberIdStr == null) return;
    highlightedValueRef.current = null;
    const memberId = Number(memberIdStr);
    if (!selectedMemberIdSet.has(memberId)) onSelectMember(memberId);
    setSearchQuery('');
  };

  // Tab: 하이라이트된 항목이 있을 때만 Enter/클릭과 동일하게 선택 처리
  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Tab' || e.shiftKey) return;
    const highlighted = highlightedValueRef.current;
    if (highlighted == null || selectedMemberIdSet.has(Number(highlighted))) return;
    e.preventDefault();
    handleSelectMember(highlighted);
  };

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    return members.filter((m) => {
      const choseong = getChoseong(m.name);
      return choseong.includes(searchQuery) || m.name.includes(searchQuery.trim());
    });
  }, [searchQuery, members]);

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
      <div data-tour="member-search" className="w-full md:w-auto">
        <Combobox
          value=""
          onValueChange={handleSelectMember}
          inputValue={searchQuery}
          onInputValueChange={(v) => setSearchQuery(v)}
          filter={() => true}
          onItemHighlighted={(value) => {
            highlightedValueRef.current = value ?? null;
          }}
        >
          <ComboboxInput
            showTrigger={false}
            placeholder="이름으로 좌석 찾기 (초성 가능)"
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="text-primary border-primary w-full border md:w-60"
          />
          <ComboboxContent>
            <ComboboxList>
              {filteredMembers.length === 0 ? (
                <p className="py-2 text-center text-sm">검색 결과 없음</p>
              ) : (
                filteredMembers.map((member) => {
                  const assigned = assignedCountMap[member.id] ?? 0;
                  const remain = getRemainTickets(member, assignedCountMap);
                  return (
                    <ComboboxItem
                      key={member.id}
                      value={String(member.id)}
                      disabled={selectedMemberIdSet.has(member.id)}
                    >
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: member.color ?? '#cccccc' }}
                      />
                      <Badge variant="default" className="w-8 px-1.5 py-0 text-xs">
                        {member.instrument.abbr}
                      </Badge>
                      <span className="flex-1 text-sm">{getDisplayMemberName(member.name)}</span>
                      <span className="text-muted-foreground ml-auto text-xs">
                        잔여: {remain} / 배정완료석: {assigned}
                      </span>
                    </ComboboxItem>
                  );
                })
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </div>
  );
}
