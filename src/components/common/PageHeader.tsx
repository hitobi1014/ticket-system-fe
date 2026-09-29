import * as React from 'react';
import { IconLogout } from '@tabler/icons-react';
import useAuthStore from '@/store/authStore.ts';
import { Badge } from '@/components/ui/badge.tsx';

interface PageHeaderProps {
  title: string;
  icon: React.ReactNode;
}

export default function PageHeader({ title, icon }: PageHeaderProps) {
  const { logout, isAuthenticated, currentMember } = useAuthStore();
  return (
    <div className="bg-card border-accent flex justify-between border-b px-4 py-2.5">
      <div className="flex items-center gap-x-2">
        <div className="text-primary">{icon}</div>
        <h2 className="text-primary text-lg font-medium">{title}</h2>
      </div>
      {isAuthenticated && (
        <div className="flex items-center gap-x-3">
          {currentMember && (
            <div className="flex items-center gap-x-2">
              <div
                className="h-4 w-4 rounded-full border border-mist-300"
                style={{ backgroundColor: currentMember.color || '#999' }}
                title={`${currentMember.name}님의 색상`}
              />
              <Badge className="bg-accent-foreground text-text-foreground">
                {currentMember.name} / {currentMember.instrumentAbbr}
              </Badge>
            </div>
          )}
          <div className="text-primary flex cursor-pointer items-center gap-x-2" onClick={logout}>
            <IconLogout stroke={2} />
            로그아웃
          </div>
        </div>
      )}
    </div>
  );
}
