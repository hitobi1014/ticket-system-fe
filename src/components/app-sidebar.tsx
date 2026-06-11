import { Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar';
import { IconArmchair2, IconLayoutDashboard, IconUsers } from '@tabler/icons-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils.ts';
import { CustomTrigger } from '@/components/custom-trigger.tsx';

export function AppSidebar() {
  const menus = [
    { link: '/members', icon: <IconUsers stroke={2} />, text: '회원 관리' },
    { link: '/seats/setup', icon: <IconArmchair2 stroke={2} />, text: '좌석 설정' },
    { link: '/seats/assign', icon: <IconLayoutDashboard stroke={2} />, text: '좌석 배정' },
  ];
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-b-mist-500 border-r border-r-mist-500">
        <div className="flex items-center justify-between">
          <div className="secondary-color group-data-[collapsible=icon]:hidden">Orchestra</div>
          <CustomTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <nav className="flex flex-col gap-y-2 text-mist-300">
          {menus.map((menu) => (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'flex px-4 py-2 gap-x-2',
                  isActive ? 'main-bg-color border-r-2 border-r-mist-300' : '',
                )
              }
              key={menu.link}
              to={menu.link}
            >
              <span className="w-5 h-5 shrink-0">{menu.icon}</span>
              <span
                className="overflow-hidden whitespace-nowrap group-data-[collapsible=icon]:w-0
                group-data-[collapsible=icon]:opacity-0
                transition-all duration-200
              "
              >
                {menu.text}
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
