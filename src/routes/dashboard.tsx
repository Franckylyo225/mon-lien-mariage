import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useWedding } from "@/lib/wedding-store";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const { couple } = useWedding();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const nav = [
    { to: "/dashboard", label: "Tableau", exact: true },
    { to: "/dashboard/landing", label: "Ma page" },
    { to: "/dashboard/invites", label: "Invités" },
    { to: "/dashboard/ceremonies", label: "Cérémonies" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-8">
          <Link to="/dashboard" className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/30 font-serif text-sm italic">
              {couple.brideName[0]}
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] opacity-50">
                MonMariage
              </p>
              <p className="truncate font-serif text-sm italic">
                {couple.brideName} & {couple.groomName}
              </p>
            </div>
          </Link>
          <Link
            to="/invitation"
            className="shrink-0 rounded-full border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition hover:bg-accent/20"
          >
            Invitation
          </Link>
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

