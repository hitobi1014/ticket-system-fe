import { Spinner } from '@/components/ui/spinner.tsx';

interface Props {
  text: string;
}

export default function AppSpinner({ text }: Props) {
  return (
    <div className="flex flex-1 w-full h-full items-center justify-center">
      <span className="flex items-center justify-center text-content-primary gap-2 px-6 py-4 text-xl">
        <Spinner data-icon="inline-start" className="text-content-primary size-6" />
        {text}
      </span>
    </div>
  );
}
