import type { ComponentProps } from 'react';
import { Badge } from '@/components/ui/badge.tsx';
import { getSectionVisibleSeatCount } from '@/lib/floorUtils.ts';
import type { Section } from '@/types';

export interface SectionBadgeProps extends Omit<ComponentProps<typeof Badge>, 'children'> {
  section: Section;
}

/** 구역명 배지: 구역명 뒤에 보이는 좌석 수를 함께 표기 (ex. 가(354석)) */
export default function SectionBadge({ section, ...props }: SectionBadgeProps) {
  return (
    <Badge {...props}>
      {section.name} ({getSectionVisibleSeatCount(section).toLocaleString()}석)
    </Badge>
  );
}
