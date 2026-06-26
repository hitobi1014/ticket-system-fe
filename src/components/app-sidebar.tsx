import { Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils.ts';
import { CustomTrigger } from '@/components/custom-trigger.tsx';
import { navRoutes } from '@/router.tsx';
import useAuthStore from '@/store/authStore';

export function AppSidebar() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Sidebar collapsible="icon" className="bg-surface-secondary">
      <SidebarHeader className="border-b border-b-surface-accent border-r border-r-surface-accent">
        <div className="flex items-center justify-between">
          <div className="text-content-secondary group-data-[collapsible=icon]:hidden">
            Orchestra
          </div>
          <CustomTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <nav className="flex flex-col gap-y-2 text-content-secondary">
          {navRoutes
            .filter(({ isPublic }) => isPublic || isAuthenticated)
            .map(({ path, title, Icon }) => (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'flex px-4 py-2 gap-x-2',
                    isActive ? 'main-bg-color border-r-2 border-r-mist-300' : '',
                  )
                }
                key={path}
                to={path}
              >
                <span className="w-5 h-5 shrink-0">
                  <Icon stroke={2} />
                </span>
                <span
                  className="overflow-hidden whitespace-nowrap group-data-[collapsible=icon]:w-0
                  group-data-[collapsible=icon]:opacity-0
                  transition-all duration-200
                "
                >
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
