import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState, type CSSProperties } from "react";
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
import { cn } from "@/lib/utils";

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

/**
 * Space the floating bottom bar reserves on an immersive page: the bar itself
 * (action dock or edit chip bar — only ever one at a time), its gutter and the
 * device inset. Exposed as `--page-dock-h` so page content can clear it
 * without measuring anything.
 */
const PAGE_DOCK_HEIGHT = "calc(4rem + 0.75rem + env(safe-area-inset-bottom))";

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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
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
      setAvatarUrl(null);
      return;
    }
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setUserId(data.session?.user.id ?? null);
      const meta = data.session?.user.user_metadata as
        { avatar_url?: string; picture?: string } | undefined;
      setAvatarUrl(meta?.avatar_url ?? meta?.picture ?? null);
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

  const title = TITLES[pathname] ?? (pathname.startsWith("/dashboard/ceremonies/") ? "Étape" : "");

  const initial = (couple.brideName || account.email || "?").trim()[0]?.toUpperCase() ?? "?";
  const coupleInitials =
    [couple.brideName, couple.groomName]
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
            avatarUrl={avatarUrl}
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
  avatarUrl,
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
  avatarUrl: string | null;
  hasNotifications: boolean;
  isPublished: boolean;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
  showInstallPrompt: boolean;
  onSignOut: () => Promise<void>;
}) {
  const { mode } = useEditMode();
  const { centerNode, actionBarNode, options } = usePageChrome();
  const navigate = useNavigate();
  const editing = mode === "edit";
  // Immersive routes (the page editor) drop the tab bar entirely and trade the
  // drawer avatar for a back button, in both preview and edit mode.
  const immersive = !!options.hideBottomNav;
  const showNav = !editing && !immersive;

  return (
    <div
      className="min-h-screen bg-background"
      style={actionBarNode ? ({ "--page-dock-h": PAGE_DOCK_HEIGHT } as CSSProperties) : undefined}
    >
      <AppHeader
        title={title}
        initial={initial}
        onOpenDrawer={() => setDrawerOpen(true)}
        hasNotifications={hasNotifications}
        userId={userId}
        avatarUrl={avatarUrl}
        centerContent={centerNode}
        onBack={options.backTo ? () => navigate({ to: options.backTo! }) : undefined}
        backLabel={options.backLabel}
      />

      <main
        className={cn(
          "mx-auto max-w-xl px-4 pt-6",
          actionBarNode ? "pb-0" : editing ? "pb-4" : "pb-24",
        )}
      >
        <Outlet />
      </main>

      {actionBarNode}

      {showNav && <Fab />}
      {showNav && <BottomNav isPublished={isPublished} />}
      {!editing && !immersive && showInstallPrompt ? (
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

/** Mirrors AppHeader: avatar circle, centered title, notification bell. */
function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border/70 bg-background/95">
      <div className="mx-auto flex h-full max-w-xl items-center justify-between gap-3 px-3 sm:px-5">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <Skeleton className="h-3 w-28" />
        <Skeleton className="size-9 shrink-0 rounded-full" />
      </div>
    </header>
  );
}

/** Mirrors StatusPanel: centered names + date, then a 3-column stat row. */
function StatusPanelSkeleton() {
  return (
    <section className="rounded-xl border border-border bg-gradient-to-b from-secondary/50 to-card px-3 pb-4 pt-5">
      <div className="flex flex-col items-center gap-1.5">
        <Skeleton className="h-[26px] w-44" />
        <Skeleton className="h-3 w-28" />
      </div>
      <div className="mt-4 grid grid-cols-3 divide-x divide-border/70 border-t border-border/70 pt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex min-w-0 flex-col items-center px-1.5">
            <div className="flex h-12 w-full flex-col items-center justify-center">
              <Skeleton className="h-7 w-10" />
            </div>
            <Skeleton className="mt-1.5 h-3 w-16" />
          </div>
        ))}
      </div>
    </section>
  );
}

/** Mirrors an "À compléter" row: icon badge, two text lines, status pill, chevron. */
function TodoRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-5 w-12 shrink-0 rounded-full" />
    </div>
  );
}

/** Mirrors the "Publier et partager" CTA block. */
function PublishCtaSkeleton() {
  return <Skeleton className="h-[76px] w-full rounded-2xl" />;
}

/** Mirrors BottomNav: 4 tabs (Accueil, Programme, Invités, Ma page). */
function BottomNavSkeleton() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95">
      <div className="mx-auto flex h-16 max-w-xl items-stretch justify-around px-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center justify-center gap-1">
            <Skeleton className="size-[22px] rounded-full" />
            <Skeleton className="h-2 w-8 rounded-full" />
          </div>
        ))}
      </div>
    </nav>
  );
}

/** Full dashboard-home loading state, matching the current chrome + StatusPanel architecture. */
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderSkeleton />

      <main className="mx-auto max-w-xl space-y-6 px-4 pb-24 pt-6">
        <StatusPanelSkeleton />

        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <div className="space-y-2.5">
            <TodoRowSkeleton />
            <TodoRowSkeleton />
          </div>
        </div>

        <PublishCtaSkeleton />
      </main>

      <BottomNavSkeleton />
    </div>
  );
}
