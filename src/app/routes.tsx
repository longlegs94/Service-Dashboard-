import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "@/features/auth/LoginPage";
import { AuthCallback } from "@/features/auth/AuthCallback";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { ClientsPage } from "@/features/clients/ClientsPage";
import { JobsPage } from "@/features/jobs/JobsPage";
import { CalendarPage } from "@/features/calendar/CalendarPage";
import { BillingPage } from "@/features/billing/BillingPage";
import { SettingsPage } from "@/features/settings/SettingsPage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/app/dashboard" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/auth/callback", element: <AuthCallback /> },
  {
    path: "/app",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/app/dashboard" replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "clients", element: <ClientsPage /> },
          { path: "jobs", element: <JobsPage /> },
          { path: "calendar", element: <CalendarPage /> },
          { path: "billing", element: <BillingPage /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/app/dashboard" replace /> },
]);
