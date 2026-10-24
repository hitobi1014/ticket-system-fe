import { create } from 'zustand/react';
import { API_URL } from '@/constant/env.ts';

export type ServerStatus = 'idle' | 'waking' | 'ready' | 'failed';

interface ServerStatusStore {
  status: ServerStatus;
  wakeUp: () => Promise<boolean>;
}

const HEALTH_PATH = '/health';
const POLL_INTERVAL_MS = 3000;
const REQUEST_TIMEOUT_MS = 8000;
const MAX_WAIT_MS = 90000;

// 502/503/504는 Render가 서버를 깨우는 동안 내려주는 응답이다
export const isWakingStatus = (status: number) =>
  status === 502 || status === 503 || status === 504;

// 어떤 HTTP 응답이든(404 포함) 5xx 게이트웨이 오류가 아니면 서버가 깨어난 것으로 본다
const pingServer = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}${HEALTH_PATH}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    return !isWakingStatus(response.status);
  } catch {
    // 콜드 스타트 중에는 CORS 헤더 없는 오류/타임아웃으로 fetch가 reject된다
    return false;
  }
};

let wakeUpPromise: Promise<boolean> | null = null;

const useServerStatusStore = create<ServerStatusStore>()((set) => ({
  status: 'idle',

  // 동시에 여러 번 호출돼도 폴링은 하나만 돈다
  wakeUp: () => {
    if (wakeUpPromise) return wakeUpPromise;

    wakeUpPromise = (async () => {
      const startedAt = Date.now();
      set({ status: 'waking' });

      while (Date.now() - startedAt < MAX_WAIT_MS) {
        if (await pingServer()) {
          set({ status: 'ready' });
          return true;
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }

      set({ status: 'failed' });
      return false;
    })().finally(() => {
      wakeUpPromise = null;
    });

    return wakeUpPromise;
  },
}));

export default useServerStatusStore;
