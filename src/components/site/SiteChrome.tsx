import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/comment-ca-marche", label: "Comment ça marche ?" },
  { to: "/blog", label: "Blog" },
  { to: "/temoignages", label: "Témoignages" },
] as const;

function isActive(pathname: string, to: string) {
  return to === "/" ? pathname === "/" : pathname.startsWith(to);
}

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock scroll + ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="relative z-40 border-b border-[#e8c5b6]/40 bg-[#fdf7f3]/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">
        <Link
          to="/"
          aria-label="MonInvit.com — accueil"
          className="font-[family-name:var(--font-display)] text-xl italic text-[#2b1a14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c17c74] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf7f3] rounded-sm"
        >
          MonInvit<span className="text-[#c17c74]">.ci</span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => {
            const active = isActive(pathname, n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                aria-current={active ? "page" : undefined}
                className={
                  "relative rounded-full px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c17c74] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf7f3] " +
                  (active
                    ? "text-[#2b1a14] font-medium after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-[2px] after:rounded-full after:bg-[#c17c74]"
                    : "text-[#6b4a3e] hover:text-[#2b1a14]")
                }
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden text-sm text-[#6b4a3e] hover:text-[#2b1a14] focus-visible:outline-none focus-visible:underline sm:inline-block"
          >
            Se connecter
          </Link>
          <Link
            to="/signup"
            className="hidden min-h-11 items-center rounded-full bg-[#2b1a14] px-4 text-xs font-medium text-[#fdf7f3] transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c17c74] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf7f3] sm:inline-flex"
          >
            Commencer
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="grid size-11 place-items-center rounded-full text-[#2b1a14] transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c17c74] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf7f3] md:hidden"
          >
            <span className="sr-only">{open ? "Fermer le menu" : "Ouvrir le menu"}</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              className="size-6"
            >
              {open ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        className={
          "fixed inset-0 z-30 bg-black/35 transition-opacity duration-200 md:hidden " +
          (open ? "opacity-100" : "pointer-events-none opacity-0")
        }
      />
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
        className={
          "fixed inset-x-0 top-0 z-40 origin-top rounded-b-[24px] border-b border-[#e8c5b6]/50 bg-[#fdf7f3] shadow-2xl transition-transform duration-200 ease-out md:hidden " +
          (open ? "translate-y-0" : "-translate-y-full")
        }
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <span className="font-[family-name:var(--font-display)] text-lg italic text-[#2b1a14]">
            Menu
          </span>
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
            className="grid size-11 place-items-center rounded-full text-[#2b1a14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c17c74]"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="size-5">
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
          </button>
        </div>
        <nav aria-label="Navigation mobile" className="px-3 pb-4">
          <ul className="flex flex-col">
            {NAV.map((n) => {
              const active = isActive(pathname, n.to);
              return (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={
                      "flex min-h-12 items-center justify-between rounded-2xl px-4 text-[15px] transition " +
                      (active
                        ? "bg-[#fbeee4] font-medium text-[#2b1a14]"
                        : "text-[#2b1a14]/85 hover:bg-[#fbeee4]/60")
                    }
                  >
                    <span>{n.label}</span>
                    {active ? (
                      <span aria-hidden="true" className="size-1.5 rounded-full bg-[#c17c74]" />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex flex-col gap-2 border-t border-[#e8c5b6]/60 px-1 pt-4">
            <Link
              to="/signup"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#2b1a14] px-5 text-sm font-medium text-[#fdf7f3] transition hover:opacity-90"
            >
              Créer notre invitation
            </Link>
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#e8c5b6] px-5 text-sm text-[#2b1a14] transition hover:bg-[#fbeee4]/60"
            >
              Se connecter
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <footer className="border-t border-[#e8c5b6]/40 bg-[#fdf7f3] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 text-center text-xs text-[#8a6a5e]">
        <nav aria-label="Navigation bas de page">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {NAV.map((n) => {
              const active = isActive(pathname, n.to);
              return (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    aria-current={active ? "page" : undefined}
                    className={
                      "hover:text-[#2b1a14] " +
                      (active ? "text-[#2b1a14] font-medium" : "")
                    }
                  >
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <p>© 2027 MonInvit.com — Fait avec ♡ à Abidjan</p>
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
    <div className="min-h-dvh overflow-x-hidden bg-[#fdf7f3] text-[#2b1a14]">
      <SiteHeader />
      <main id="main">
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
      </main>
      <SiteFooter />
    </div>
  );
}
