import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner.tsx';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

export default function Layout() {
  return (
    <SidebarProvider className="primary-bg h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 flex justify-center px-10 overflow-hidden">
        {/* max-w-350 => 1400px */}
        <div className="w-full max-w-350 py-6 overflow-hidden">
          <Outlet />
        </div>
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
