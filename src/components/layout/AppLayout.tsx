import { Suspense, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { signOut } from "@/services/auth";
import { useOrg } from "@/features/org/useOrg";
import { InstallBanner } from "@/features/pwa/InstallBanner";
import { FullPageSpinner } from "@/components/ui/spinner";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

/**
 * App shell: a fixed sidebar on desktop and an off-canvas drawer on mobile,
 * with a sticky top bar (search + create + notifications) in the content column.
 */
export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: org } = useOrg();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  const orgName = org?.orgName ?? "Workspace";
  const userName = org?.fullName ?? org?.email ?? "User";
  const userEmail = org?.email ?? "";

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        orgName={orgName}
        userName={userName}
        userEmail={userEmail}
        onSignOut={handleSignOut}
      />

      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onOpenMenu={() => setDrawerOpen(true)} />
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
