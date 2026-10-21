import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input';
import type { RowConfig, RowNameType } from '@/lib/sectionUtils.ts';
import RowSeatCountEditor from '@/components/dialog/section/RowSeatCountEditor.tsx';

export interface SectionRowDetailStepProps {
  sectionName: string;
  rowCount: number;
  rowNameType: RowNameType;
  bulkCount: number;
  onBulkCountChange: (value: number) => void;
  onApplyBulk: () => void;
  rowConfigs: RowConfig[];
  onRowSeatCountChange: (index: number, seatCount: number) => void;
}

/** 2단계: 열별 좌석 수 상세 설정 */
export default function SectionRowDetailStep({
  sectionName,
  rowCount,
  rowNameType,
  bulkCount,
  onBulkCountChange,
  onApplyBulk,
  rowConfigs,
  onRowSeatCountChange,
}: SectionRowDetailStepProps) {
  return (
    <div className="flex min-h-0 flex-col gap-y-2">
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
        {rowConfigs.map((config, i) => (
          <RowSeatCountEditor
            key={i}
            rowName={config.name}
            seatCount={config.seatCount}
            onChange={(seatCount) => onRowSeatCountChange(i, seatCount)}
          />
        ))}
      </div>
    </div>
  );
}
