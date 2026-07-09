import { useEffect, useMemo, useState } from "react";
import type { Couple } from "@/lib/wedding-store";

export const OPENING_EFFECT_SLUGS = [
  "envelope-wax-sage",
  "envelope-navy-pearl",
  "envelope-royal",
  "envelope-floral",
  "grand-portal",
  "cinema-curtain",
  "falling-petals",
  "book-open",
] as const;

export type OpeningEffectSlug = (typeof OPENING_EFFECT_SLUGS)[number];

export const OPENING_EFFECT_LABELS: Record<OpeningEffectSlug, string> = {
  "envelope-wax-sage": "Enveloppe Sceau Sauge",
  "envelope-navy-pearl": "Enveloppe Nuit Nacrée",
  "envelope-royal": "Enveloppe Royale",
  "envelope-floral": "Enveloppe Florale",
  "grand-portal": "Grand Portail",
  "cinema-curtain": "Rideau de Gala",
  "falling-petals": "Pétales Tombants",
  "book-open": "Livre qui s'ouvre",
};

interface Props {
  slug: OpeningEffectSlug;
  couple: Couple;
  /** Force replay (ignore sessionStorage) — used in editor preview. */
  forcePlay?: boolean;
  onDone?: () => void;
}

/* -------- Shared lifecycle -------- */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

function useSkipAfter(ms: number) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return show;
}

function useAutoClose(duration: number, onDone?: () => void) {
  useEffect(() => {
    const t = setTimeout(() => onDone?.(), duration);
    return () => clearTimeout(t);
  }, [duration, onDone]);
}

function initials(couple: Couple) {
  const a = (couple.brideName ?? "").trim().charAt(0).toUpperCase();
  const b = (couple.groomName ?? "").trim().charAt(0).toUpperCase();
  return { a: a || "A", b: b || "B" };
}

function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/* -------- Public component -------- */

export function OpeningEffect({ slug, couple, forcePlay, onDone }: Props) {
  const key = `opening_seen_${couple.slug ?? "preview"}_${slug}`;
  const [visible, setVisible] = useState<boolean>(() => {
    if (forcePlay) return true;
    if (typeof window === "undefined") return false;
    return !window.sessionStorage.getItem(key);
  });
  const reduced = usePrefersReducedMotion();

  const finish = () => {
    setVisible(false);
    if (!forcePlay && typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(key, "1");
      } catch {
        /* ignore */
      }
    }
    onDone?.();
  };

  if (!visible) return null;

  // Reduced motion: 1 second fade only, whatever the slug.
  if (reduced) {
    return <ReducedMotionFrame couple={couple} onDone={finish} />;
  }

  switch (slug) {
    case "envelope-wax-sage":
      return <EnvelopeWaxSage couple={couple} onDone={finish} />;
    case "envelope-navy-pearl":
      return <EnvelopeNavyPearl couple={couple} onDone={finish} />;
    case "envelope-royal":
      return <EnvelopeRoyal couple={couple} onDone={finish} />;
    case "envelope-floral":
      return <EnvelopeFloral couple={couple} onDone={finish} />;
    case "grand-portal":
      return <GrandPortal couple={couple} onDone={finish} />;
    case "cinema-curtain":
      return <CinemaCurtain couple={couple} onDone={finish} />;
    case "falling-petals":
      return <FallingPetals couple={couple} onDone={finish} />;
    case "book-open":
      return <BookOpen couple={couple} onDone={finish} />;
    default:
      return null;
  }
}

/* -------- Shared UI -------- */

function SkipButton({ onClick }: { onClick: () => void }) {
  const show = useSkipAfter(1500);
  if (!show) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="fixed bottom-6 left-1/2 z-[110] -translate-x-1/2 text-[11px] uppercase tracking-[0.25em] text-white/70 hover:text-white"
    >
      Passer
    </button>
  );
}

function Overlay({
  children,
  bg = "#000",
  onClick,
  fadeMs = 400,
}: {
  children: React.ReactNode;
  bg?: string;
  onClick?: () => void;
  fadeMs?: number;
}) {
  return (
    <div
      onClick={onClick}
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{
        backgroundColor: bg,
        animation: `oe-fade-out ${fadeMs}ms ease forwards`,
        animationDelay: `calc(var(--oe-duration) - ${fadeMs}ms)`,
      }}
    >
      <style>{`
        @keyframes oe-fade-out { to { opacity: 0; } }
        @keyframes oe-fade-in { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      {children}
    </div>
  );
}

function ReducedMotionFrame({ couple, onDone }: { couple: Couple; onDone: () => void }) {
  useAutoClose(1000, onDone);
  const { a, b } = initials(couple);
  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black text-white"
      style={{ animation: "oe-fade-out 400ms ease forwards", animationDelay: "600ms" }}
    >
      <p className="font-serif text-3xl italic">
        {a} <span className="opacity-60">&amp;</span> {b}
      </p>
    </div>
  );
}

/* ==================================================
 * Shared: Embossed floral envelope base
 * ================================================== */

/** Embossed floral pattern used on envelope back + flap.
 *  `variant="emboss"` renders light-on-cream gaufrage.
 *  `variant="watercolor"` renders pastel washes with the same silhouettes.
 */
function EmbossedFlora({
  variant,
  accent = "#C8973A",
  idPrefix,
}: {
  variant: "emboss" | "watercolor";
  accent?: string;
  idPrefix: string;
}) {
  const stroke = variant === "emboss" ? "rgba(255,255,255,0.95)" : darken(accent, 0.15);
  const shadow = variant === "emboss" ? "rgba(150,120,80,0.35)" : "rgba(120,80,40,0.2)";
  const washA = variant === "watercolor" ? mix(accent, "#ffffff", 0.55) : "transparent";
  const washB = variant === "watercolor" ? "#c7d5b8" : "transparent";
  const washC = variant === "watercolor" ? "#f0d3c2" : "transparent";
  const shadowFilter = `${idPrefix}-shadow`;
  return (
    <svg
      viewBox="0 0 300 420"
      width="100%"
      height="100%"
      className="pointer-events-none absolute inset-0"
      style={{ mixBlendMode: variant === "emboss" ? "multiply" : "normal" }}
    >
      <defs>
        <filter id={shadowFilter} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.5" />
          <feOffset dx="0.6" dy="0.8" result="off" />
          <feFlood floodColor={shadow} floodOpacity="1" />
          <feComposite in2="off" operator="in" />
          <feComposite in="SourceGraphic" operator="over" />
        </filter>
      </defs>
      <g fill="none" stroke={stroke} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${shadowFilter})`}>
        {/* Rose top-left */}
        <g transform="translate(40,50)">
          <circle r="4" fill={washA} />
          <circle r="7" />
          <circle r="10" />
          <circle r="13" />
          <path d="M-14 4 Q-24 -4 -30 8" />
          <path d="M14 -2 Q22 -12 30 -2" />
        </g>
        {/* Flower top-right (5 petals) */}
        <g transform="translate(230,60)">
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse key={r} cx="0" cy="-9" rx="4" ry="8" transform={`rotate(${r})`} fill={washC} />
          ))}
          <circle r="3" fill={variant === "watercolor" ? "#e8c46a" : stroke} />
        </g>
        {/* Sprig */}
        <g transform="translate(30,180)">
          <path d="M0 0 Q10 20 8 45 Q4 60 12 80" />
          {[10, 25, 42, 58, 72].map((y, i) => (
            <path key={y} d={`M${i % 2 ? 8 : 4} ${y} q${i % 2 ? 10 : -10} -4 ${i % 2 ? 16 : -16} -2`} fill={washB} />
          ))}
        </g>
        {/* Leaf right */}
        <g transform="translate(260,190)">
          <path d="M0 0 Q-8 25 -20 40 Q-6 30 4 42" fill={washB} />
          <path d="M-4 8 L-14 30" />
        </g>
        {/* Big flower bottom-left */}
        <g transform="translate(60,340)">
          {[0, 60, 120, 180, 240, 300].map((r) => (
            <ellipse key={r} cx="0" cy="-11" rx="5" ry="10" transform={`rotate(${r})`} fill={washA} />
          ))}
          <circle r="4" fill={variant === "watercolor" ? "#e8c46a" : stroke} />
          <path d="M-20 10 Q-40 20 -50 5" />
        </g>
        {/* Bud bottom-right */}
        <g transform="translate(230,360)">
          <path d="M0 0 Q6 -12 0 -22 Q-6 -12 0 0Z" fill={washC} />
          <path d="M0 0 Q10 8 20 4" />
          <path d="M0 0 Q-8 12 -18 10" />
        </g>
        {/* Scattered dots */}
        {[[100, 20], [200, 30], [130, 100], [180, 150], [90, 250], [200, 280], [150, 400], [40, 120], [250, 130], [110, 380]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.4" fill={stroke} stroke="none" />
        ))}
      </g>
    </svg>
  );
}

/** Rich wax seal with radial highlight, organic border, and engraved monogram. */
function WaxSeal({
  accent,
  a,
  b,
  size = 96,
  idPrefix,
  cracked = false,
}: {
  accent: string;
  a: string;
  b: string;
  size?: number;
  idPrefix: string;
  cracked?: boolean;
}) {
  const grad = `${idPrefix}-grad`;
  const glow = `${idPrefix}-glow`;
  // organic circle path (slightly irregular)
  const halfLeft = "M50 4 C30 4 6 22 6 50 C6 78 30 96 50 96 L50 50 Z";
  const halfRight = "M50 4 C70 4 94 22 94 50 C94 78 70 96 50 96 L50 50 Z";
  const full = "M50 3 C28 3 5 21 5 50 C5 79 28 97 50 97 C72 97 95 79 95 50 C95 21 72 3 50 3 Z";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={grad} cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor={lighten(accent, 0.35)} />
          <stop offset="45%" stopColor={accent} />
          <stop offset="100%" stopColor={darken(accent, 0.4)} />
        </radialGradient>
        <radialGradient id={glow} cx="35%" cy="28%" r="30%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      {/* Drop shadow */}
      <ellipse cx="50" cy="94" rx="34" ry="4" fill="rgba(0,0,0,0.25)" />
      {cracked ? (
        <>
          <path d={halfLeft} fill={`url(#${grad})`} className="oe-seal-half oe-seal-half-l" />
          <path d={halfRight} fill={`url(#${grad})`} className="oe-seal-half oe-seal-half-r" />
        </>
      ) : (
        <>
          <path d={full} fill={`url(#${grad})`} stroke={darken(accent, 0.5)} strokeWidth="0.6" />
          {/* Inner rim */}
          <circle cx="50" cy="50" r="36" fill="none" stroke={darken(accent, 0.35)} strokeWidth="0.6" opacity="0.7" />
          {/* Highlight */}
          <ellipse cx="38" cy="32" rx="22" ry="14" fill={`url(#${glow})`} />
          {/* Engraved monogram — double text for pressed effect */}
          <text
            x="50" y="60" textAnchor="middle"
            fontFamily="'Cormorant Garamond', 'Playfair Display', serif"
            fontStyle="italic" fontSize="32" fontWeight="500"
            fill={darken(accent, 0.55)}
          >
            {a}&amp;{b}
          </text>
          <text
            x="50" y="59" textAnchor="middle"
            fontFamily="'Cormorant Garamond', 'Playfair Display', serif"
            fontStyle="italic" fontSize="32" fontWeight="500"
            fill={lighten(accent, 0.25)}
            opacity="0.55"
          >
            {a}&amp;{b}
          </text>
          {/* Small drips */}
          <path d="M18 74 q2 8 -2 12" stroke={darken(accent, 0.4)} strokeWidth="0.6" fill="none" opacity="0.6" />
          <path d="M82 76 q-2 8 2 12" stroke={darken(accent, 0.4)} strokeWidth="0.6" fill="none" opacity="0.6" />
        </>
      )}
    </svg>
  );
}

/** Shared envelope stage — parametrised by "emboss" or "watercolor" variant. */
function EmbossedEnvelopeStage({
  couple,
  onDone,
  variant,
  paperBg,
  paperTint,
  sealColor,
  idPrefix,
}: {
  couple: Couple;
  onDone: () => void;
  variant: "emboss" | "watercolor";
  paperBg: string;
  paperTint: string;
  sealColor: string;
  idPrefix: string;
}) {
  const [opened, setOpened] = useState(false);
  const { a, b } = initials(couple);
  const duration = 2800;

  useEffect(() => {
    if (!opened) return;
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [opened, onDone]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${lighten(paperBg, 0.05)} 0%, ${paperBg} 55%, ${darken(paperBg, 0.12)} 100%)`,
      }}
    >
      <style>{`
        @keyframes ${idPrefix}-flap { 0%{transform:rotateX(0)} 100%{transform:rotateX(-172deg)} }
        @keyframes ${idPrefix}-card { 0%{transform:translateY(20px) scale(.96);opacity:0} 55%{opacity:1} 100%{transform:translateY(-40px) scale(1);opacity:1} }
        @keyframes ${idPrefix}-pulse { 0%,100%{transform:scale(1);opacity:.85} 50%{transform:scale(1.05);opacity:1} }
        @keyframes ${idPrefix}-crack-l { 0%{transform:translate(0,0) rotate(0);opacity:1} 100%{transform:translate(-22px,44px) rotate(-42deg);opacity:0} }
        @keyframes ${idPrefix}-crack-r { 0%{transform:translate(0,0) rotate(0);opacity:1} 100%{transform:translate(22px,44px) rotate(42deg);opacity:0} }
        @keyframes ${idPrefix}-out { to { opacity: 0; transform: scale(1.04); } }
        .${idPrefix}-flap { transform-origin: top center; transform-style: preserve-3d; backface-visibility: hidden; }
        .${idPrefix}-stage .oe-seal-half-l { transform-origin: 50px 50px; animation: ${idPrefix}-crack-l 700ms ease forwards; }
        .${idPrefix}-stage .oe-seal-half-r { transform-origin: 50px 50px; animation: ${idPrefix}-crack-r 700ms ease forwards; }
      `}</style>

      {/* Subtle paper grain overlay */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]" aria-hidden>
        <filter id={`${idPrefix}-grain`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.4  0 0 0 0 0.3  0 0 0 0 0.15  0 0 0 0.5 0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${idPrefix}-grain)`} />
      </svg>

      <div
        className={`${idPrefix}-stage relative flex flex-col items-center`}
        style={{
          perspective: 1200,
          animation: opened ? `${idPrefix}-out 500ms ease forwards ${duration - 500}ms` : undefined,
        }}
      >
        <div className="relative mx-auto" style={{ width: 300, height: 420 }}>
          {/* Envelope back */}
          <div
            className="absolute inset-0 rounded-[6px]"
            style={{
              background: `linear-gradient(155deg, ${lighten(paperTint, 0.06)} 0%, ${paperTint} 55%, ${darken(paperTint, 0.06)} 100%)`,
              boxShadow: "0 30px 60px -20px rgba(60,40,20,0.35), 0 2px 6px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(180,150,110,0.25)",
            }}
          />
          {/* Embossed flora on back */}
          <div className="absolute inset-0 overflow-hidden rounded-[6px]">
            <EmbossedFlora variant={variant} accent={sealColor} idPrefix={`${idPrefix}-back`} />
          </div>

          {/* Card inside (revealed on open) */}
          <div
            className="absolute inset-[14px] flex flex-col items-center justify-center rounded-[3px] px-6 py-8 text-center"
            style={{
              background: paperBg,
              boxShadow: "inset 0 0 0 1px rgba(180,150,110,0.35), 0 4px 12px rgba(0,0,0,0.08)",
              animation: opened ? `${idPrefix}-card 1000ms cubic-bezier(.2,.7,.2,1) 650ms both` : undefined,
              opacity: opened ? undefined : 0,
              zIndex: 1,
            }}
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.35em]" style={{ color: darken(sealColor, 0.2) }}>
              Vous êtes convié·e
            </p>
            <p className="mt-4 font-serif text-3xl italic" style={{ color: darken(sealColor, 0.35) }}>
              {couple.brideName}
            </p>
            <p className="my-1 font-serif text-base italic" style={{ color: darken(sealColor, 0.2), opacity: 0.7 }}>
              &amp;
            </p>
            <p className="font-serif text-3xl italic" style={{ color: darken(sealColor, 0.35) }}>
              {couple.groomName}
            </p>
            <span className="mt-4 block h-px w-10" style={{ background: sealColor, opacity: 0.4 }} />
            <p className="mt-3 text-[10px] uppercase tracking-[0.25em]" style={{ color: darken(sealColor, 0.25), opacity: 0.8 }}>
              {formatDate(couple.weddingDate)}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.25em]" style={{ color: darken(sealColor, 0.25), opacity: 0.65 }}>
              {couple.city}
            </p>
          </div>

          {/* Flap (triangular, with flora) */}
          <div
            className={`${idPrefix}-flap absolute inset-x-0 top-0`}
            style={{
              height: 240,
              animation: opened ? `${idPrefix}-flap 900ms cubic-bezier(.6,.05,.3,1) 250ms forwards` : undefined,
              zIndex: 2,
            }}
          >
            <svg viewBox="0 0 300 240" width="100%" height="100%" style={{ overflow: "visible" }}>
              <defs>
                <linearGradient id={`${idPrefix}-flap-fill`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lighten(paperTint, 0.1)} />
                  <stop offset="100%" stopColor={darken(paperTint, 0.05)} />
                </linearGradient>
              </defs>
              <polygon
                points="0,0 300,0 150,220"
                fill={`url(#${idPrefix}-flap-fill)`}
                stroke="rgba(150,110,60,0.25)"
                strokeWidth="1"
              />
              {/* subtle inner shading along the crease */}
              <polygon points="0,0 300,0 150,220" fill="url(#none)" />
            </svg>
            {/* Embossed flora on flap */}
            <div className="pointer-events-none absolute inset-0" style={{ clipPath: "polygon(0 0, 100% 0, 50% 92%)" }}>
              <svg viewBox="0 0 300 240" width="100%" height="100%">
                <g
                  fill="none"
                  stroke={variant === "emboss" ? "rgba(255,255,255,0.95)" : darken(sealColor, 0.15)}
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  style={{
                    filter: variant === "emboss" ? "drop-shadow(0.6px 0.8px 0 rgba(150,120,80,0.35))" : undefined,
                  }}
                >
                  {/* garland across the flap */}
                  <g transform="translate(60,50)">
                    {[0, 72, 144, 216, 288].map((r) => (
                      <ellipse key={r} cx="0" cy="-8" rx="4" ry="7" transform={`rotate(${r})`} fill={variant === "watercolor" ? mix(sealColor, "#ffffff", 0.55) : "transparent"} />
                    ))}
                  </g>
                  <g transform="translate(240,50)">
                    {[0, 72, 144, 216, 288].map((r) => (
                      <ellipse key={r} cx="0" cy="-8" rx="4" ry="7" transform={`rotate(${r})`} fill={variant === "watercolor" ? "#f0d3c2" : "transparent"} />
                    ))}
                  </g>
                  <path d="M85 55 Q150 30 215 55" />
                  <path d="M110 80 Q150 60 190 80" />
                  {[[120, 88], [150, 78], [180, 88], [135, 100], [165, 100]].map(([x, y], i) => (
                    <ellipse key={i} cx={x} cy={y} rx="3" ry="5" fill={variant === "watercolor" ? "#c7d5b8" : "transparent"} />
                  ))}
                  <g transform="translate(150,140)">
                    <path d="M0 0 Q-10 -14 0 -30 Q10 -14 0 0Z" fill={variant === "watercolor" ? mix(sealColor, "#ffffff", 0.5) : "transparent"} />
                    <path d="M-14 -4 Q-24 -14 -20 -28" />
                    <path d="M14 -4 Q24 -14 20 -28" />
                  </g>
                </g>
              </svg>
            </div>

            {/* Wax seal on flap */}
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                top: 150,
                animation: opened ? undefined : `${idPrefix}-pulse 2.2s ease infinite`,
                filter: "drop-shadow(0 6px 10px rgba(80,50,20,0.35))",
              }}
            >
              {opened ? (
                <WaxSeal accent={sealColor} a={a} b={b} size={96} idPrefix={`${idPrefix}-seal-c`} cracked />
              ) : (
                <WaxSeal accent={sealColor} a={a} b={b} size={96} idPrefix={`${idPrefix}-seal`} />
              )}
            </div>
          </div>
        </div>

        {/* Gravure sous l'enveloppe */}
        <div className="mt-6 text-center" style={{ opacity: opened ? 0 : 1, transition: "opacity 300ms" }}>
          <p className="font-serif text-lg italic" style={{ color: darken(sealColor, 0.35) }}>
            {couple.brideName} &amp; {couple.groomName}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: darken(sealColor, 0.25), opacity: 0.7 }}>
            {couple.city} · {formatDate(couple.weddingDate)}
          </p>
        </div>

        {/* Pastille "TAP TO OPEN" */}
        {!opened && (
          <button
            type="button"
            onClick={() => setOpened(true)}
            className="mt-8 rounded-full px-6 py-2.5 font-serif text-[13px] italic tracking-[0.3em] backdrop-blur-md"
            style={{
              background: "rgba(255,255,255,0.72)",
              color: darken(sealColor, 0.4),
              boxShadow: "0 8px 24px rgba(80,50,20,0.15), inset 0 0 0 1px rgba(255,255,255,0.6)",
              animation: `${idPrefix}-pulse 2.2s ease infinite`,
              letterSpacing: "0.4em",
            }}
          >
            TAP&nbsp;TO&nbsp;OPEN
          </button>
        )}
      </div>

      <SkipButton onClick={onDone} />
    </div>
  );
}

/* ==================================================
 * EFFECT 1 — Enveloppe Ivoire Embossée
 * ================================================== */

function EnvelopeRoyal({ couple, onDone }: { couple: Couple; onDone: () => void }) {
  return (
    <EmbossedEnvelopeStage
      couple={couple}
      onDone={onDone}
      variant="emboss"
      paperBg="#F5EEDF"
      paperTint="#EFE4CE"
      sealColor="#C8973A"
      idPrefix="er"
    />
  );
}

/* ==================================================
 * EFFECT 2 — Enveloppe Botanique Aquarelle
 * ================================================== */

function EnvelopeFloral({ couple, onDone }: { couple: Couple; onDone: () => void }) {
  const accent = couple.accent ?? "#C8973A";
  const sealColor = isWarm(accent) ? accent : "#C8973A";
  return (
    <EmbossedEnvelopeStage
      couple={couple}
      onDone={onDone}
      variant="watercolor"
      paperBg="#FDFBF5"
      paperTint="#F5EFE1"
      sealColor={sealColor}
      idPrefix="ef"
    />
  );
}

/* ==================================================
 * EFFECT 3 — Grand Portail
 * ================================================== */

function GrandPortal({ couple, onDone }: { couple: Couple; onDone: () => void }) {
  useAutoClose(3500, onDone);
  const accent = couple.accent ?? "#C8973A";
  const panelBg = mix(accent, "#ffffff", 0.5);
  const { a, b } = initials(couple);

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden" style={{ perspective: 1000 }}>
      <style>{`
        @keyframes gp-left { 0%,25%{transform:translateX(0) rotateY(0)} 100%{transform:translateX(-105%) rotateY(-12deg)} }
        @keyframes gp-right { 0%,25%{transform:translateX(0) rotateY(0)} 100%{transform:translateX(105%) rotateY(12deg)} }
        @keyframes gp-flash { 0%,60%{opacity:0} 75%{opacity:0.5} 100%{opacity:0} }
        @keyframes gp-bg { 0%,60%{filter:blur(10px)} 100%{filter:blur(0)} }
        @keyframes gp-bow-l { 0%,10%{transform:scaleX(1)} 30%,100%{transform:scaleX(0)} }
        @keyframes gp-bow-r { 0%,10%{transform:scaleX(1)} 30%,100%{transform:scaleX(0)} }
        @keyframes gp-ribbon { 0%,10%{transform:translateY(0);opacity:1} 30%,100%{transform:translateY(80px);opacity:0} }
      `}</style>

      {/* Blurred hero content behind */}
      <div
        className="absolute inset-0 flex items-center justify-center bg-black"
        style={{ animation: "gp-bg 3.5s ease forwards" }}
      >
        <div className="text-center text-white">
          <p className="font-serif text-6xl italic">{couple.brideName}</p>
          <p className="my-3 font-serif text-3xl italic opacity-80">&amp;</p>
          <p className="font-serif text-6xl italic">{couple.groomName}</p>
        </div>
      </div>

      {/* Flash */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(circle at center, rgba(255,255,255,0.6), transparent 60%)",
          animation: "gp-flash 3.5s ease forwards",
        }}
      />

      {/* Left panel */}
      <div
        className="absolute inset-y-0 left-0 w-1/2"
        style={{
          background: panelBg,
          transformOrigin: "left center",
          animation: "gp-left 1700ms ease-in-out 1100ms forwards",
        }}
      >
        <PortalPanelDecor accent={accent} side="left" />
      </div>
      {/* Right panel */}
      <div
        className="absolute inset-y-0 right-0 w-1/2"
        style={{
          background: panelBg,
          transformOrigin: "right center",
          animation: "gp-right 1700ms ease-in-out 1100ms forwards",
        }}
      >
        <PortalPanelDecor accent={accent} side="right" />
      </div>

      {/* Central bow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <svg width="120" height="80" viewBox="0 0 120 80">
          <g fill={accent} stroke={darken(accent, 0.2)} strokeWidth="1">
            <ellipse cx="35" cy="30" rx="24" ry="14" style={{ transformOrigin: "60px 30px", animation: "gp-bow-l 600ms ease forwards 500ms" }} />
            <ellipse cx="85" cy="30" rx="24" ry="14" style={{ transformOrigin: "60px 30px", animation: "gp-bow-r 600ms ease forwards 500ms" }} />
            <circle cx="60" cy="30" r="8" />
          </g>
          <g fill={accent} style={{ animation: "gp-ribbon 500ms ease forwards 700ms" }}>
            <path d="M55 38 L48 78 L60 70 Z" />
            <path d="M65 38 L72 78 L60 70 Z" />
          </g>
          <text x="60" y="34" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontStyle="italic" fontSize="10" fill="#fff">
            {a}&amp;{b}
          </text>
        </svg>
      </div>

      <SkipButton onClick={onDone} />
    </div>
  );
}

function PortalPanelDecor({ accent, side }: { accent: string; side: "left" | "right" }) {
  const gold = "#C8973A";
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 600" preserveAspectRatio="none">
      <rect x="14" y="14" width="172" height="572" fill="none" stroke={gold} strokeWidth="1.5" />
      <rect x="22" y="22" width="156" height="556" fill="none" stroke={gold} strokeWidth="0.6" />
      {[[22, 22], [178, 22], [22, 578], [178, 578]].map(([cx, cy], i) => (
        <g key={i} transform={`translate(${cx},${cy})`}>
          <circle r="4" fill={gold} />
        </g>
      ))}
      <g fill={mix(accent, "#ffffff", 0.3)} opacity="0.9">
        {Array.from({ length: 10 }).map((_, i) => {
          const y = 60 + i * 55;
          const x = side === "left" ? 176 : 24;
          return (
            <g key={i} transform={`translate(${x},${y})`}>
              <circle r="7" />
              <circle r="3" fill="#F7E3B8" />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/* ==================================================
 * EFFECT 4 — Rideau de Velours
 * ================================================== */

function CinemaCurtain({ couple, onDone }: { couple: Couple; onDone: () => void }) {
  useAutoClose(4200, onDone);
  const pleats = 9; // per side

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-[#0a0405]">
      <style>{`
        @keyframes cc-left { 0%,12%{transform:translateX(0)} 100%{transform:translateX(-102%)} }
        @keyframes cc-right { 0%,12%{transform:translateX(0)} 100%{transform:translateX(102%)} }
        @keyframes cc-reveal { 0%,20%{opacity:0;transform:scale(.92)} 60%,100%{opacity:1;transform:scale(1)} }
        @keyframes cc-glow { 0%,100%{opacity:.5} 50%{opacity:.8} }
        @keyframes cc-tassel { 0%,12%{transform:translate(0,0) rotate(0)} 100%{transform:translate(var(--tx),40px) rotate(var(--tr))} }
      `}</style>

      {/* Stage backdrop with warm halo */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 60% 45% at 50% 55%, #3a1a10 0%, #1a0808 55%, #050202 100%)",
      }} />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(232,180,90,0.35) 0%, rgba(232,180,90,0.08) 40%, transparent 70%)",
          animation: "cc-glow 3s ease-in-out infinite",
        }}
      />

      {/* Invitation revealed behind */}
      <div
        className="absolute inset-0 grid place-items-center text-center"
        style={{ animation: "cc-reveal 2400ms cubic-bezier(.2,.7,.2,1) 700ms both" }}
      >
        <div className="px-8 text-white">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em]" style={{ color: "#E8B45A" }}>
            {formatDate(couple.weddingDate)}
          </p>
          <p className="mt-6 font-serif text-6xl italic" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.6)" }}>
            {couple.brideName}
          </p>
          <p className="my-2 font-serif text-2xl italic opacity-70">&amp;</p>
          <p className="font-serif text-6xl italic" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.6)" }}>
            {couple.groomName}
          </p>
          <span className="mx-auto mt-6 block h-px w-16" style={{ background: "#E8B45A" }} />
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.4em] opacity-70">
            {couple.city}
          </p>
        </div>
      </div>

      {/* Golden rod + rings */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-4"
        style={{
          background: "linear-gradient(180deg, #f4d67a 0%, #c8973a 40%, #8a6420 100%)",
          boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-1 z-20 flex justify-around px-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-3 w-3 rounded-full" style={{
            background: "radial-gradient(circle at 30% 30%, #ffe8a0, #8a6420)",
            boxShadow: "inset 0 -1px 2px rgba(0,0,0,0.5)",
          }} />
        ))}
      </div>

      {/* Left curtain */}
      <div
        className="absolute inset-y-0 left-0 z-10 w-[55%] origin-left"
        style={{ animation: "cc-left 2000ms cubic-bezier(.6,.05,.3,1) 400ms forwards" }}
      >
        <VelvetCurtain pleats={pleats} side="left" />
      </div>
      {/* Right curtain */}
      <div
        className="absolute inset-y-0 right-0 z-10 w-[55%] origin-right"
        style={{ animation: "cc-right 2000ms cubic-bezier(.6,.05,.3,1) 400ms forwards" }}
      >
        <VelvetCurtain pleats={pleats} side="right" />
      </div>

      {/* Tie-back tassels (fly away with curtains) */}
      <div className="pointer-events-none absolute left-[8%] top-1/2 z-20 -translate-y-1/2"
        style={{ ["--tx" as string]: "-60px", ["--tr" as string]: "-25deg", animation: "cc-tassel 2000ms cubic-bezier(.6,.05,.3,1) 400ms forwards" }}
      >
        <Tassel />
      </div>
      <div className="pointer-events-none absolute right-[8%] top-1/2 z-20 -translate-y-1/2"
        style={{ ["--tx" as string]: "60px", ["--tr" as string]: "25deg", animation: "cc-tassel 2000ms cubic-bezier(.6,.05,.3,1) 400ms forwards" }}
      >
        <Tassel flipped />
      </div>

      <SkipButton onClick={onDone} />
    </div>
  );
}

function VelvetCurtain({ pleats, side }: { pleats: number; side: "left" | "right" }) {
  const dark = "#4a0810";
  const mid = "#8a1220";
  const bright = "#c81e2c";
  // Build vertical pleat gradient (repeating)
  const stops: string[] = [];
  for (let i = 0; i < pleats; i++) {
    const start = (i / pleats) * 100;
    const mid1 = ((i + 0.5) / pleats) * 100;
    const end = ((i + 1) / pleats) * 100;
    stops.push(`${dark} ${start}%`, `${bright} ${mid1}%`, `${dark} ${end}%`);
  }
  const pleatBg = `linear-gradient(90deg, ${stops.join(", ")})`;
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Velvet body with pleats */}
      <div
        className="absolute inset-0"
        style={{
          background: `${pleatBg}, linear-gradient(180deg, ${mid} 0%, ${dark} 100%)`,
          backgroundBlendMode: "multiply, normal",
        }}
      />
      {/* Side shadow toward opening edge */}
      <div
        className="pointer-events-none absolute inset-y-0 w-24"
        style={{
          [side === "left" ? "right" : "left"]: 0,
          background:
            side === "left"
              ? "linear-gradient(90deg, transparent, rgba(0,0,0,0.55))"
              : "linear-gradient(270deg, transparent, rgba(0,0,0,0.55))",
        }}
      />
      {/* Scalloped bottom fringe */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-6"
        viewBox="0 0 400 24"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`fringe-${side}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f4d67a" />
            <stop offset="100%" stopColor="#8a6420" />
          </linearGradient>
        </defs>
        <path
          d="M0 0 L400 0 L400 8 Q380 24 360 8 Q340 24 320 8 Q300 24 280 8 Q260 24 240 8 Q220 24 200 8 Q180 24 160 8 Q140 24 120 8 Q100 24 80 8 Q60 24 40 8 Q20 24 0 8 Z"
          fill={`url(#fringe-${side})`}
        />
      </svg>
    </div>
  );
}

function Tassel({ flipped = false }: { flipped?: boolean }) {
  return (
    <svg width="50" height="90" viewBox="0 0 50 90" style={{ transform: flipped ? "scaleX(-1)" : undefined }}>
      <defs>
        <linearGradient id="tassel-cord" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f4d67a" />
          <stop offset="100%" stopColor="#8a6420" />
        </linearGradient>
        <radialGradient id="tassel-ball" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffe8a0" />
          <stop offset="100%" stopColor="#8a6420" />
        </radialGradient>
      </defs>
      <path d="M5 0 Q0 25 20 40" stroke="url(#tassel-cord)" strokeWidth="3" fill="none" />
      <ellipse cx="22" cy="46" rx="10" ry="8" fill="url(#tassel-ball)" />
      <g stroke="#c8973a" strokeWidth="1.2">
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={i} x1={14 + i * 2.5} y1="52" x2={14 + i * 2.5} y2={76 + (i % 2 ? 4 : 0)} />
        ))}
      </g>
    </svg>
  );
}

/* ==================================================
 * EFFECT 5 — Pétales Tombants
 * ================================================== */

function FallingPetals({ couple, onDone }: { couple: Couple; onDone: () => void }) {
  useAutoClose(3500, onDone);
  const accent = couple.accent ?? "#993556";

  const petals = useMemo(() => {
    const shapes = ["a", "b", "c", "d", "e"] as const;
    const xs = [3, 8, 14, 19, 25, 31, 37, 42, 48, 53, 58, 63, 68, 73, 78, 83, 88, 93, 6, 12, 22, 32, 44, 55, 66, 77, 85, 92, 4, 18, 28, 39, 50, 61, 72, 82];
    return xs.map((x, i) => {
      const bucket = i % 5;
      const dur = 2000 + bucket * 400;
      const delay = (i * 42) % 1500;
      const rot = (i % 2 ? 360 : -240) + (i % 3) * 40;
      const size = 12 + (i % 4) * 4;
      const colorMode = i % 5;
      let color = accent;
      if (colorMode === 1 || colorMode === 3) color = lighten(accent, 0.3);
      else if (colorMode === 4) color = "rgba(255,255,255,0.9)";
      return { x, shape: shapes[i % 5], dur, delay, rot, size, color, opacity: 0.65 + (i % 4) * 0.1 };
    });
  }, [accent]);

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-black/40 backdrop-blur-[1px]">
      <style>{`
        @keyframes fp-fall {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          10% { opacity: var(--o); }
          33% { transform: translate(15px, 30vh) rotate(calc(var(--r) * 0.33)); }
          66% { transform: translate(-8px, 66vh) rotate(calc(var(--r) * 0.66)); }
          100% { transform: translate(5px, 115vh) rotate(var(--r)); opacity: 0; }
        }
        @keyframes fp-vanish { to { opacity: 0; } }
      `}</style>
      {petals.map((p, i) => (
        <div
          key={i}
          className="absolute -top-16 will-change-transform"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            ["--r" as string]: `${p.rot}deg`,
            ["--o" as string]: p.opacity,
            animation: `fp-fall ${p.dur}ms linear ${p.delay}ms forwards, fp-vanish 500ms ease forwards ${3000}ms`,
          }}
        >
          <PetalShape kind={p.shape} color={p.color} />
        </div>
      ))}
      <SkipButton onClick={onDone} />
    </div>
  );
}

function PetalShape({ kind, color }: { kind: "a" | "b" | "c" | "d" | "e"; color: string }) {
  const common = { fill: color } as const;
  switch (kind) {
    case "a":
      return <svg viewBox="0 0 20 20" width="100%" height="100%"><ellipse cx="10" cy="10" rx="5" ry="9" {...common} /></svg>;
    case "b":
      return <svg viewBox="0 0 20 20" width="100%" height="100%"><path d="M10 1C6 6 6 14 10 19 14 14 14 6 10 1Z" {...common} /></svg>;
    case "c":
      return <svg viewBox="0 0 20 20" width="100%" height="100%"><path d="M10 2C4 8 4 14 10 18 16 14 16 8 10 2Z" {...common} opacity="0.9" /></svg>;
    case "d":
      return <svg viewBox="0 0 20 20" width="100%" height="100%"><circle cx="10" cy="10" r="6" {...common} /></svg>;
    case "e":
      return <svg viewBox="0 0 20 20" width="100%" height="100%"><path d="M10 2 C14 8 14 14 10 18 C6 14 6 8 10 2Z" {...common} /></svg>;
  }
}

/* ==================================================
 * EFFECT 6 — Livre qui s'ouvre
 * ================================================== */

function BookOpen({ couple, onDone }: { couple: Couple; onDone: () => void }) {
  const [opened, setOpened] = useState(false);
  const { a, b } = initials(couple);
  const accent = couple.accent ?? "#993556";
  const cover = mix(accent, "#ffffff", 0.4);
  const duration = 3200;

  useEffect(() => {
    if (!opened) return;
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [opened, onDone]);

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[#1a1a1a]" style={{ perspective: 1400 }}>
      <style>{`
        @keyframes bo-left { 0%{transform:rotateY(0)} 100%{transform:rotateY(-170deg)} }
        @keyframes bo-right { 0%{transform:rotateY(0)} 100%{transform:rotateY(170deg)} }
        @keyframes bo-pages { 0%,40%{opacity:0} 100%{opacity:1} }
        @keyframes bo-title { 0%,60%{opacity:0;transform:scale(0.95)} 100%{opacity:1;transform:scale(1)} }
        @keyframes bo-out { to { opacity: 0; transform: scale(1.08); } }
        .bo-3d { transform-style: preserve-3d; }
      `}</style>

      <div
        className="relative"
        style={{
          width: "75vw",
          maxWidth: 380,
          aspectRatio: "3 / 4",
          animation: opened ? `bo-out 500ms ease forwards ${duration - 500}ms` : undefined,
        }}
      >
        {/* Inner pages layers */}
        <div className="absolute inset-0 flex bo-3d">
          <div className="h-full w-1/2 bg-white" />
          <div className="h-full w-1/2" style={{ background: "#FBF9F4" }} />
          <div
            className="absolute inset-0 grid place-items-center text-center"
            style={{ animation: opened ? "bo-title 700ms ease forwards 1800ms" : undefined, opacity: 0 }}
          >
            <div>
              <p className="font-serif text-2xl italic" style={{ color: accent }}>{couple.brideName}</p>
              <p className="my-1 font-serif text-sm italic opacity-70">&amp;</p>
              <p className="font-serif text-2xl italic" style={{ color: accent }}>{couple.groomName}</p>
              <p className="mt-2 text-[10px] uppercase tracking-widest opacity-60">
                {formatDate(couple.weddingDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Left cover */}
        <div
          className="absolute inset-y-0 left-0 w-1/2 bo-3d"
          style={{
            background: cover,
            transformOrigin: "left center",
            animation: opened ? "bo-left 1500ms ease-in-out 200ms forwards" : undefined,
            boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
          }}
        >
          <BookCoverDecor color={accent} initials={`${a} & ${b}`} name={couple.brideName} align="right" />
        </div>
        {/* Right cover */}
        <div
          className="absolute inset-y-0 right-0 w-1/2 bo-3d"
          style={{
            background: cover,
            transformOrigin: "right center",
            animation: opened ? "bo-right 1500ms ease-in-out 300ms forwards" : undefined,
            boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
          }}
        >
          <BookCoverDecor color={accent} initials={`${a} & ${b}`} name={couple.groomName} align="left" />
        </div>
      </div>

      {!opened && (
        <button
          type="button"
          onClick={() => setOpened(true)}
          className="absolute bottom-14 rounded-full bg-white/90 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-800 shadow"
        >
          Tap to open
        </button>
      )}

      <SkipButton onClick={onDone} />
    </div>
  );
}

function BookCoverDecor({ color, initials, name, align }: { color: string; initials: string; name: string; align: "left" | "right" }) {
  return (
    <div className="absolute inset-0 grid place-items-center px-4 text-white">
      <div className={`w-full text-center`}>
        <div className="mx-auto grid size-16 place-items-center rounded-full" style={{ background: color, border: "1px solid #C8973A" }}>
          <span className="font-serif text-lg italic">{initials}</span>
        </div>
        <p className="mt-3 font-serif text-sm italic">{name}</p>
      </div>
      <div className="pointer-events-none absolute inset-3 border" style={{ borderColor: "#C8973A" }} />
    </div>
  );
}

/* -------- Color helpers -------- */

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function toHex(r: number, g: number, b: number) {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
function lighten(hex: string, amt: number) {
  try {
    const [r, g, b] = parseHex(hex);
    return toHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
  } catch { return hex; }
}
function darken(hex: string, amt: number) {
  try {
    const [r, g, b] = parseHex(hex);
    return toHex(r * (1 - amt), g * (1 - amt), b * (1 - amt));
  } catch { return hex; }
}
function mix(a: string, b: string, ratio: number) {
  try {
    const [ar, ag, ab] = parseHex(a);
    const [br, bg, bb] = parseHex(b);
    return toHex(ar * (1 - ratio) + br * ratio, ag * (1 - ratio) + bg * ratio, ab * (1 - ratio) + bb * ratio);
  } catch { return a; }
}
function luminance(hex: string) {
  try {
    const [r, g, b] = parseHex(hex);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  } catch { return 0.5; }
}
function isLight(hex: string) { return luminance(hex) > 0.78; }
function isWarm(hex: string) {
  try {
    const [r, , b] = parseHex(hex);
    return r >= b;
  } catch { return true; }
}
