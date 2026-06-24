import { Outlet, useMatches } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner.tsx';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import * as React from 'react';
import { useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader.tsx';
import useFloorStore from '@/store/floorStore.ts';
import useMemberStore from '@/store/memberStore.ts';
import { toast } from 'sonner';

export default function Layout() {
  const matches = useMatches();
  const { fetchVenue, fetchFloor } = useFloorStore();
  const { fetchMembers } = useMemberStore();

  useEffect(() => {
    const fetch = async () => {
      try {
        await Promise.all([fetchVenue(), fetchMembers(), fetchFloor()]);
      } catch (e) {
        const message = e instanceof Error ? e.message : '데이터를 불러오는데 실패했습니다.';
        toast.error(message);
      }
    };
    fetch();
  }, []);
  const currentHandle = matches[matches.length - 1]?.handle as
    | {
        title: string;
        icon: React.ReactNode;
      }
    | undefined;

  return (
    <SidebarProvider className="bg-surface-primary h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 flex overflow-hidden">
        {/* max-w-350 => 1400px */}
        <div className="w-full mx-auto flex flex-col flex-1 overflow-hidden">
          {currentHandle && <PageHeader title={currentHandle.title} icon={currentHandle.icon} />}
          <div className="flex-1 overflow-hidden px-6 py-4">
            <Outlet /> {/* Outlet 감싸는 div 추가 */}
          </div>
        </div>
      </main>
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
