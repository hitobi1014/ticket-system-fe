import { API_URL } from '@/constant/env.ts';

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

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers as Record<string, string>),
    },
  });

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
        message = errJson.mesage;
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
