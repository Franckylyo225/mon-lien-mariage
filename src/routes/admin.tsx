import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  IconLayoutDashboard,
  IconUsers,
  IconCalendarHeart,
  IconCash,
  IconArrowLeft,
} from "@tabler/icons-react";
import { useWedding } from "@/lib/wedding-store";
import { checkIsAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { account, loading } = useWedding();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const check = useServerFn(checkIsAdmin);
  const [status, setStatus] = useState<"checking" | "ok" | "denied">("checking");

  useEffect(() => {
    if (loading) return;
    if (!account.isAuthenticated) {
      navigate({ to: "/admin/login", replace: true });
      return;
    }
    check()
      .then((r) => setStatus(r.isAdmin ? "ok" : "denied"))
      .catch(() => setStatus("denied"));
  }, [loading, account.isAuthenticated, check, navigate]);

  if (loading || status === "checking") {
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

  const tabs: Array<{ to: string; label: string; Icon: typeof IconUsers; exact?: boolean }> = [
    { to: "/admin", label: "Vue d'ensemble", Icon: IconLayoutDashboard, exact: true },
    { to: "/admin/users", label: "Utilisateurs", Icon: IconUsers },
    { to: "/admin/weddings", label: "Événements", Icon: IconCalendarHeart },
    { to: "/admin/payments", label: "Paiements", Icon: IconCash },
  ];


  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
              <IconArrowLeft size={18} />
            </Link>
            <span className="font-serif text-lg italic">Admin</span>
            <span className="hidden text-[11px] uppercase tracking-widest text-muted-foreground sm:inline">
              MonInvit.com
            </span>
          </div>
          <span className="truncate text-[12px] text-muted-foreground">{account.email}</span>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 pb-1">
          {tabs.map((t) => {
            const active = t.exact ? pathname === t.to : pathname === t.to || pathname.startsWith(t.to + "/");
            return (
              <Link
                key={t.to}
                to={t.to as "/admin"}

                className={
                  "flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-[13px] transition " +
                  (active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary")
                }
              >
                <t.Icon size={15} />
                {t.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
