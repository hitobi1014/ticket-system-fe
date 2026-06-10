import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner.tsx';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

export default function Layout() {
  return (
    <SidebarProvider className="main-bg-color">
      {/* 사이드바 위치*/}
      <AppSidebar />
      {/*<div className="main-bg-color">*/}
      {/*<nav style={{ display: 'flex', gap: 16, padding: 16 }}>*/}
      {/*  <NavLink to="/members">회원 관리</NavLink>*/}
      {/*  <NavLink to="/seats/setup">좌석 설정</NavLink>*/}
      {/*  <NavLink to="/seats/assign">좌석 배정</NavLink>*/}
      {/*</nav>*/}
      <main style={{ padding: 16 }}>
        <SidebarTrigger />
        <Outlet />
      </main>
      {/*</div>*/}
      <Toaster
        toastOptions={{
          style: {
            backgroundColor: '#364153',
            color: 'white',
          },
        }}
      />
    </SidebarProvider>
  );
}
