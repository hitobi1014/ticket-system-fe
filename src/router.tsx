import { createBrowserRouter } from 'react-router-dom';
import type { TablerIcon } from '@tabler/icons-react';
import { IconArmchair2, IconLayoutDashboard, IconSearch, IconUsers } from '@tabler/icons-react';
import MembersPage from '@/pages/MembersPage.tsx';
import FloorSetupPage from './pages/FloorSetupPage.tsx';
import SeatAssignPage from '@/pages/SeatAssignPage.tsx';
import Layout from '@/components/Layout.tsx';
import SeatViewPage from './pages/SeatViewPage.tsx';
import LoginPage from '@/pages/LoginPage.tsx';
import ProtectedRoute from '@/components/ProtectedRoute.tsx';
import type { MemberRole } from '@/types';
import RoleBasedRedirect from '@/components/RoleBasedRedirect.tsx';

export interface NavRoute {
  path: string;
  title: string;
  Icon: TablerIcon;
  element: React.ReactNode;
  isPublic?: boolean;
  requiredRole?: MemberRole;
}

export const navRoutes: NavRoute[] = [
  {
    path: '/members',
    title: '회원관리',
    Icon: IconUsers,
    element: <MembersPage />,
    requiredRole: 'ADMIN',
  },
  {
    path: '/seats/setup',
    title: '좌석설정',
    Icon: IconArmchair2,
    element: <FloorSetupPage />,
    requiredRole: 'ADMIN',
  },
  {
    path: '/seats/assign',
    title: '좌석배정',
    Icon: IconLayoutDashboard,
    element: <SeatAssignPage />,
    requiredRole: 'ADMIN',
  },
  {
    path: '/seats/view',
    title: '좌석안내',
    Icon: IconSearch,
    element: <SeatViewPage />,
    // requiredRole 미지정 = 로그인만 필요 (ROLE 무관)
  },
];

const protectedRoutes = navRoutes.filter((r) => !r.isPublic);
const publicRoutes = navRoutes.filter((r) => r.isPublic);

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <RoleBasedRedirect />,
      },
      ...protectedRoutes.map(({ path, title, Icon, element, requiredRole }) => ({
        path,
        element: <ProtectedRoute requiredRole={requiredRole} />,
        children: [
          {
            index: true,
            element,
            handle: {
              title,
              icon: <Icon stroke={1.5} />,
            },
          },
        ],
      })),
      ...publicRoutes.map(({ path, title, Icon, element }) => ({
        path,
        element,
        handle: {
          title,
          icon: <Icon stroke={1.5} />,
        },
      })),
    ],
  },
]);

export default router;
