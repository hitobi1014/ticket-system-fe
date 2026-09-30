import useAuthStore from '@/store/authStore.ts';
import { Navigate } from 'react-router-dom';

export default function RoleBasedRedirect() {
  const { currentMember } = useAuthStore();

  const to = currentMember?.role === 'ADMIN' ? '/members' : '/seats/view';
  return <Navigate to={to} replace />;
}
