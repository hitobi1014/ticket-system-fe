import { useEffect, useState } from 'react';

const isTextInput = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/**
 * Space 키를 누르고 있는 동안 true
 * @param enabled - false이면 항상 false를 반환하고 키 이벤트를 가로채지 않음
 *
 * enabled일 때는 Space의 기본 동작(페이지 스크롤, 포커스된 버튼 클릭)을 막는다.
 */
export default function useSpaceKey(enabled: boolean) {
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || isTextInput(e.target)) return;
      e.preventDefault(); // 스크롤 및 포커스된 좌석 버튼의 click 방지
      setIsPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      if (!isTextInput(e.target)) e.preventDefault();
      setIsPressed(false);
    };
    const handleBlur = () => setIsPressed(false);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      setIsPressed(false);
    };
  }, [enabled]);

  return enabled && isPressed;
}
