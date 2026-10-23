import { IconArrowBackUp, IconCheck, IconRestore, IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input';
import { ButtonGroup } from '@/components/ui/button-group';
import type { SectionLayout } from '@/types';

export interface SectionLayoutToolbarProps {
  layout: SectionLayout;
  onChange: (layout: SectionLayout) => void;
  /** 수치 변경 직전 되돌리기 이력 저장 */
  onBeforeChange: () => void;
  onReset: () => void;
  onUndo: () => void;
  onCancel: () => void;
  onSave: () => void;
  canUndo: boolean;
  isDirty: boolean;
  isSaving: boolean;
}

const fieldClass = 'no-spinners h-6 w-16 text-center text-xs';

/** 구역 배치 편집 툴바: 구역 이동/회전 수치, 이어붙이기, 되돌리기, 저장/취소 */
export default function SectionLayoutToolbar({
  layout,
  onChange,
  onBeforeChange,
  onReset,
  onUndo,
  onCancel,
  onSave,
  canUndo,
  isDirty,
  isSaving,
}: SectionLayoutToolbarProps) {
  const handleField = (key: 'offsetX' | 'offsetY' | 'rotation', value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    onBeforeChange();
    onChange({ ...layout, [key]: parsed });
  };

  const handleSeamless = () => {
    onBeforeChange();
    onChange({ ...layout, seamless: !layout.seamless });
  };

  return (
    <div className="flex flex-col items-end gap-y-1 self-end text-xs">
      <ButtonGroup>
        <div className="text-secondary flex items-center gap-x-1 px-2">
          <span>구역</span>
          <label className="flex items-center gap-x-0.5">
            X
            <Input
              type="number"
              step={0.1}
              aria-label="section-offset-x"
              value={layout.offsetX}
              onChange={(e) => handleField('offsetX', e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="flex items-center gap-x-0.5">
            Y
            <Input
              type="number"
              step={0.1}
              aria-label="section-offset-y"
              value={layout.offsetY}
              onChange={(e) => handleField('offsetY', e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="flex items-center gap-x-0.5">
            각도
            <Input
              type="number"
              step={0.5}
              aria-label="section-rotation"
              value={layout.rotation}
              onChange={(e) => handleField('rotation', e.target.value)}
              className={fieldClass}
            />
          </label>
        </div>
        <Button size="xs" onClick={handleSeamless}>
          {layout.seamless ? '이어붙이기 해제' : '이어붙이기'}
        </Button>
        <Button size="xs" onClick={onReset}>
          <IconRestore stroke={2} />
          구역 초기화
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
      <p className="text-secondary">
        구역명(상단) 드래그: 구역 이동 · 이어붙이기: 구역 테두리/여백 제거
      </p>
    </div>
  );
}
