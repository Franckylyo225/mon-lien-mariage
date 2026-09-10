import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { useWedding, configProgress } from "@/lib/wedding-store";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/mobile-shell/AppHeader";
import { BottomNav } from "@/components/mobile-shell/BottomNav";
import { SideDrawer } from "@/components/mobile-shell/SideDrawer";
import { Fab } from "@/components/mobile-shell/Fab";
import { EditModeProvider, useEditMode } from "@/lib/edit-mode";
import { PageChromeProvider, usePageChrome } from "@/lib/page-chrome";
import { AutosaveProvider } from "@/lib/autosave-context";
import { registerDashboardServiceWorker } from "@/components/pwa/pwa-install";

const InstallPrompt = lazy(() =>
  import("@/components/pwa/InstallPrompt").then((module) => ({ default: module.InstallPrompt })),
);

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { name: "theme-color", content: "#E82050" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "MonInvit" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/icons/apple-touch-icon-180.png" },
    ],
  }),
  component: DashboardLayout,
});


const TITLES: Record<string, string> = {
  "/dashboard": "",
  "/dashboard/events": "Mes événements",
  "/dashboard/ceremonies": "Mes étapes",
  "/dashboard/guests": "Mes invités",
  "/dashboard/preview": "Aperçu de ma page",
  
  "/dashboard/invites": "Invitations",
  "/dashboard/share": "Liens & Partages",
  "/dashboard/stats": "Statistiques RSVP",
  "/dashboard/billing": "Paiement & facture",
};

function DashboardLayout() {
  const { couple, ceremonies, guests, account, loading, signOut } = useWedding();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    void registerDashboardServiceWorker();
    const schedule = window.requestIdleCallback
      ? window.requestIdleCallback(() => setShowInstallPrompt(true), { timeout: 2500 })
      : window.setTimeout(() => setShowInstallPrompt(true), 1500);
    return () => {
      if (window.cancelIdleCallback && typeof schedule === "number") {
        window.cancelIdleCallback(schedule);
      } else {
        window.clearTimeout(schedule);
      }
    };
  }, []);

  useEffect(() => {
    if (!loading && !account.isAuthenticated) {
      navigate({ to: "/login", replace: true });
    }
  }, [loading, account.isAuthenticated, navigate]);

  useEffect(() => {
    if (!account.isAuthenticated) {
      setUserId(null);
      return;
    }
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setUserId(data.user?.id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [account.isAuthenticated]);

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
    <EditModeProvider>
      <AutosaveProvider>
        <PageChromeProvider>
          <DashboardChrome
            title={title}
            initial={initial}
            coupleInitials={coupleInitials}
            coupleLabel={coupleLabel}
            email={account.email}
            userId={userId}
            hasNotifications={hasNotifications}
            isPublished={couple.isPublished}
            drawerOpen={drawerOpen}
            setDrawerOpen={setDrawerOpen}
            showInstallPrompt={showInstallPrompt}
            onSignOut={async () => {
              await signOut();
              navigate({ to: "/", replace: true });
            }}
          />


        </PageChromeProvider>
      </AutosaveProvider>
    </EditModeProvider>
  );
}


function DashboardChrome({
  title,
  initial,
  coupleInitials,
  coupleLabel,
  email,
  userId,
  hasNotifications,
  isPublished,
  drawerOpen,
  setDrawerOpen,
  showInstallPrompt,
  onSignOut,
}: {
  title: string;
  initial: string;
  coupleInitials: string;
  coupleLabel: string;
  email: string | null;
  userId: string | null;
  hasNotifications: boolean;
  isPublished: boolean;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
  showInstallPrompt: boolean;
  onSignOut: () => Promise<void>;
}) {

  const { mode } = useEditMode();
  const { centerNode, actionBarNode } = usePageChrome();
  const editing = mode === "edit";

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        title={title}
        initial={initial}
        onOpenDrawer={() => setDrawerOpen(true)}
        hasNotifications={hasNotifications}
        userId={userId}
        centerContent={centerNode}
      />

      {actionBarNode}

      <main className={`mx-auto max-w-xl px-4 pt-4 ${editing ? "pb-4" : "pb-24"}`}>
        <Outlet />
      </main>

      {!editing && <Fab />}
      {!editing && <BottomNav isPublished={isPublished} />}
      {!editing && showInstallPrompt ? (
        <Suspense fallback={null}>
          <InstallPrompt />
        </Suspense>
      ) : null}
      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
        coupleLabel={coupleLabel}
        email={email}
        initials={coupleInitials}
        onSignOut={onSignOut}
        userId={userId}
      />

    </div>
  );
}

