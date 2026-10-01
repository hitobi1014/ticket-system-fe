import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import type { MemberRole } from '@/types';

interface ProtectedRouteProps {
  requiredRole?: MemberRole;
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, currentMember } = useAuthStore();

  // 1. 로그인 체크
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. ROLE 체크 (requiredRole이 있을 때만)
  if (requiredRole && currentMember?.role !== requiredRole) {
    return <Navigate to="/seats/view" replace />;
  }

  // 3. 모든 체크 통과
  return <Outlet />;
}
