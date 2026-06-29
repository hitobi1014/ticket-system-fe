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
    <div className="flex justify-between bg-surface-secondary border-b border-surface-accent  py-2.5 px-4">
      <div className="flex items-center gap-x-2">
        <div className="text-content-primary">{icon}</div>
        <h2 className="text-content-primary text-lg font-medium">{title}</h2>
      </div>
      {isAuthenticated && (
        <div
          className="flex items-center gap-x-2 text-content-primary cursor-pointer"
          onClick={logout}
        >
          <IconLogout stroke={2} />
          로그아웃
        </div>
      )}
    </div>
  );
}
