import { cn } from '@/lib/utils.ts';

export const headerTitleClass = cn('text-primary text-lg font-semibold');

export const pageContentClass = cn('px-6 py-4');

export const seatSectionClass = cn(
  'hover:border-primary flex flex-col gap-y-2 rounded-md border border-transparent p-4 hover:border-dashed',
);
export const selectedSectionClass = cn('ring-primary hover:border-transparent ring-2');

export const emptySeatClass = cn('text-primary bg-transparent text-sm border-primary border');

export const hideSeatClass = cn('pointer-events-none border-0 bg-transparent text-transparent');
