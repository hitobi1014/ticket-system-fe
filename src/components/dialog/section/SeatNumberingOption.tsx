import { Field, FieldDescription, FieldLabel } from '@/components/ui/field.tsx';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { buildNumberingPreview } from '@/lib/sectionUtils.ts';
import type { SeatNumbering } from '@/types';

export interface SeatNumberingOptionProps {
  value: SeatNumbering;
  onChange: (value: SeatNumbering) => void;
}

const toggleItemClass = 'data-[state=on]:bg-primary cursor-pointer data-[state=on]:text-white';

/** 좌석 번호 방식 선택 (각 열별 / 구역별 이어서 + 시작 방향 + 패턴) */
export default function SeatNumberingOption({ value, onChange }: SeatNumberingOptionProps) {
  const preview = buildNumberingPreview(value);

  return (
    <Field>
      <FieldLabel>좌석 번호 방식</FieldLabel>
      <div className="flex flex-wrap items-start gap-x-6 gap-y-2">
        <div className="flex flex-col gap-y-2">
          <ToggleGroup
            type="single"
            spacing={0}
            value={value.mode}
            onValueChange={(v) => {
              if (v === 'PER_ROW') onChange({ mode: 'PER_ROW' });
              if (v === 'SECTION' && value.mode !== 'SECTION') {
                onChange({ mode: 'SECTION', start: 'LEFT', pattern: 'SEQUENTIAL' });
              }
            }}
          >
            <ToggleGroupItem value="PER_ROW" variant="outline" size="sm" className={toggleItemClass}>
              각 열별 번호 시작
            </ToggleGroupItem>
            <ToggleGroupItem value="SECTION" variant="outline" size="sm" className={toggleItemClass}>
              구역별 번호 이어서
            </ToggleGroupItem>
          </ToggleGroup>

          {value.mode === 'SECTION' && (
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <ToggleGroup
                type="single"
                spacing={0}
                value={value.start}
                onValueChange={(v) => {
                  if (v === 'LEFT' || v === 'RIGHT') onChange({ ...value, start: v });
                }}
              >
                <ToggleGroupItem value="LEFT" variant="outline" size="sm" className={toggleItemClass}>
                  왼쪽 시작
                </ToggleGroupItem>
                <ToggleGroupItem value="RIGHT" variant="outline" size="sm" className={toggleItemClass}>
                  오른쪽 시작
                </ToggleGroupItem>
              </ToggleGroup>
              <ToggleGroup
                type="single"
                spacing={0}
                value={value.pattern}
                onValueChange={(v) => {
                  if (v === 'SEQUENTIAL' || v === 'ZIGZAG') onChange({ ...value, pattern: v });
                }}
              >
                <ToggleGroupItem
                  value="SEQUENTIAL"
                  variant="outline"
                  size="sm"
                  className={toggleItemClass}
                >
                  순차
                </ToggleGroupItem>
                <ToggleGroupItem value="ZIGZAG" variant="outline" size="sm" className={toggleItemClass}>
                  지그재그(ㄹ)
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}
          <FieldDescription className="text-xs">
            {value.mode === 'SECTION'
              ? '구역 전체에서 번호를 이어서 부여합니다. 숨긴 좌석은 번호를 건너뜁니다.'
              : '열마다 1번부터 번호를 부여합니다.'}
          </FieldDescription>
        </div>

        {/* 번호 미리보기 (3행 × 4석 예시) */}
        <div className="flex flex-col gap-y-0.5 text-xs">
          {preview.map((row, r) => (
            <div key={r} className="flex gap-x-0.5">
              {row.map((n, i) => (
                <span
                  key={i}
                  className="bg-secondary text-text-foreground w-6 rounded-sm py-0.5 text-center"
                >
                  {n}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Field>
  );
}
