import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { openConsentPreferences } from "@/lib/consent";
import logoFull from "@/assets/logo-moninvit.png.asset.json";

const NAV = [
  { to: "/comment-ca-marche", label: "Comment ça marche" },
  { to: "/", hash: "tarifs", label: "Tarifs" },
  { to: "/blog", label: "Blog" },
] as const;

function isActive(pathname: string, to: string, hash?: string) {
  if (hash) return false;
  return to === "/" ? pathname === "/" : pathname.startsWith(to);
}

function scrollToHash(hash?: string) {
  if (!hash) return;
  const el = document.getElementById(hash);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Logo({ className = "h-[26px]" }: { className?: string }) {
  return (
    <img
      src={logoFull.url}
      alt="moninvit.com"
      className={`w-auto ${className}`}
      width={640}
      height={140}
    />
  );
}

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
    <header
      className="sticky top-0 z-50 border-b border-[#F4EFF0] backdrop-blur-[10px]"
      style={{ background: "rgba(255,255,255,0.92)" }}
    >
      <div className="mx-auto flex h-[74px] max-w-6xl items-center justify-between gap-3 px-5">
        <Link to="/" aria-label="moninvit.com — accueil" className="shrink-0">
          <Logo />
        </Link>

        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV.map((n) => {
            const hash = "hash" in n ? n.hash : undefined;
            const active = isActive(pathname, n.to, hash);
            return (
              <Link
                key={n.label}
                to={n.to}
                hash={hash}
                onClick={() => {
                  if (hash && pathname === n.to) scrollToHash(hash);
                }}
                aria-current={active ? "page" : undefined}
                className={
                  "rounded-full px-3 py-2 font-[family-name:var(--font-brand-ui)] text-sm font-semibold transition " +
                  (active
                    ? "text-[#E82050]"
                    : "text-[#3D3437] hover:text-[#E82050]")
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
            className="hidden font-[family-name:var(--font-brand-ui)] text-sm font-semibold text-[#3D3437] transition hover:text-[#E82050] sm:inline-block"
          >
            Se connecter
          </Link>
          <Link
            to="/signup"
            className="btn-framboise hidden px-[22px] py-[11px] text-sm sm:inline-flex"
          >
            Commencer →
          </Link>

          <button
            type="button"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="grid size-11 place-items-center rounded-full text-[#201A1C] transition active:scale-95 md:hidden"
          >
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
          "fixed inset-x-0 top-0 z-40 origin-top rounded-b-[24px] border-b border-[#F4EFF0] bg-white shadow-2xl transition-transform duration-200 ease-out md:hidden " +
          (open ? "translate-y-0" : "-translate-y-full")
        }
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <Logo className="h-[22px]" />
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
            className="grid size-11 place-items-center rounded-full text-[#201A1C]"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="size-5">
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
          </button>
        </div>
        <nav aria-label="Navigation mobile" className="px-3 pb-5">
          <ul className="flex flex-col">
            {NAV.map((n) => {
              const hash = "hash" in n ? n.hash : undefined;
              return (
                <li key={n.label}>
                  <Link
                    to={n.to}
                    hash={hash}
                    onClick={() => {
                      setOpen(false);
                      if (hash && pathname === n.to) {
                        setTimeout(() => scrollToHash(hash), 60);
                      }
                    }}
                    className="flex min-h-12 items-center rounded-2xl px-4 font-[family-name:var(--font-brand-ui)] text-[15px] font-semibold text-[#201A1C] transition hover:bg-[#FDF0F3]"
                  >
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex flex-col gap-2 border-t border-[#F4EFF0] px-1 pt-4">
            <Link
              to="/signup"
              onClick={() => setOpen(false)}
              className="btn-framboise min-h-12 px-5 text-sm"
            >
              Créer mon invitation →
            </Link>
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="btn-outline-framboise min-h-12 px-5 text-sm"
            >
              Se connecter
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

export function MobileStickyCta() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] flex items-center justify-between gap-3 bg-white px-5 md:hidden"
      style={{
        paddingTop: "10px",
        paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
        borderTop: "1px solid #F4EFF0",
        boxShadow: "0 -4px 20px rgba(32,26,28,0.08)",
      }}
    >
      <div className="min-w-0">
        <p className="font-[family-name:var(--font-brand-ui)] text-[13px] font-bold leading-tight text-[#201A1C]">
          Invitation de mariage
        </p>
        <p className="truncate font-[family-name:var(--font-brand-body)] text-[11px] leading-tight text-[#7A6D70]">
          Gratuit jusqu'à la publication
        </p>
      </div>
      <Link
        to="/signup"
        className="btn-framboise shrink-0 px-[18px] py-[10px] text-[13px]"
      >
        Commencer →
      </Link>
    </div>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[#F4EFF0] bg-[#FBF8F8] pb-24 pt-16 md:pb-10">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" aria-label="moninvit.com — accueil" className="inline-block">
              <Logo className="h-6" />
            </Link>
            <p className="mt-4 max-w-[280px] font-[family-name:var(--font-brand-body)] text-sm leading-relaxed text-[#5A4F52]">
              Des invitations digitales élégantes, pensées avec amour pour les
              mariés de Côte d'Ivoire.
            </p>
            <p className="mt-4 font-[family-name:var(--font-brand-ui)] text-[13px] font-semibold text-[#C6A15B]">
              Célébrons ton union ♡
            </p>
            <div className="mt-4 flex flex-wrap gap-4 font-[family-name:var(--font-brand-ui)] text-xs font-medium text-[#7A6D70]">
              <a href="https://instagram.com" target="_blank" rel="noreferrer noopener" className="hover:text-[#E82050]">Instagram</a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer noopener" className="hover:text-[#E82050]">TikTok</a>
              <a href="https://wa.me/2250000000" target="_blank" rel="noreferrer noopener" className="hover:text-[#E82050]">WhatsApp</a>
            </div>
          </div>

          <FooterColumn title="Explorer">
            <FooterLink to="/">Accueil</FooterLink>
            <FooterLink to="/comment-ca-marche">Comment ça marche</FooterLink>
            <FooterLink to="/temoignages">Témoignages</FooterLink>
            <FooterLink to="/blog">Blog</FooterLink>
          </FooterColumn>

          <FooterColumn title="Commencer">
            <FooterLink to="/signup">Créer mon invitation</FooterLink>
            <FooterLink to="/login">Se connecter</FooterLink>
            <FooterLink to="/invitation">Voir un exemple</FooterLink>
          </FooterColumn>

          <FooterColumn title="Légal">
            <FooterLink to="/termes-et-conditions">Termes & conditions</FooterLink>
            <FooterLink to="/politique-de-confidentialite">Confidentialité</FooterLink>
            <FooterLink to="/conditions-generales-de-vente">Conditions de vente</FooterLink>
            <li>
              <button
                type="button"
                onClick={() => openConsentPreferences()}
                className="font-[family-name:var(--font-brand-body)] text-sm text-[#5A4F52] transition hover:text-[#E82050]"
              >
                Gérer mes cookies
              </button>
            </li>
            <li>
              <a
                href="mailto:contact@moninvit.com"
                className="font-[family-name:var(--font-brand-body)] text-sm text-[#5A4F52] transition hover:text-[#E82050]"
              >
                contact@moninvit.com
              </a>
            </li>
          </FooterColumn>
        </div>

        <div className="mt-12 border-t border-[#E7DFE1] pt-6">
          <p className="text-center font-[family-name:var(--font-brand-ui)] text-xs text-[#7A6D70] sm:text-left">
            © {year} moninvit.com — Fait avec ♡ à Abidjan
          </p>
        </div>

        <div className="pointer-events-none relative mt-10 overflow-hidden">
          <div
            className="flex justify-center"
            style={{
              maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 85%)",
              WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 85%)",
            }}
          >
            <img
              src={logoFull.url}
              alt=""
              aria-hidden="true"
              className="h-auto w-full max-w-5xl select-none opacity-40 grayscale"
              style={{ filter: "brightness(1.05)" }}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="kicker text-[11px]! text-[#201A1C]!">{title}</h3>
      <ul className="mt-4 flex flex-col gap-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        to={to}
        className="font-[family-name:var(--font-brand-body)] text-sm text-[#5A4F52] transition hover:text-[#E82050]"
      >
        {children}
      </Link>
    </li>
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
    <div className="min-h-dvh overflow-x-clip bg-white text-[#201A1C]">
      <SiteHeader />
      <main id="main">
        <section
          className="border-b border-[#F4EFF0]"
          style={{ background: "linear-gradient(170deg, #FDF0F3 0%, #FFFFFF 60%)" }}
        >
          <div className="mx-auto max-w-4xl px-5 pb-14 pt-14 text-center sm:pt-20">
            <p className="kicker">{eyebrow}</p>
            <h1 className="mt-4 font-[family-name:var(--font-brand-serif)] text-[42px] font-medium leading-[1.04] text-[#201A1C] sm:text-[58px]">
              {title}
            </h1>
            {intro ? (
              <p className="mx-auto mt-5 max-w-2xl font-[family-name:var(--font-brand-body)] text-[16px] leading-relaxed text-[#5A4F52]">
                {intro}
              </p>
            ) : null}
          </div>
        </section>
        {children}
      </main>
      <SiteFooter />
      <MobileStickyCta />
    </div>
  );
}
