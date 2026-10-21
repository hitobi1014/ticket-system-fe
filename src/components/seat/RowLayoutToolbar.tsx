import { useState } from 'react';
import {
  IconArrowBackUp,
  IconArrowsVertical,
  IconCheck,
  IconRestore,
  IconRotate,
  IconX,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input';
import { ButtonGroup } from '@/components/ui/button-group';
import type { RowLayout } from '@/types';

export interface RowLayoutToolbarProps {
  /** 선택된 열 이름과 현재 배치 (선택된 열이 없으면 null) */
  selectedRow: { name: string; layout: RowLayout } | null;
  onChange: (layout: RowLayout) => void;
  /** 수치 입력 직전 되돌리기 이력 저장 */
  onBeforeChange: () => void;
  onResetRow: () => void;
  /** 열 간격 균등 적용: step 지정 시 해당 추가 간격, 생략 시 1·2열 사이 간격을 전체에 적용 */
  onDistribute: (step?: number) => void;
  /** 간격을 균등하게 맞출 수 있는지 (일반 열 2개 이상) */
  canDistribute: boolean;
  /** 1열 각도를 모든 열에 적용 */
  onApplyFirstRowRotation: () => void;
  /** 현재 1열 각도 (버튼 표시용) */
  firstRowRotation: number;
  onUndo: () => void;
  onCancel: () => void;
  onSave: () => void;
  canUndo: boolean;
  isDirty: boolean;
  isSaving: boolean;
}

const fieldClass = 'no-spinners h-6 w-16 text-center text-xs';

/** 열 배치 편집 툴바: 수치 미세 조정, 되돌리기, 저장/취소 */
export default function RowLayoutToolbar({
  selectedRow,
  onChange,
  onBeforeChange,
  onResetRow,
  onDistribute,
  canDistribute,
  onApplyFirstRowRotation,
  firstRowRotation,
  onUndo,
  onCancel,
  onSave,
  canUndo,
  isDirty,
  isSaving,
}: RowLayoutToolbarProps) {
  const layout = selectedRow?.layout;
  const [spacing, setSpacing] = useState('0');

  const handleField = (key: keyof RowLayout, value: string) => {
    if (!layout) return;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    onBeforeChange();
    onChange({ ...layout, [key]: parsed });
  };

  return (
    <div className="flex flex-col items-end gap-y-1 self-end text-xs">
      <ButtonGroup>
        <div className="text-secondary flex items-center gap-x-1 px-2">
          <span>{selectedRow ? `${selectedRow.name}열` : '열을 선택하세요'}</span>
          <label className="flex items-center gap-x-0.5">
            X
            <Input
              type="number"
              step={0.1}
              aria-label="offset-x"
              disabled={!layout}
              value={layout?.offsetX ?? 0}
              onChange={(e) => handleField('offsetX', e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="flex items-center gap-x-0.5">
            Y
            <Input
              type="number"
              step={0.1}
              aria-label="offset-y"
              disabled={!layout}
              value={layout?.offsetY ?? 0}
              onChange={(e) => handleField('offsetY', e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="flex items-center gap-x-0.5">
            각도
            <Input
              type="number"
              step={0.5}
              aria-label="rotation"
              disabled={!layout}
              value={layout?.rotation ?? 0}
              onChange={(e) => handleField('rotation', e.target.value)}
              className={fieldClass}
            />
          </label>
        </div>
        <Button size="xs" disabled={!layout} onClick={onResetRow}>
          <IconRestore stroke={2} />
          열 초기화
        </Button>
        <Button size="xs" disabled={!canUndo} onClick={onUndo}>
          <IconArrowBackUp stroke={2} />
          되돌리기
        </Button>
        <Button size="xs" variant="dialog" disabled={isSaving} onClick={onCancel}>
          <IconX stroke={2} />
          취소
        </Button>
        <Button size="xs" disabled={!isDirty || isSaving} onClick={onSave}>
          <IconCheck stroke={2} />
          {isSaving ? '저장 중...' : '저장'}
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <div className="text-secondary flex items-center gap-x-1 px-2">
          <span>열 간격</span>
          <Input
            type="number"
            step={0.1}
            aria-label="row-spacing"
            value={spacing}
            onChange={(e) => setSpacing(e.target.value)}
            className={fieldClass}
          />
          <span>칸 추가</span>
        </div>
        <Button
          size="xs"
          disabled={!canDistribute || Number.isNaN(Number(spacing))}
          onClick={() => onDistribute(Number(spacing))}
        >
          <IconArrowsVertical stroke={2} />
          균등 적용
        </Button>
        <Button size="xs" disabled={!canDistribute} onClick={() => onDistribute()}>
          1·2열 간격으로 균등
        </Button>
        <Button size="xs" disabled={!canDistribute} onClick={onApplyFirstRowRotation}>
          <IconRotate stroke={2} />
          1열 각도({firstRowRotation}°) 전체 적용
        </Button>
      </ButtonGroup>
      <p className="text-secondary">
        열 드래그: 이동 · 위쪽 핸들 드래그: 회전(Shift: 5° 단위) · 화살표: 0.1칸 이동 · Alt+←/→:
        0.5° 회전 · Ctrl/Cmd+Z: 되돌리기
      </p>
    </div>
  );
}
