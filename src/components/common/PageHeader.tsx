import * as React from 'react';

interface PageHeaderProps {
  title: string;
  icon: React.ReactNode;
}

export default function PageHeader({ title, icon }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-x-2 border-b border-mist-500 pb-4 mb-4">
      <div className="primary-color">{icon}</div>
      <h2 className="primary-color text-lg font-medium">{title}</h2>
    </div>
  );
}
