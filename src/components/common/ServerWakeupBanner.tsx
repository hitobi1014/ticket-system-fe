import { useEffect, useState } from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Spinner } from '@/components/ui/spinner.tsx';
import useServerStatusStore from '@/store/serverStatusStore.ts';

// 평소처럼 빠르게 응답하면 배너가 깜빡이지 않도록 지연 후 표시한다
const SHOW_DELAY_MS = 2000;

export default function ServerWakeupBanner() {
  const status = useServerStatusStore((state) => state.status);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (status !== 'waking') return;
    const startedAt = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => {
      clearInterval(timer);
      setElapsed(0);
    };
  }, [status]);

  if (status === 'failed') {
    return (
      <div className="bg-destructive text-danger fixed inset-x-0 top-0 z-100 flex items-center justify-center gap-2 px-4 py-2 text-sm">
        <IconAlertTriangle size={16} stroke={2} className="shrink-0" />
        서버에 연결할 수 없습니다. 잠시 후 새로고침해 주세요.
      </div>
    );
  }

  if (status !== 'waking' || elapsed * 1000 < SHOW_DELAY_MS) return null;

  return (
    <div className="bg-accent text-primary fixed inset-x-0 top-0 z-100 flex items-center justify-center gap-2 px-4 py-2 text-sm">
      <Spinner className="size-4 shrink-0" />
      서버를 깨우는 중입니다. 최대 1분 정도 걸릴 수 있어요. ({elapsed}초)
    </div>
  );
}
