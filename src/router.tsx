import { createBrowserRouter, Navigate } from 'react-router-dom';
import MembersPage from '@/pages/MembersPage.tsx';
import FloorSetupPage from './pages/FloorSetupPage.tsx';
import SeatAssignPage from '@/pages/SeatAssignPage.tsx';
import Layout from '@/components/Layout.tsx';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Navigate to="/members" replace /> },
      { path: '/members', element: <MembersPage /> },
      { path: '/seats/setup', element: <FloorSetupPage /> },
      { path: '/seats/assign', element: <SeatAssignPage /> },
    ],
  },
]);

export default router;
