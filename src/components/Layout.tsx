import { NavLink, Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner.tsx';

export default function Layout() {
  return (
    <div className="main-bg-color">
      <Toaster
        toastOptions={{
          style: {
            backgroundColor: '#364153',
            color: 'white',
          },
        }}
      />
      <nav style={{ display: 'flex', gap: 16, padding: 16 }}>
        <NavLink to="/members">회원 관리</NavLink>
        <NavLink to="/seats/setup">좌석 설정</NavLink>
        <NavLink to="/seats/assign">좌석 배정</NavLink>
      </nav>
      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}
