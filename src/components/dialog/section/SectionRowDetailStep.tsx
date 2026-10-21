import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input';
import { IconPlus } from '@tabler/icons-react';
import {
  buildConfigSeatNumbers,
  describeSeatNumbering,
  type RowNameType,
} from '@/lib/sectionUtils.ts';
import type { SeatNumbering, SectionRowConfig } from '@/types';
import RowSeatCountEditor from '@/components/dialog/section/RowSeatCountEditor.tsx';
import RowGapItem from '@/components/dialog/section/RowGapItem.tsx';

export interface SectionRowDetailStepProps {
  sectionName: string;
  rowCount: number;
  rowNameType: RowNameType;
  seatNumbering: SeatNumbering;
  bulkCount: number;
  onBulkCountChange: (value: number) => void;
  onApplyBulk: () => void;
  rowConfigs: SectionRowConfig[];
  onRowSeatCountChange: (index: number, seatCount: number) => void;
  onInsertGapAfter: (index: number) => void;
  onRemoveGap: (index: number) => void;
}

/** 2단계: 열별 좌석 수 상세 설정 */
export default function SectionRowDetailStep({
  sectionName,
  rowCount,
  rowNameType,
  seatNumbering,
  bulkCount,
  onBulkCountChange,
  onApplyBulk,
  rowConfigs,
  onRowSeatCountChange,
  onInsertGapAfter,
  onRemoveGap,
}: SectionRowDetailStepProps) {
  // 1단계에서 선택한 번호 방식을 적용한 열별 좌석 번호 (빈 줄은 null)
  const seatNumbersByRow = buildConfigSeatNumbers(rowConfigs, seatNumbering);

  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-y-2">
      {/* step02-content-01*/}
      <div className="flex shrink-0 gap-x-1 rounded-md py-2">
        <div className="text-muted bg-secondary flex gap-x-1 rounded-md px-2">
          <p>구역:</p>
          <p>{sectionName}</p>
        </div>
        <div className="text-muted bg-secondary flex gap-x-1 rounded-md px-2">
          <p>열:</p>
          <p>{rowCount}열</p>
        </div>
        <div className="text-muted bg-secondary flex gap-x-1 rounded-md px-2">
          <p>형식:</p>
          <p>{rowNameType === 'number' ? '숫자' : '알파벳'}</p>
        </div>
        <div className="text-muted bg-secondary flex gap-x-1 rounded-md px-2">
          <p>번호:</p>
          <p>{describeSeatNumbering(seatNumbering)}</p>
        </div>
      </div>
      {/* step02-content-02*/}
      <div className="flex shrink-0 items-center justify-between rounded-md py-2">
        <div className="flex h-full items-center gap-x-4">
          <p className="text-sm">전체 일괄 적용</p>
          <Input
            type="number"
            aria-label="seat-count"
            min={1}
            value={bulkCount}
            onChange={(e) => onBulkCountChange(parseInt(e.target.value) || 0)}
            className="no-spinners h-7 w-16 rounded-md text-center"
          />
          <Button variant="dialog" size="sm" onClick={onApplyBulk}>
            전체 적용
          </Button>
        </div>
        <p className="text-warning text-xs">개별 수정도 가능</p>
      </div>
      {/* step02-content-03*/}
      <div className="flex min-h-0 flex-col gap-y-1 overflow-y-auto pr-1">
        {rowConfigs.map((config, i) => {
          if (config.type === 'GAP') {
            return <RowGapItem key={i} onRemove={() => onRemoveGap(i)} />;
          }
          // 마지막 열 뒤, 이미 빈 줄이 있는 위치에는 추가할 수 없음 (연속/말미 빈 줄 방지)
          const canInsertGap = i < rowConfigs.length - 1 && rowConfigs[i + 1].type === 'ROW';
          return (
            <div key={i} className="flex flex-col gap-y-1">
              <RowSeatCountEditor
                rowName={config.name}
                seatCount={config.seatCount}
                seatNumbers={seatNumbersByRow[i] ?? []}
                onChange={(seatCount) => onRowSeatCountChange(i, seatCount)}
              />
              {canInsertGap && (
                <Button
                  variant="ghost"
                  size="xs"
                  className="text-secondary self-start"
                  onClick={() => onInsertGapAfter(i)}
                >
                  <IconPlus stroke={2} />빈 줄 추가
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
