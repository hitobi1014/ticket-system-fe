import { useCallback, useEffect, useRef } from 'react';
import { driver, type DriveStep, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';

/** `deferred`: 투어 시작 시점에는 없다가 단계 진행 중에 나타나는 대상 (시작 시 존재 여부 검사에서 제외) */
export type TourStep = DriveStep & { deferred?: boolean };

interface UseTourOptions {
  /** 완료 여부를 저장하는 localStorage 키 */
  storageKey: string;
  steps: TourStep[];
  /** 투어 대상 요소가 모두 렌더링된 상태인지 여부 */
  ready: boolean;
  /** 투어가 끝나거나 교체/정리될 때 호출 (투어 중 바꾼 화면 상태 복원용) */
  onEnd?: () => void;
}

function isTourDone(key: string) {
  try {
    return localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}

function markTourDone(key: string) {
  try {
    localStorage.setItem(key, 'true');
  } catch {
    // 저장소를 쓸 수 없는 환경에서는 다음 방문 때 다시 노출
  }
}

/**
 * 온보딩 투어 공통 훅 (driver.js)
 * - 첫 방문 시 1회 자동 실행, startTour로 완료 여부와 관계없이 수동 재실행
 * - 렌더링되지 않은 대상(예: 배정 좌석이 없어 티켓 버튼이 없는 경우)은 건너뜀
 */
export default function useTour({ storageKey, steps, ready, onEnd }: UseTourOptions) {
  const tourRef = useRef<Driver | null>(null);
  // 최신 steps/onEnd를 쓰되 startTour의 참조는 고정 (자동 실행 effect가 재실행되지 않도록)
  const stepsRef = useRef(steps);
  const onEndRef = useRef(onEnd);
  useEffect(() => {
    stepsRef.current = steps;
    onEndRef.current = onEnd;
  });

  const startTour = useCallback(() => {
    const available = stepsRef.current.filter(
      (step) =>
        step.deferred || (typeof step.element === 'string' && document.querySelector(step.element)),
    );
    if (available.length === 0) return;

    // 진행 중인 투어가 있으면 교체 (교체된 투어는 완료로 기록하지 않음)
    const prev = tourRef.current;
    tourRef.current = null;
    prev?.destroy();

    const tour = driver({
      showProgress: true,
      allowClose: true,
      nextBtnText: '다음',
      prevBtnText: '이전',
      doneBtnText: '완료',
      progressText: '{{current}} / {{total}}',
      steps: available.map(({ element, popover }): DriveStep => ({ element, popover })),
      onDestroyed: () => {
        onEndRef.current?.();
        if (tourRef.current === tour) {
          tourRef.current = null;
          markTourDone(storageKey);
        }
      },
    });
    tourRef.current = tour;
    tour.drive();
  }, [storageKey]);

  useEffect(() => {
    if (!ready || isTourDone(storageKey)) return;
    startTour();

    // 언마운트 시 정리 (완료로 기록하지 않음)
    return () => {
      const tour = tourRef.current;
      tourRef.current = null;
      tour?.destroy();
    };
  }, [ready, storageKey, startTour]);

  return { startTour };
}
