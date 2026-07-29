import * as React from 'react';
import { IconLogout } from '@tabler/icons-react';
import useAuthStore from '@/store/authStore.ts';

interface PageHeaderProps {
  title: string;
  icon: React.ReactNode;
}

export default function PageHeader({ title, icon }: PageHeaderProps) {
  const { logout, isAuthenticated } = useAuthStore();
  return (
    <div className="bg-card border-accent flex justify-between border-b px-4 py-2.5">
      <div className="flex items-center gap-x-2">
        <div className="text-primary">{icon}</div>
        <h2 className="text-primary text-lg font-medium">{title}</h2>
      </div>
      {isAuthenticated && (
        <div className="text-primary flex cursor-pointer items-center gap-x-2" onClick={logout}>
          <IconLogout stroke={2} />
          로그아웃
        </div>
      )}
    </div>
  );
}
