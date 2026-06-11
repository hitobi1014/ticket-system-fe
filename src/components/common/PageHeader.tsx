import * as React from 'react';
import { CustomTrigger } from '@/components/custom-trigger.tsx';

interface PageHeaderProps {
  title: string;
  icon: React.ReactNode;
}

export default function PageHeader({ title, icon }: PageHeaderProps) {
  return (
    <div className="flex secondary-bg items-center gap-x-2 border-b border-mist-500 py-4 mb-4">
      <div className="primary-color">{icon}</div>
      <h2 className="primary-color text-lg font-medium">{title}</h2>
    </div>
  );
}
