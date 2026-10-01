import { useSidebar } from '@/components/ui/sidebar';
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarRightCollapse } from '@tabler/icons-react';
import { Button } from '@/components/ui/button.tsx';

export function CustomTrigger() {
  const { toggleSidebar, open } = useSidebar();

  return (
    <Button variant="outline" className="text-primary p-1" onClick={toggleSidebar}>
      {open ? (
        <IconLayoutSidebarLeftCollapse className="text-primary size-6" stroke={1.25} />
      ) : (
        <IconLayoutSidebarRightCollapse className="text-primary size-6" stroke={1.25} />
      )}
    </Button>
  );
}
