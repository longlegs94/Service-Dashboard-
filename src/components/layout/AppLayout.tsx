import { Suspense, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  Receipt,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "@/services/auth";
import { useSession } from "@/features/auth/useAuth";
import { InstallBanner } from "@/features/pwa/InstallBanner";
import { Button } from "@/components/ui/button";
import { FullPageSpinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/clients", label: "Clients", icon: Users },
  { to: "/app/jobs", label: "Jobs", icon: Briefcase },
  { to: "/app/calendar", label: "Calendar", icon: Calendar },
  { to: "/app/billing", label: "Billing", icon: Receipt },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;

/**
 * App shell: a sidebar on desktop and a slide-in drawer + bottom-safe header on
 * mobile. Mobile-first — the drawer is the primary navigation on phones.
 */
export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const session = useSession();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  const email = session?.user?.email ?? "";

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b px-4 py-3 md:hidden">
        <button
          aria-label="Open menu"
          onClick={() => setDrawerOpen(true)}
          className="rounded-md p-2 hover:bg-accent"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-semibold">Service Dashboard</span>
        <div className="w-9" />
      </header>

      {/* Sidebar / drawer */}
      <Sidebar
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        email={email}
        onSignOut={handleSignOut}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <InstallBanner />
        <main className="flex-1 p-4 md:p-8">
          <Suspense fallback={<FullPageSpinner />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function Sidebar({
  open,
  onClose,
  email,
  onSignOut,
}: {
  open: boolean;
  onClose: () => void;
  email: string;
  onSignOut: () => void;
}) {
  return (
    <>
      {/* Backdrop (mobile only) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <span className="text-lg font-semibold">Service Dashboard</span>
          <button
            aria-label="Close menu"
            onClick={onClose}
            className="rounded-md p-2 hover:bg-accent md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t p-3">
          {email && (
            <p className="mb-2 truncate px-2 text-xs text-muted-foreground">
              {email}
            </p>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={onSignOut}
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </Button>
        </div>
      </aside>
    </>
  );
}
