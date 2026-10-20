import { useCallback, useEffect, useRef } from 'react';
import { driver, type DriveStep, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_DONE_KEY = 'seat-view-tour-done';

const TOUR_STEPS: DriveStep[] = [
  {
    element: '[data-tour="member-search"]',
    popover: {
      title: '회원 검색',
      description:
        '이름이나 초성으로 회원을 검색하면 해당 회원의 좌석이 강조 표시됩니다. <br> 회원 선택 후 Tab 누르면 연속 검색이 가능합니다.',
    },
  },
  {
    element: '[data-tour="zoom"]',
    popover: {
      title: '확대/축소',
      description:
        '좌석 배치도를 확대하거나 축소해서 볼 수 있습니다. <br> (윈도우 = CTRL/맥 = CMD) + 휠',
    },
  },
  {
    element: '[data-tour="guest-name"]',
    popover: {
      title: '게스트명 입력',
      description: '내게 배정된 좌석의 게스트 이름을 한 번에 입력할 수 있습니다.',
    },
  },
  {
    element: '[data-tour="my-ticket"]',
    popover: {
      title: '내 티켓 다운로드',
      description: '내게 배정된 좌석의 티켓을 다운로드할 수 있습니다.',
    },
  },
];

function isTourDone() {
  try {
    return localStorage.getItem(TOUR_DONE_KEY) === 'true';
  } catch {
    return false;
  }
}

function markTourDone() {
  try {
    localStorage.setItem(TOUR_DONE_KEY, 'true');
  } catch {
    // 저장소를 쓸 수 없는 환경에서는 다음 방문 때 다시 노출
  }
}

/**
 * 좌석안내 페이지 온보딩 투어
 * - 첫 방문 시 1회 자동 실행
 * - startTour: 완료 여부와 관계없이 수동으로 다시 실행
 * @param ready - 투어 대상 요소가 모두 렌더링된 상태인지 여부
 */
export default function useSeatViewTour(ready: boolean) {
  const tourRef = useRef<Driver | null>(null);

  const startTour = useCallback(() => {
    // 렌더링되지 않은 대상(예: 배정 좌석이 없어 티켓 버튼이 없는 경우)은 건너뜀
    const steps = TOUR_STEPS.filter(
      (step) => typeof step.element === 'string' && document.querySelector(step.element),
    );
    if (steps.length === 0) return;

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
      steps,
      onDestroyed: () => {
        if (tourRef.current === tour) {
          tourRef.current = null;
          markTourDone();
        }
      },
    });
    tourRef.current = tour;
    tour.drive();
  }, []);

  useEffect(() => {
    if (!ready || isTourDone()) return;
    startTour();

    // 언마운트 시 정리 (완료로 기록하지 않음)
    return () => {
      const tour = tourRef.current;
      tourRef.current = null;
      tour?.destroy();
    };
  }, [ready, startTour]);

  return { startTour };
}
