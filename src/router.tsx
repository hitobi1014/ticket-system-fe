import { createBrowserRouter, Navigate } from 'react-router-dom';
import type { TablerIcon } from '@tabler/icons-react';
import MembersPage from '@/pages/MembersPage.tsx';
import FloorSetupPage from './pages/FloorSetupPage.tsx';
import SeatAssignPage from '@/pages/SeatAssignPage.tsx';
import Layout from '@/components/Layout.tsx';
import { IconSearch, IconArmchair2, IconLayoutDashboard, IconUsers } from '@tabler/icons-react';
import SeatFindPage from '@/pages/SeatFindPage.tsx';
import LoginPage from '@/pages/LoginPage.tsx';
import ProtectedRoute from '@/components/ProtectedRoute.tsx';

export interface NavRoute {
  path: string;
  title: string;
  Icon: TablerIcon;
  element: React.ReactNode;
  isPublic?: boolean;
}

export const navRoutes: NavRoute[] = [
  {
    path: '/members',
    title: '회원관리',
    Icon: IconUsers,
    element: <MembersPage />,
  },
  {
    path: '/seats/setup',
    title: '좌석설정',
    Icon: IconArmchair2,
    element: <FloorSetupPage />,
  },
  {
    path: '/seats/assign',
    title: '좌석배정',
    Icon: IconLayoutDashboard,
    element: <SeatAssignPage />,
  },
  {
    path: '/seats/find',
    title: '좌석찾기',
    Icon: IconSearch,
    element: <SeatFindPage />,
    isPublic: true,
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
        element: <Navigate to="/members" replace />,
      },
      {
        element: <ProtectedRoute />,
        children: protectedRoutes.map(({ path, title, Icon, element }) => ({
          path,
          element,
          handle: {
            title,
            icon: <Icon stroke={1.5} />,
          },
        })),
      },
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
