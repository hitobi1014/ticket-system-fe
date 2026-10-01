import { Outlet, useMatches } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner.tsx';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import * as React from 'react';
import { useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader.tsx';
import useFloorStore from '@/store/floorStore.ts';
import useMemberStore from '@/store/memberStore.ts';
import useVenueStore from '@/store/venueStore.ts';
import useAuthStore from '@/store/authStore';
import { toast } from 'sonner';

export default function Layout() {
  const matches = useMatches();
  const { fetchFloor } = useFloorStore();
  const { fetchVenue } = useVenueStore();
  const { fetchMembers } = useMemberStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetch = async () => {
      try {
        await Promise.all([fetchVenue(), fetchMembers(), fetchFloor()]);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '데이터를 불러오는데 실패했습니다.');
      }
    };
    fetch();
  }, [isAuthenticated]);
  const currentHandle = matches[matches.length - 1]?.handle as
    | {
        title: string;
        icon: React.ReactNode;
      }
    | undefined;

  return (
    <SidebarProvider className="bg-background h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex flex-1 overflow-hidden">
        {/* max-w-350 => 1400px */}
        <div className="mx-auto flex w-full flex-1 flex-col overflow-hidden">
          {currentHandle && <PageHeader title={currentHandle.title} icon={currentHandle.icon} />}
          {/* TODO 아래 코드 삭제하기 */}
          {/*<div className="flex-1 overflow-hidden px-6 py-4">*/}
          <Outlet /> {/* Outlet 감싸는 div 추가 */}
          {/*</div>*/}
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
