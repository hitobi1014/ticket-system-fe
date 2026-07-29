import { useSidebar } from '@/components/ui/sidebar';
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarRightCollapse } from '@tabler/icons-react';
import { Button } from '@/components/ui/button.tsx';

export function CustomTrigger() {
  const { toggleSidebar, open } = useSidebar();

  return (
    <Button className="text-primary p-1" onClick={toggleSidebar}>
      {open ? (
        <IconLayoutSidebarLeftCollapse className="size-6 text-primary" stroke={1.25} />
      ) : (
        <IconLayoutSidebarRightCollapse className="size-6 text-primary" stroke={1.25} />
      )}
    </Button>
  );
}
