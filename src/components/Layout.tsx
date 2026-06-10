import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner.tsx';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

export default function Layout() {
  return (
    <SidebarProvider className="main-bg-color">
      <AppSidebar />
      <main className="px-8 py-4">
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
