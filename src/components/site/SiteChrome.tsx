import { Link, useRouterState } from "@tanstack/react-router";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/comment-ca-marche", label: "Comment ça marche ?" },
  { to: "/blog", label: "Blog" },
  { to: "/temoignages", label: "Témoignages" },
] as const;

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="relative z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5">
        <Link
          to="/"
          className="font-[family-name:var(--font-display)] text-xl italic text-[#2b1a14]"
        >
          MonMariage<span className="text-[#c17c74]">.ci</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((n) => {
            const active =
              n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={
                  "text-sm transition " +
                  (active
                    ? "text-[#2b1a14] font-medium"
                    : "text-[#6b4a3e] hover:text-[#2b1a14]")
                }
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden text-sm text-[#6b4a3e] hover:text-[#2b1a14] sm:inline-block"
          >
            Se connecter
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-[#2b1a14] px-4 py-2 text-xs font-medium text-[#fdf7f3] hover:opacity-90"
          >
            Commencer
          </Link>
        </div>
      </div>

      {/* mobile nav */}
      <nav className="mx-auto flex max-w-6xl items-center gap-4 overflow-x-auto px-5 pb-3 md:hidden">
        {NAV.map((n) => {
          const active =
            n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              className={
                "whitespace-nowrap text-[13px] " +
                (active
                  ? "text-[#c17c74] font-medium"
                  : "text-[#6b4a3e]")
              }
            >
              {n.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[#e8c5b6]/40 bg-[#fdf7f3] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 text-center text-xs text-[#8a6a5e]">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="hover:text-[#2b1a14]">
              {n.label}
            </Link>
          ))}
        </div>
        <p>© 2027 MonMariage.ci — Fait avec ♡ à Abidjan</p>
      </div>
    </footer>
  );
}

export function PageShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fdf7f3] text-[#2b1a14]">
      <SiteHeader />
      <section className="relative isolate">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(1000px 500px at 50% -10%, #f6d9cb 0%, #fdf7f3 60%, #fdf7f3 100%)",
          }}
        />
        <div className="mx-auto max-w-4xl px-5 pt-14 pb-10 text-center sm:pt-20">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#c17c74]">
            {eyebrow}
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-[1.05] sm:text-6xl">
            {title}
          </h1>
          {intro ? (
            <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-[#6b4a3e] sm:text-base">
              {intro}
            </p>
          ) : null}
        </div>
      </section>
      {children}
      <SiteFooter />
    </main>
  );
}
