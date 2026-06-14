import * as React from 'react';

interface PageHeaderProps {
  title: string;
  icon: React.ReactNode;
}

export default function PageHeader({ title, icon }: PageHeaderProps) {
  return (
    <div className="flex bg-surface-secondary items-center gap-x-2 border-b border-mist-500  py-2.5 pl-4">
      <div className="text-content-primary">{icon}</div>
      <h2 className="text-content-primary text-lg font-medium">{title}</h2>
    </div>
  );
}
