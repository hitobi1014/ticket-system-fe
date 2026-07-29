import { Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils.ts';
import { CustomTrigger } from '@/components/custom-trigger.tsx';
import { navRoutes } from '@/router.tsx';
import useAuthStore from '@/store/authStore';

export function AppSidebar() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b-accent border-r-accent border-r border-b">
        <div className="flex items-center justify-between">
          <div className="text-primary group-data-[collapsible=icon]:hidden">Orchestra</div>
          <CustomTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <nav className="text-primary flex flex-col gap-y-2">
          {navRoutes
            .filter(({ isPublic }) => isPublic || isAuthenticated)
            .map(({ path, title, Icon }) => (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'flex gap-x-2 px-4 py-2',
                    isActive ? 'main-bg-color border-r-2 border-r-mist-300' : '',
                  )
                }
                key={path}
                to={path}
              >
                <span className="h-5 w-5 shrink-0">
                  <Icon stroke={2} />
                </span>
                <span className="overflow-hidden whitespace-nowrap transition-all duration-200 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
                  {title}
                </span>
              </NavLink>
            ))}
        </nav>
      </SidebarContent>
      {/*푸터 필요하면 사용*/}
      {/*<SidebarFooter>*/}
      {/*  <div>푸터테스트</div>*/}
      {/*</SidebarFooter>*/}
    </Sidebar>
  );
}
