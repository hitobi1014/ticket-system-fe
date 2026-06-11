import { createBrowserRouter, Navigate } from 'react-router-dom';
import MembersPage from '@/pages/MembersPage.tsx';
import FloorSetupPage from './pages/FloorSetupPage.tsx';
import SeatAssignPage from '@/pages/SeatAssignPage.tsx';
import Layout from '@/components/Layout.tsx';
import { IconArmchair2, IconLayoutDashboard, IconUsers } from '@tabler/icons-react';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Navigate to="/members" replace />,
      },
      {
        path: '/members',
        element: <MembersPage />,
        handle: {
          title: '회원관리',
          icon: <IconUsers stroke={1.5} />,
        },
      },
      {
        path: '/seats/setup',
        element: <FloorSetupPage />,
        handle: {
          title: '좌석설정',
          icon: <IconArmchair2 stroke={1.5} />,
        },
      },
      {
        path: '/seats/assign',
        element: <SeatAssignPage />,
        handle: {
          title: '좌석배정',
          icon: <IconLayoutDashboard stroke={1.5} />,
        },
      },
    ],
  },
]);

export default router;
