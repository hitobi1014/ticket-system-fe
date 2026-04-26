import { createBrowserRouter, Navigate } from "react-router-dom";
import MembersPage from "@/pages/MembersPage.tsx";
import SeatSetupPage from "@/pages/SeatSetupPage.tsx";
import SeatAssignPage from "@/pages/SeatAssignPage.tsx";
import Layout from "@/components/Layout.tsx";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Navigate to="/members" replace /> },
      { path: "/members", element: <MembersPage /> },
      { path: "/seats/setup", element: <SeatSetupPage /> },
      { path: "/seats/assign", element: <SeatAssignPage /> },
    ],
  },
]);

export default router;
