import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field.tsx';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
import type { Floor, SeatNumbering } from '@/types';
import SeatNumberingOption from '@/components/dialog/section/SeatNumberingOption.tsx';
import type { RowNameType } from '@/lib/sectionUtils.ts';
import SectionRowPreview from '@/components/dialog/section/SectionRowPreview.tsx';

export interface SectionBasicInfoStepProps {
  floor: Floor | undefined;
  sectionName: string;
  onSectionNameChange: (value: string) => void;
  selectRowId: number | 'new';
  onSelectRowIdChange: (value: number | 'new') => void;
  rowCount: number;
  onRowCountChange: (value: number) => void;
  defaultSeatCount: number;
  onDefaultSeatCountChange: (value: number) => void;
  rowNameType: RowNameType;
  onRowNameTypeChange: (value: RowNameType) => void;
  startValue: string;
  onStartValueChange: (value: string) => void;
  seatNumbering: SeatNumbering;
  onSeatNumberingChange: (value: SeatNumbering) => void;
  previewNames: string[];
}

/** 1단계: 구역 기본 정보 입력 */
export default function SectionBasicInfoStep({
  floor,
  sectionName,
  onSectionNameChange,
  selectRowId,
  onSelectRowIdChange,
  rowCount,
  onRowCountChange,
  defaultSeatCount,
  onDefaultSeatCountChange,
  rowNameType,
  onRowNameTypeChange,
  startValue,
  onStartValueChange,
  seatNumbering,
  onSeatNumberingChange,
  previewNames,
}: SectionBasicInfoStepProps) {
  return (
    <div className="min-h-0 overflow-y-auto pr-1">
      <FieldGroup>
        {/*필드1: 구역명*/}
        <div className="flex gap-x-4">
          <Field className="max-w-sm">
            <FieldLabel htmlFor="section-name">구역명</FieldLabel>
            <Input
              id="section-name"
              aria-label="section-name"
              value={sectionName}
              onChange={(e) => onSectionNameChange(e.target.value)}
              type="triggerText"
              placeholder="구역명을 입력해주세요."
            />
          </Field>
          <Field className="max-w-sm">
            <FieldLabel htmlFor="section-row">배치 열</FieldLabel>
            <Select
              value={selectRowId === 'new' ? 'new' : String(selectRowId)}
              onValueChange={(v) => {
                onSelectRowIdChange(v === 'new' ? 'new' : Number(v));
              }}
            >
              <SelectTrigger className="w-45">
                <SelectValue placeholder="new" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="new">새 열 추가</SelectItem>
                  {floor?.rows.map((r, i) => (
                    <SelectItem key={`${r.order}_${i}`} value={String(r.id)}>
                      {r.order + 1}열 (기존)
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldDescription className="text-xs">이 구역이 배치될 열 위치</FieldDescription>
          </Field>
        </div>

        {/*필드2: 열 수*/}
        {/*필드3: 기본좌석 수*/}
        <div className="flex gap-x-4">
          <Field className="max-w-sm">
            <FieldLabel htmlFor="col-count">열 수</FieldLabel>
            <Input
              id="col-count"
              aria-label="col-count"
              value={rowCount}
              onChange={(e) => onRowCountChange(Number(e.target.value))}
              className="no-spinners"
              type="number"
              placeholder="열의 수를 입력해주세요."
            />
            <FieldDescription className="text-xs">
              구역에 배치할 열의 수 ex) 가구역 10열
            </FieldDescription>
          </Field>
          <Field className="max-w-sm">
            <FieldLabel htmlFor="base-seat-count">기본 좌석 수/열</FieldLabel>
            <Input
              id="base-seat-count"
              aria-label="base-seat-count"
              value={defaultSeatCount}
              onChange={(e) => onDefaultSeatCountChange(Number(e.target.value))}
              className="no-spinners"
              type="number"
              placeholder="좌석수를 입력해주세요"
            />
            <FieldDescription className="text-xs">열 기본 좌석 수</FieldDescription>
          </Field>
        </div>
        <div className="flex items-center gap-x-4">
          <Field className="max-w-sm">
            <FieldLabel htmlFor="base-seat-count">열 이름 형식</FieldLabel>
            <Select
              value={rowNameType}
              onValueChange={(v) => onRowNameTypeChange(v as RowNameType)}
            >
              <SelectTrigger className="w-45">
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="number">숫자(1,2,3...)</SelectItem>
                  <SelectItem value="alpha">알파벳(A,B,C...)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field className="max-w-sm">
            <FieldLabel htmlFor="base-seat-count">
              {rowNameType === 'number' ? '시작 번호' : '시작 알파벳'}
            </FieldLabel>
            <Input
              aria-label="start-value"
              type="triggerText"
              value={startValue}
              onChange={(e) => onStartValueChange(e.target.value)}
            />
          </Field>
        </div>

        <SeatNumberingOption value={seatNumbering} onChange={onSeatNumberingChange} />

        <SectionRowPreview
          previewNames={previewNames}
          sectionName={sectionName}
          rowCount={rowCount}
          defaultSeatCount={defaultSeatCount}
        />
      </FieldGroup>
    </div>
  );
}
