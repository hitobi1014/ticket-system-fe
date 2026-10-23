import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { IconLogout, IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/button.tsx';
import UserBadge from '@/components/common/UserBadge.tsx';
import useLogout from '@/hooks/use-logout.ts';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils.ts';
import { CustomTrigger } from '@/components/custom-trigger.tsx';
import { type NavRoute, navRoutes } from '@/router.tsx';
import useAuthStore from '@/store/authStore';

export function AppSidebar() {
  const { isAuthenticated, currentMember } = useAuthStore();
  const { isMobile, setOpenMobile } = useSidebar();
  const handleLogout = useLogout();

  const isRouteVisible = (route: NavRoute) => {
    // 공개 메뉴는 항상 표시
    if (route.isPublic) return true;
    // 로그인 안 했으면 비공개 메뉴 숨김
    if (!isAuthenticated) return false;
    // requiredRole이 없으면 모든 로그인 사용자에게 표시
    if (!route.requiredRole) return true;
    // requiredRole이 있으면 role 체크
    return currentMember?.role === route.requiredRole;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b-accent border-r-accent border-r border-b">
        <div className="flex items-center justify-between">
          <div className="text-primary group-data-[collapsible=icon]:hidden">Orchestra</div>
          {isMobile ? (
            <Button
              variant="ghost"
              size="icon"
              className="text-primary"
              aria-label="메뉴 닫기"
              onClick={() => setOpenMobile(false)}
            >
              <IconX stroke={1.5} className="size-5" />
            </Button>
          ) : (
            <CustomTrigger />
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <nav className="text-primary flex flex-col gap-y-2">
          {navRoutes.filter(isRouteVisible).map(({ path, title, Icon }) => (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'flex gap-x-2 px-4',
                  isMobile ? 'py-3' : 'py-2',
                  isActive ? 'main-bg-color border-r-2 border-r-mist-300' : '',
                )
              }
              key={path}
              to={path}
              onClick={() => setOpenMobile(false)}
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
      {/* 모바일: 헤더에 자리가 없는 사용자 정보/로그아웃을 하단에 표시 */}
      {isMobile && isAuthenticated && (
        <SidebarFooter className="border-t-accent flex flex-col gap-y-3 border-t">
          {currentMember && <UserBadge member={currentMember} />}
          <Button variant="dialog" size="base" onClick={handleLogout}>
            <IconLogout stroke={2} />
            로그아웃
          </Button>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
