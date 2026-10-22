import { useRef } from 'react';
import type { ComponentProps, RefObject } from 'react';
import { cn } from '@/lib/utils.ts';
import { getRowsLayoutSignature } from '@/lib/rowLayoutUtils.ts';
import useFitTransformedRows from '@/hooks/use-fit-transformed-rows.ts';
import type { SectionRow } from '@/types';

export interface FittedRowsProps extends Omit<ComponentProps<'div'>, 'ref'> {
  rows: SectionRow[];
  /** false인 동안은 구역 크기 보정을 갱신하지 않음 (배치 편집 중 드래그 등) */
  fitEnabled?: boolean;
  /** 외부에서 컨테이너 DOM이 필요한 경우(드래그 배율 계산 등) 전달 */
  containerRef?: RefObject<HTMLDivElement | null>;
}

/**
 * 구역의 열 목록 컨테이너. 배치(이동/회전)로 열이 바깥으로 넘치면 넘친 만큼 여백을 늘려
 * 구역 카드가 열을 감싸도록 한다. (기본 배치에서는 기존 렌더링과 동일)
 */
export default function FittedRows({
  rows,
  fitEnabled = true,
  containerRef,
  className,
  style,
  ...rest
}: FittedRowsProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const ref = containerRef ?? innerRef;
  const fitStyle = useFitTransformedRows(ref, fitEnabled, getRowsLayoutSignature(rows));

  return (
    <div
      ref={ref}
      className={cn('flex flex-col gap-y-2', className)}
      style={{ ...fitStyle, ...style }}
      {...rest}
    />
  );
}
