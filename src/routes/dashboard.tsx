import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useWedding } from "@/lib/wedding-store";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const { couple, account, loading, signOut } = useWedding();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !account.isAuthenticated) {
      navigate({ to: "/login", replace: true });
    }
  }, [loading, account.isAuthenticated, navigate]);

  if (loading || !account.isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-40">
          Chargement…
        </p>
      </div>
    );
  }

  const nav = [
    { to: "/dashboard", label: "Tableau", exact: true },
    { to: "/dashboard/guests", label: "Invités" },
    { to: "/dashboard/ceremonies", label: "Cérémonies" },
    { to: "/dashboard/landing", label: "Ma page" },
    { to: "/dashboard/preview", label: "Aperçu" },
  ];

  const initial = (couple.brideName || account.email || "?").trim()[0]?.toUpperCase() ?? "?";

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-8">
          <Link to="/dashboard" className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/30 font-serif text-sm italic">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] opacity-50">
                MonMariage
              </p>
              <p className="truncate font-serif text-sm italic">
                {couple.brideName || account.email} {couple.groomName ? `& ${couple.groomName}` : ""}
              </p>
            </div>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/invitation"
              className="rounded-full border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition hover:bg-accent/20"
            >
              Invitation
            </Link>
            <button
              onClick={async () => {
                await signOut();
                navigate({ to: "/", replace: true });
              }}
              className="rounded-full border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition hover:bg-accent/20"
            >
              Sortir
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {nav.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={
                  "shrink-0 rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition " +
                  (active
                    ? "bg-foreground text-background"
                    : "text-foreground/60 hover:bg-accent/20")
                }
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}
