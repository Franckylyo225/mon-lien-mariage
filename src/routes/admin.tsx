import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { User } from "@supabase/supabase-js";
import { IconArrowLeft, IconLogout } from "@tabler/icons-react";
import { checkIsAdmin } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const CRUMB: Record<string, string> = {
  "/admin": "Vue d'ensemble",
  "/admin/users": "Utilisateurs",
  "/admin/weddings": "Événements",
  "/admin/payments": "Paiements",
  "/admin/emails": "Emails",
  "/admin/activity": "Activité",
  "/admin/settings": "Paramètres",
};

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const check = useServerFn(checkIsAdmin);
  const [status, setStatus] = useState<"checking" | "ok" | "denied">("checking");
  const [user, setUser] = useState<User | null>(null);

  const isLoginRoute = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginRoute) {
      setStatus("checking");
      setUser(null);
      return;
    }
    let cancelled = false;
    setStatus("checking");
    supabase.auth
      .getUser()
      .then(async ({ data, error }) => {
        if (cancelled) return;
        if (error || !data.user) {
          navigate({ to: "/admin/login", replace: true });
          return;
        }
        setUser(data.user);
        const role = await check();
        if (!cancelled) setStatus(role.isAdmin ? "ok" : "denied");
      })
      .catch(() => {
        if (!cancelled) setStatus("denied");
      });
    return () => {
      cancelled = true;
    };
  }, [check, navigate, isLoginRoute]);

  if (isLoginRoute) return <Outlet />;

  if (status === "checking") {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-40">Chargement…</p>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
        <div className="max-w-sm space-y-3">
          <h1 className="font-serif text-2xl">Accès refusé</h1>
          <p className="text-sm text-muted-foreground">
            Cette section est réservée aux administrateurs de la plateforme.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            <IconArrowLeft size={16} /> Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  const title = CRUMB[pathname] ?? "Admin";

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  return (
    <SidebarProvider>
      <AdminSidebar email={user?.email} />
      <SidebarInset className="bg-neutral-50">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/70 bg-white/95 px-4 backdrop-blur">
          <SidebarTrigger />
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Admin</span>
            <span className="text-muted-foreground">/</span>
            <span className="font-serif text-base">{title}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden truncate text-[12px] text-muted-foreground sm:inline">{user?.email}</span>
            <button
              onClick={handleLogout}
              title="Se déconnecter"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-white px-3 py-1.5 text-[12px] hover:bg-secondary"
            >
              <IconLogout size={13} /> Sortir
            </button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
