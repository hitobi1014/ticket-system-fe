import { createContext, useContext } from 'react';

/** 선택한 구역의 도구 모음을 렌더링할 화면 고정 영역(DOM). 줌/이동과 무관하게 항상 보인다 */
export const SectionToolbarSlotContext = createContext<HTMLElement | null>(null);

export default function useSectionToolbarSlot() {
  return useContext(SectionToolbarSlotContext);
}
