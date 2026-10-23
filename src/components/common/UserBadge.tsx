import { Badge } from '@/components/ui/badge.tsx';
import type { MemberInfo } from '@/types';

export interface UserBadgeProps {
  member: Pick<MemberInfo, 'name' | 'color' | 'instrumentAbbr'>;
}

/** 로그인한 회원의 색상 점 + 이름/악기 배지 */
export default function UserBadge({ member }: UserBadgeProps) {
  return (
    <div className="flex items-center gap-x-2">
      <div
        className="h-4 w-4 rounded-full border border-mist-300"
        style={{ backgroundColor: member.color || '#999' }}
        title={`${member.name}님의 색상`}
      />
      <Badge className="bg-accent-foreground text-text-foreground">
        {member.name} / {member.instrumentAbbr}
      </Badge>
    </div>
  );
}
