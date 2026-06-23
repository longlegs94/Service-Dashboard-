import { lazy, type ComponentType } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "@/features/auth/LoginPage";
import { AuthCallback } from "@/features/auth/AuthCallback";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { ClientsPage } from "@/features/clients/ClientsPage";
import { ClientFormPage } from "@/features/clients/ClientFormPage";
import { ClientDetailPage } from "@/features/clients/ClientDetailPage";
import { JobsPage } from "@/features/jobs/JobsPage";
import { JobFormPage } from "@/features/jobs/JobFormPage";
import { JobDetailPage } from "@/features/jobs/JobDetailPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { TeamPage } from "@/features/team/TeamPage";
import { SearchPage } from "@/features/search/SearchPage";

// Code-split the heavy routes so the initial mobile load stays lean.
// FullCalendar (calendar) and the billing screens load on demand.
function lazyNamed<P = Record<string, never>>(
  loader: () => Promise<Record<string, unknown>>,
  key: string,
) {
  return lazy(async () => ({
    default: (await loader())[key] as ComponentType<P>,
  }));
}

type FormMode = { mode: "new" | "edit" };

const CalendarPage = lazyNamed(
  () => import("@/features/calendar/CalendarPage"),
  "CalendarPage",
);
const BillingPage = lazyNamed(
  () => import("@/features/billing/BillingPage"),
  "BillingPage",
);
const InvoicesListPage = lazyNamed(
  () => import("@/features/billing/InvoicesListPage"),
  "InvoicesListPage",
);
const InvoiceFormPage = lazyNamed<FormMode>(
  () => import("@/features/billing/InvoiceFormPage"),
  "InvoiceFormPage",
);
const InvoiceDetailPage = lazyNamed(
  () => import("@/features/billing/InvoiceDetailPage"),
  "InvoiceDetailPage",
);
const QuotesListPage = lazyNamed(
  () => import("@/features/billing/QuotesListPage"),
  "QuotesListPage",
);
const QuoteFormPage = lazyNamed<FormMode>(
  () => import("@/features/billing/QuoteFormPage"),
  "QuoteFormPage",
);
const QuoteDetailPage = lazyNamed(
  () => import("@/features/billing/QuoteDetailPage"),
  "QuoteDetailPage",
);
const ReceivablesPage = lazyNamed(
  () => import("@/features/billing/ReceivablesPage"),
  "ReceivablesPage",
);

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
          { path: "clients/new", element: <ClientFormPage mode="new" /> },
          { path: "clients/:id", element: <ClientDetailPage /> },
          { path: "clients/:id/edit", element: <ClientFormPage mode="edit" /> },
          { path: "jobs", element: <JobsPage /> },
          { path: "jobs/new", element: <JobFormPage mode="new" /> },
          { path: "jobs/:id", element: <JobDetailPage /> },
          { path: "jobs/:id/edit", element: <JobFormPage mode="edit" /> },
          { path: "calendar", element: <CalendarPage /> },
          { path: "billing", element: <BillingPage /> },
          { path: "billing/invoices", element: <InvoicesListPage /> },
          { path: "billing/invoices/new", element: <InvoiceFormPage mode="new" /> },
          { path: "billing/invoices/:id", element: <InvoiceDetailPage /> },
          { path: "billing/invoices/:id/edit", element: <InvoiceFormPage mode="edit" /> },
          { path: "billing/quotes", element: <QuotesListPage /> },
          { path: "billing/quotes/new", element: <QuoteFormPage mode="new" /> },
          { path: "billing/quotes/:id", element: <QuoteDetailPage /> },
          { path: "billing/quotes/:id/edit", element: <QuoteFormPage mode="edit" /> },
          { path: "billing/receivables", element: <ReceivablesPage /> },
          { path: "settings", element: <SettingsPage /> },
          { path: "team", element: <TeamPage /> },
          { path: "search", element: <SearchPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/app/dashboard" replace /> },
]);
