import { useState } from 'react';
import { SectionToolbarSlotContext } from '@/hooks/use-section-toolbar-slot.ts';

export interface SectionToolbarSlotProps {
  /** 구역이 선택되어 있는지 (미선택이면 안내 문구 표시) */
  hasSelection: boolean;
  /** 슬롯 DOM을 컨텍스트로 제공받는 캔버스 */
  children: React.ReactNode;
}

/** 캔버스 위 고정 도구 영역 + 슬롯 컨텍스트 제공 (구역 카드가 createPortal로 도구를 렌더) */
export default function SectionToolbarSlot({ hasSelection, children }: SectionToolbarSlotProps) {
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);

  return (
    <SectionToolbarSlotContext.Provider value={slot}>
      {/* 높이를 예약해 구역 선택/해제 시 캔버스가 흔들리지 않게 함. 빈 영역 클릭으로 선택이 해제되지 않도록 전파 차단 */}
      <div className="relative mt-2 min-h-8" onClick={(e) => e.stopPropagation()}>
        <div ref={setSlot} />
        {!hasSelection && (
          <p className="text-secondary absolute inset-0 flex items-center justify-end text-xs">
            구역을 선택하면 편집 도구가 표시됩니다.
          </p>
        )}
      </div>
      {children}
    </SectionToolbarSlotContext.Provider>
  );
}
