import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  Receipt,
  UsersRound,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/clients", label: "Clients", icon: Users },
  { to: "/app/jobs", label: "Jobs", icon: Briefcase },
  { to: "/app/calendar", label: "Schedule", icon: Calendar },
  { to: "/app/billing", label: "Billing", icon: Receipt },
  { to: "/app/team", label: "Team", icon: UsersRound },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;

/** Compute up to two uppercase initials from a name (falls back to "?"). */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** A rounded-square avatar showing initials, primary-tinted. */
function Avatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold",
        className,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  orgName: string;
  userName: string;
  userEmail: string;
  onSignOut: () => void;
}

export function Sidebar({
  open,
  onClose,
  orgName,
  userName,
  userEmail,
  onSignOut,
}: SidebarProps) {
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
        {/* Workspace header */}
        <div className="flex items-center gap-3 border-b px-4 py-4">
          <Avatar name={orgName} className="h-9 w-9 text-sm" />
          <span className="flex-1 truncate text-base font-semibold">
            {orgName}
          </span>
          <button
            aria-label="Close menu"
            onClick={onClose}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t p-3">
          <div className="flex items-center gap-3 px-1 py-2">
            <Avatar name={userName} className="h-9 w-9 text-sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{userName}</p>
              {userEmail && (
                <p className="truncate text-xs text-muted-foreground">
                  {userEmail}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            className="mt-1 w-full justify-start text-muted-foreground"
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
