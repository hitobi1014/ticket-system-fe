import * as React from 'react';
import { IconLogout, IconMenu2 } from '@tabler/icons-react';
import useAuthStore from '@/store/authStore.ts';
import useLogout from '@/hooks/use-logout.ts';
import UserBadge from '@/components/common/UserBadge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useSidebar } from '@/components/ui/sidebar';

interface PageHeaderProps {
  title: string;
  icon: React.ReactNode;
}

export default function PageHeader({ title, icon }: PageHeaderProps) {
  const { isAuthenticated, currentMember } = useAuthStore();
  const { toggleSidebar } = useSidebar();
  const handleLogout = useLogout();

  return (
    <div className="bg-card border-accent flex justify-between border-b px-4 py-2.5">
      <div className="flex items-center gap-x-2">
        {/* 모바일: 사이드바(드로어) 열기. 사용자 정보/로그아웃은 드로어 하단에 있다 */}
        {isAuthenticated && (
          <Button
            variant="ghost"
            size="icon"
            className="text-primary -ml-2 md:hidden"
            aria-label="메뉴 열기"
            onClick={toggleSidebar}
          >
            <IconMenu2 stroke={1.5} className="size-5" />
          </Button>
        )}
        <div className="text-primary">{icon}</div>
        <h2 className="text-primary text-lg font-medium">{title}</h2>
      </div>
      {isAuthenticated && (
        <div className="hidden items-center gap-x-3 md:flex">
          {currentMember && <UserBadge member={currentMember} />}
          <div
            className="text-primary flex cursor-pointer items-center gap-x-2"
            onClick={handleLogout}
          >
            <IconLogout stroke={2} />
            로그아웃
          </div>
        </div>
      )}
    </div>
  );
}
