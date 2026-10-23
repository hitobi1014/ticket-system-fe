import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore.ts';

/** 로그아웃 후 로그인 화면으로 이동 */
export default function useLogout() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  return () => {
    logout();
    navigate('/login', { replace: true });
  };
}
