import { useSidebar } from '@/components/ui/sidebar';
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarRightCollapse } from '@tabler/icons-react';

export function CustomTrigger() {
  const { toggleSidebar, open } = useSidebar();

  return (
    <button className="absolute -right-7 top-4 z-10" onClick={toggleSidebar}>
      {open ? (
        <IconLayoutSidebarLeftCollapse className="size-8 text-main-color" stroke={2} />
      ) : (
        <IconLayoutSidebarRightCollapse className="size-8 text-main-color" stroke={2} />
      )}
    </button>
  );
}
