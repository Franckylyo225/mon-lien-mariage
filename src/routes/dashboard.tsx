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
import { Skeleton } from "@/components/ui/skeleton";

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
  
  "/dashboard/share": "Liens & Partages",
  "/dashboard/stats": "Statistiques RSVP",
  "/dashboard/billing": "Paiement & facture",
};

function DashboardLayout() {
  const { couple, ceremonies, account, loading, signOut } = useWedding();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    if (!account.isAuthenticated) return;
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
  }, [account.isAuthenticated]);

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
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setUserId(data.session?.user.id ?? null);
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
    return <DashboardSkeleton />;
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

  const { pct } = configProgress({ couple, ceremonies });
  const hasNotifications = pct < 100 || !couple.isPublished;

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

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 h-14 border-b border-border/70 bg-background/95">
        <div className="mx-auto flex h-full max-w-xl items-center justify-between gap-3 px-3 sm:px-5">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="size-9 shrink-0 rounded-full" />
        </div>
      </header>

      <main className="mx-auto max-w-xl space-y-7 px-4 pb-24 pt-4">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-[5px] w-full rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95">
        <div className="mx-auto flex h-16 max-w-xl items-center justify-around px-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="size-6 rounded-full" />
          ))}
        </div>
      </nav>
    </div>
  );
}

