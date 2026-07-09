import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useWedding, configProgress } from "@/lib/wedding-store";
import { AppHeader } from "@/components/mobile-shell/AppHeader";
import { BottomNav } from "@/components/mobile-shell/BottomNav";
import { SideDrawer } from "@/components/mobile-shell/SideDrawer";
import { Fab } from "@/components/mobile-shell/Fab";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

const TITLES: Record<string, string> = {
  "/dashboard": "",
  "/dashboard/ceremonies": "Mes étapes",
  "/dashboard/guests": "Mes invités",
  "/dashboard/preview": "Aperçu de ma page",
  "/dashboard/landing": "Ma page",
  "/dashboard/invites": "Invitations",
};

function DashboardLayout() {
  const { couple, ceremonies, guests, account, loading, signOut } = useWedding();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!loading && !account.isAuthenticated) {
      navigate({ to: "/login", replace: true });
    }
  }, [loading, account.isAuthenticated, navigate]);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  if (loading || !account.isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-40">
          Chargement…
        </p>
      </div>
    );
  }

  const title =
    TITLES[pathname] ??
    (pathname.startsWith("/dashboard/ceremonies/") ? "Étape" : "");

  const initial =
    (couple.brideName || account.email || "?").trim()[0]?.toUpperCase() ?? "?";
  const coupleInitials = [couple.brideName, couple.groomName]
    .filter(Boolean)
    .map((n) => n.trim()[0]?.toUpperCase())
    .join("") || initial;
  const coupleLabel =
    couple.brideName && couple.groomName
      ? `${couple.brideName} & ${couple.groomName}`
      : couple.brideName || account.email || "Mon compte";

  const { pct } = configProgress({ couple, ceremonies, guests });
  const hasNotifications = pct < 100;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        title={title}
        initial={initial}
        onOpenDrawer={() => setDrawerOpen(true)}
        hasNotifications={hasNotifications}
      />

      <main className="mx-auto max-w-xl px-4 pb-24 pt-4">
        <Outlet />
      </main>

      <Fab />
      <BottomNav isPublished={couple.isPublished} />
      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        coupleLabel={coupleLabel}
        email={account.email}
        initials={coupleInitials}
        onSignOut={async () => {
          await signOut();
          navigate({ to: "/", replace: true });
        }}
      />
    </div>
  );
}
