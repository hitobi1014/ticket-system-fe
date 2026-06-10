import { useSidebar } from '@/components/ui/sidebar';
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarRightCollapse } from '@tabler/icons-react';

export function CustomTrigger() {
  const { toggleSidebar, open } = useSidebar();

  return (
    <button className="absolute -right-7 top-3 z-10 cursor-pointer" onClick={toggleSidebar}>
      {open ? (
        <IconLayoutSidebarLeftCollapse className="size-8 primary-color" stroke={1.25} />
      ) : (
        <IconLayoutSidebarRightCollapse className="size-8 primary-color" stroke={1.25} />
      )}
    </button>
  );
}
