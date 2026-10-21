const KST_OFFSET = '+09:00';

function getKstParts(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    weekday: get('weekday'),
    hour: get('hour'),
    minute: get('minute'),
  };
}

/**
 * 공연 일시(ISO 8601)를 KST 기준 표기로 변환
 * @example '2026-12-19T19:00:00+09:00' -> '2026. 12. 19. (토) 19:00'
 */
export function formatPerformanceAt(iso: string): string {
  const p = getKstParts(iso);
  if (!p) return iso;
  return `${p.year}. ${Number(p.month)}. ${Number(p.day)}. (${p.weekday}) ${p.hour}:${p.minute}`;
}

/**
 * 공연 일시(ISO 8601)를 KST 기준 입력값(날짜/시간)으로 분리
 * @example '2026-12-19T19:00:00+09:00' -> { date: '2026-12-19', time: '19:00' }
 */
export function splitPerformanceAt(iso: string | undefined): { date: string; time: string } {
  const p = iso ? getKstParts(iso) : null;
  if (!p) return { date: '', time: '' };
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

/**
 * 날짜/시간 입력값(KST)을 오프셋 포함 ISO 8601로 결합
 * @example ('2026-12-19', '19:00') -> '2026-12-19T19:00:00+09:00'
 */
export function joinPerformanceAt(date: string, time: string): string {
  return `${date}T${time}:00${KST_OFFSET}`;
}

/**
 * 화면 표시용 회원명: 동명이인 구분용 끝 숫자를 제거 (악기 약어로 구분 가능)
 * @example '김종훈2' -> '김종훈'
 */
export function getDisplayMemberName(name: string): string {
  const stripped = name.replace(/\d+$/, '').trim();
  return stripped || name;
}

/** 연주자명 표기: 악기가 있으면 '이름(악기)', 없으면 '이름' */
export function formatPlayerName(name: string, instrument?: string | null): string {
  return instrument ? `${name}(${instrument})` : name;
}
