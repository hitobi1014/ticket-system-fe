import { useState } from 'react';
import { IconChevronDown, IconChevronUp, IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/button.tsx';
import { formatMemberSeatSummary } from '@/lib/memberSeatSummary.ts';
import type { MemberSeatSummary } from '@/lib/memberSeatSummary.ts';
import { getDisplayMemberName } from '@/lib/formatUtils.ts';
import type { Member } from '@/types';

export interface SelectedMemberListProps {
  members: Member[];
  /** 회원 id → 배정 좌석 요약 */
  summaries: Map<number, MemberSeatSummary>;
  onRemove: (memberId: number) => void;
  onClear: () => void;
  /** 항목에 마우스를 올린 회원 (벗어나면 null) — 그리드에서 해당 회원 좌석만 강조 */
  onHoverMember?: (memberId: number | null) => void;
}

/** 좌석안내에서 선택한 회원 목록 (한 줄에 한 회원, 층/구역별 배정 좌석 요약 표시) */
export default function SelectedMemberList({
  members,
  summaries,
  onRemove,
  onClear,
  onHoverMember,
}: SelectedMemberListProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (members.length === 0) return null;

  return (
    <section className="border-border shrink-0 rounded-md border">
      <header className="flex items-center justify-between gap-x-2 px-3 py-1">
        <button
          type="button"
          className="text-primary flex cursor-pointer items-center gap-x-1 text-sm font-medium"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          선택한 회원 {members.length}명
          {isExpanded ? (
            <IconChevronUp stroke={2} size={16} />
          ) : (
            <IconChevronDown stroke={2} size={16} />
          )}
        </button>
        <Button variant="ghost" size="xs" className="text-secondary" onClick={onClear}>
          전체 해제
        </Button>
      </header>
      {isExpanded && (
        <ul
          className="no-scrollbar border-border max-h-40 [scrollbar-gutter:stable] divide-y overflow-y-auto border-t"
          onMouseLeave={() => onHoverMember?.(null)}
        >
          {members.map((member) => {
            const summary = summaries.get(member.id);
            const text = summary ? formatMemberSeatSummary(summary) : '';
            const fullText = text ? `${text} (총 ${summary?.totalCount}석)` : '배정 좌석 없음';
            return (
              <li
                key={member.id}
                className="hover:bg-accent flex items-center gap-x-2 px-3 py-1 text-sm"
                onMouseEnter={() => onHoverMember?.(member.id)}
              >
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: member.color ?? '#cccccc' }}
                />
                <span className="text-text-primary shrink-0 whitespace-nowrap">
                  {getDisplayMemberName(member.name)}
                </span>
                <span
                  title={fullText}
                  className={
                    text
                      ? 'line-clamp-2 min-w-0 flex-1 text-xs'
                      : 'text-muted-foreground flex-1 text-xs'
                  }
                >
                  {text ? `${text} (총 ${summary?.totalCount}석)` : '배정 좌석 없음'}
                </span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-primary shrink-0"
                  aria-label={`${member.name} 선택 해제`}
                  onClick={() => onRemove(member.id)}
                >
                  <IconX stroke={2} size={14} />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
