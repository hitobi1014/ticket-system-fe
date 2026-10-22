import type { DriveStep } from 'driver.js';
import useTour from '@/hooks/use-tour.ts';

const TOUR_DONE_KEY = 'seat-view-tour-done';

const TOUR_STEPS: DriveStep[] = [
  {
    element: '[data-tour="seat-grid"]',
    popover: {
      title: '좌석 안내',
      description:
        '본인 좌석은 초대하려는 게스트명이 표기되고, 좌석별 좌측 상단에 "나" 텍스트 마커가 작게 표기됩니다.',
    },
  },
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

/**
 * 좌석안내 페이지 온보딩 투어
 * - 첫 방문 시 1회 자동 실행
 * - startTour: 완료 여부와 관계없이 수동으로 다시 실행
 * @param ready - 투어 대상 요소가 모두 렌더링된 상태인지 여부
 */
export default function useSeatViewTour(ready: boolean) {
  return useTour({ storageKey: TOUR_DONE_KEY, steps: TOUR_STEPS, ready });
}
