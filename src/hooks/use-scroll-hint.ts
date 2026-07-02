import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

// deps가 바뀔 때마다(목록 갱신 등) 스크롤 가능 여부를 다시 계산
export function useScrollHint(deps: unknown[]) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const updateScrollHint = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 0);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
  }, []);

  useLayoutEffect(() => {
    updateScrollHint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    el.addEventListener('scroll', updateScrollHint);
    // 다이얼로그 오픈 애니메이션 등으로 컨테이너 크기가 뒤늦게 바뀌는 경우 대응
    const resizeObserver = new ResizeObserver(updateScrollHint);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', updateScrollHint);
      resizeObserver.disconnect();
    };
  }, [updateScrollHint]);

  return { scrollContainerRef, canScrollUp, canScrollDown };
}
