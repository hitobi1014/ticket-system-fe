import { useEffect, useRef } from 'react';
import useTour, { type TourStep } from '@/hooks/use-tour.ts';

const TOUR_DONE_KEY = 'seat-assign-tour-done';
const BULK_BAR_SELECTOR = '[data-tour="bulk-bar"]';
const WAIT_TIMEOUT_MS = 1000;

/** 대상 요소가 렌더링될 때까지 대기 (시간 초과 시에도 진행) */
function waitForElement(selector: string) {
  return new Promise<void>((resolve) => {
    const startedAt = performance.now();
    const check = () => {
      if (document.querySelector(selector) || performance.now() - startedAt > WAIT_TIMEOUT_MS) {
        resolve();
        return;
      }
      requestAnimationFrame(check);
    };
    check();
  });
}

interface UseSeatAssignTourOptions {
  /** 투어 대상 요소가 모두 렌더링된 상태인지 여부 */
  ready: boolean;
  /** 일괄 편집 모드 진입 (잔여 티켓이 있는 회원이 없어 진입할 수 없으면 false) */
  onEnterBulk: () => boolean;
  /** 투어가 끝날 때 호출 — 투어가 켠 일괄 편집 모드를 복원 */
  onExitBulk: () => void;
}

/**
 * 좌석배정 페이지 온보딩 투어 (단건 배정 → 일괄 편집)
 * - 일괄 편집 단계는 투어가 첫 잔여 티켓 보유 회원을 선택해 모드를 켠 뒤 설명한다
 * - 첫 방문 시 1회 자동 실행, startTour로 수동 재실행
 */
export default function useSeatAssignTour({
  ready,
  onEnterBulk,
  onExitBulk,
}: UseSeatAssignTourOptions) {
  // 투어 시작 시점에 만든 steps가 최신 화면 상태를 쓸 수 있도록 ref로 전달
  const enterBulkRef = useRef(onEnterBulk);
  const exitBulkRef = useRef(onExitBulk);
  useEffect(() => {
    enterBulkRef.current = onEnterBulk;
    exitBulkRef.current = onExitBulk;
  });

  const steps: TourStep[] = [
    {
      element: '[data-tour="assign-grid"]',
      popover: {
        title: '단건 배정',
        description:
          '좌석을 클릭하면 회원 선택 창이 열립니다. <br> 회원을 선택해 한 좌석씩 배정하거나 배정을 변경할 수 있습니다.',
      },
    },
    {
      element: '[data-tour="assign-sidebar"]',
      popover: {
        title: '다건 배정 (일괄 편집)',
        description:
          '회원별 잔여 티켓 목록에서 회원을 클릭하면 일괄 편집 모드로 전환됩니다. <br> 잔여 티켓이 있는 회원만 선택할 수 있고, 같은 회원을 다시 클릭하면 해제됩니다. <br> "다음"을 누르면 첫 번째 회원으로 일괄 편집을 시작해 보여드립니다.',
        onNextClick: (_element, _step, { driver }) => {
          if (!enterBulkRef.current()) {
            // 선택할 수 있는 회원이 없으면 일괄 편집 단계를 건너뛰고 마지막(확대/축소) 단계로 이동
            driver.moveTo((driver.getConfig().steps?.length ?? 1) - 1);
            return;
          }
          void waitForElement(BULK_BAR_SELECTOR).then(() => driver.moveNext());
        },
      },
    },
    {
      element: BULK_BAR_SELECTOR,
      deferred: true,
      popover: {
        title: '일괄 편집 상단 바',
        description:
          '선택한 회원의 잔여 티켓 변화(잔여 N → M)와 선택 좌석 수가 표시됩니다. <br> 좌석을 선택한 뒤 "배정"을 누르면 확인 후 한 번에 배정되고, 이미 배정된 좌석을 선택했다면 "배정취소"도 할 수 있습니다. "선택 해제"로 일괄 편집을 종료합니다.',
      },
    },
    {
      element: '[data-tour="assign-grid"]',
      deferred: true,
      popover: {
        title: '좌석 드래그 선택',
        description:
          '좌석을 클릭하거나 드래그해서 여러 좌석을 한 번에 선택합니다. <br> 이미 선택된 좌석에서 드래그를 시작하면 선택이 해제됩니다. <br> 선택 가능한 좌석 수는 회원의 잔여 티켓 수까지입니다.',
      },
    },
    {
      element: '[data-tour="bulk-shortcut"]',
      deferred: true,
      popover: {
        title: '단축키',
        description:
          'Shift를 누른 채 선택하면 이미 배정된 좌석도 선택해 덮어쓰기/배정취소 할 수 있습니다. <br> Space를 누른 채 드래그하면 화면을 이동할 수 있습니다.',
      },
    },
    {
      element: '[data-tour="zoom"]',
      popover: {
        title: '확대/축소',
        description:
          '좌석 배치도를 확대하거나 축소할 수 있습니다. <br> (윈도우 = CTRL/맥 = CMD) + 휠',
      },
    },
  ];

  return useTour({
    storageKey: TOUR_DONE_KEY,
    steps,
    ready,
    onEnd: () => exitBulkRef.current(),
  });
}
