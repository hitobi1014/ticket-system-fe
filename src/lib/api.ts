import { API_URL } from '@/constant/env.ts';
import useServerStatusStore, { isWakingStatus } from '@/store/serverStatusStore.ts';

const getStoredToken = (): string | null => {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return null;
    return (JSON.parse(raw) as { state?: { token?: string } }).state?.token ?? null;
  } catch {
    return null;
  }
};

const fetchApi = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const token = getStoredToken();

  const request = () =>
    fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers as Record<string, string>),
      },
    });

  let response: Response | undefined;
  try {
    response = await request();
  } catch (e) {
    // 네트워크 오류(TypeError)만 서버 기동 지연으로 간주한다
    if (!(e instanceof TypeError)) throw e;
  }

  // Render 무료 플랜 콜드 스타트: GET은 서버가 깨어날 때까지 기다린 뒤 1회 재시도,
  // 그 외 요청은 중복 실행 위험이 있어 재시도하지 않고 안내만 한다
  if (!response || isWakingStatus(response.status)) {
    const isGet = !options?.method || options.method.toUpperCase() === 'GET';
    const wakeUp = useServerStatusStore.getState().wakeUp;
    if (!isGet) {
      void wakeUp();
      throw new Error('서버가 깨어나는 중입니다. 잠시 후 다시 시도해 주세요.');
    }
    if (!(await wakeUp())) {
      throw new Error('서버에 연결할 수 없습니다. 잠시 후 새로고침해 주세요.');
    }
    response = await request();
  }

  if (response.status === 401) {
    localStorage.removeItem('auth-storage');
    window.location.replace('/login');
    throw new Error('인증이 필요합니다.');
  }

  if (!response.ok) {
    const errText = await response.text();
    let message = `API error: ${response.status}`;
    try {
      const errJson = JSON.parse(errText);
      if (errJson?.message) {
        message = errJson.message;
      }
    } catch {
      message = '오류발생';
    }
    throw new Error(message);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }

  const text = await response.text();
  const json = JSON.parse(text);

  return (json && typeof json === 'object' && 'data' in json ? json.data : json) as T;
};
export default fetchApi;
