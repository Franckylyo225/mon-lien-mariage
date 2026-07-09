import { useEffect, useMemo, useState } from "react";
import type { Couple } from "@/lib/wedding-store";

export const OPENING_EFFECT_SLUGS = [
  "envelope-royal",
  "envelope-floral",
  "grand-portal",
  "cinema-curtain",
  "falling-petals",
  "book-open",
] as const;

export type OpeningEffectSlug = (typeof OPENING_EFFECT_SLUGS)[number];

export const OPENING_EFFECT_LABELS: Record<OpeningEffectSlug, string> = {
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
 * EFFECT 1 — Enveloppe Royale
 * ================================================== */

function EnvelopeRoyal({ couple, onDone }: { couple: Couple; onDone: () => void }) {
  const [opened, setOpened] = useState(false);
  const { a, b } = initials(couple);
  const duration = 2400;
  const accent = couple.accent ?? "#C8973A";

  useEffect(() => {
    if (!opened) return;
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [opened, onDone]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#EDE4D3]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 30% 20%, rgba(212,197,176,0.5), transparent 40%), radial-gradient(circle at 70% 70%, rgba(212,197,176,0.5), transparent 40%)",
      }}
    >
      <style>{`
        @keyframes er-flap { 0%{transform:rotateX(0)} 100%{transform:rotateX(-180deg)} }
        @keyframes er-card { 0%{transform:translateY(60px);opacity:0} 60%,100%{transform:translateY(-8px);opacity:1} }
        @keyframes er-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
        @keyframes er-fadeout { to { opacity: 0; } }
        .er-flap { transform-origin: top center; transform-style: preserve-3d; }
      `}</style>

      <div
        className="relative"
        style={{
          perspective: 900,
          animation: opened ? `er-fadeout 400ms ease forwards ${duration - 400}ms` : undefined,
        }}
      >
        <div className="relative mx-auto" style={{ width: 300, height: 210 }}>
          {/* Envelope body */}
          <div className="absolute inset-0 rounded-md shadow-2xl"
            style={{ background: "#E1D3B8", border: "1px solid rgba(120,90,40,0.3)" }}
          />
          {/* Card inside */}
          <div
            className="absolute inset-3 flex flex-col items-center justify-center rounded-sm bg-[#FDFBF6] px-6 py-8 text-center shadow-inner"
            style={{
              animation: opened ? "er-card 900ms cubic-bezier(.2,.7,.2,1) 500ms both" : undefined,
              opacity: opened ? undefined : 0,
              zIndex: 1,
            }}
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.3em]" style={{ color: accent }}>
              Vous êtes convié·e
            </p>
            <p className="mt-3 font-serif text-2xl italic text-[#5C3D0A]">{couple.brideName}</p>
            <p className="my-1 font-serif text-sm italic text-[#7A5C2E]">&amp;</p>
            <p className="font-serif text-2xl italic text-[#5C3D0A]">{couple.groomName}</p>
            <p className="mt-3 text-[10px] uppercase tracking-wider text-[#7A5C2E]/70">
              {formatDate(couple.weddingDate)} · {couple.city}
            </p>
          </div>

          {/* Flap + seal (rotates together) */}
          <div
            className="er-flap absolute inset-x-0 top-0"
            style={{
              height: 120,
              animation: opened ? "er-flap 800ms ease forwards" : undefined,
              zIndex: 2,
            }}
          >
            <svg viewBox="0 0 300 120" width="100%" height="100%">
              <polygon points="0,0 300,0 150,110" fill="#C7B48F" stroke="rgba(120,90,40,0.35)" strokeWidth="1" />
            </svg>
            {/* Seal on flap */}
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{ top: 62, animation: opened ? undefined : "er-pulse 2s ease infinite" }}
            >
              <svg width="56" height="42" viewBox="0 0 56 42">
                <defs>
                  <radialGradient id="er-seal" cx="50%" cy="40%" r="60%">
                    <stop offset="0%" stopColor={lighten(accent, 0.2)} />
                    <stop offset="100%" stopColor={darken(accent, 0.15)} />
                  </radialGradient>
                </defs>
                <ellipse cx="28" cy="21" rx="26" ry="19" fill="url(#er-seal)" stroke={darken(accent, 0.25)} strokeWidth="1" />
                <ellipse cx="28" cy="21" rx="20" ry="14" fill="none" stroke={darken(accent, 0.35)} strokeWidth="0.6" />
                <text
                  x="28" y="26" textAnchor="middle"
                  fontFamily="Cormorant Garamond, Playfair Display, serif"
                  fontStyle="italic" fontSize="14" fill="#5C3D0A"
                >
                  {a} & {b}
                </text>
              </svg>
            </div>
          </div>
        </div>

        {!opened && (
          <button
            type="button"
            onClick={() => setOpened(true)}
            className="mt-8 mx-auto block rounded-full bg-white/85 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#7A5C2E] shadow"
            style={{ animation: "er-pulse 2s ease infinite" }}
          >
            Tap to open
          </button>
        )}
      </div>

      <SkipButton onClick={onDone} />
    </div>
  );
}

/* ==================================================
 * EFFECT 2 — Enveloppe Florale
 * ================================================== */

function EnvelopeFloral({ couple, onDone }: { couple: Couple; onDone: () => void }) {
  const [opened, setOpened] = useState(false);
  const { a, b } = initials(couple);
  const duration = 2400;
  const accent = couple.accent ?? "#C8973A";
  const sealColor = isWarm(accent) ? accent : "#C8973A";

  useEffect(() => {
    if (!opened) return;
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [opened, onDone]);

  // 8 flower positions on the background
  const flowers = [
    { x: 8, y: 12, s: 1.2, r: -12, c: "#E8B4B8" },
    { x: 82, y: 10, s: 1.4, r: 20, c: "#F2C4A3" },
    { x: 12, y: 78, s: 1.6, r: 8, c: "#B8CDB3" },
    { x: 88, y: 85, s: 1.2, r: -20, c: "#D8B8DA" },
    { x: 4, y: 42, s: 0.9, r: 40, c: "#F1D6D8" },
    { x: 90, y: 40, s: 1.0, r: -30, c: "#C9DDC5" },
    { x: 45, y: 4, s: 0.8, r: 0, c: "#F2C4A3" },
    { x: 50, y: 92, s: 0.9, r: 15, c: "#E8B4B8" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FAFAF8]">
      <style>{`
        @keyframes ef-flap { 0%{transform:rotateX(0)} 100%{transform:rotateX(-180deg)} }
        @keyframes ef-card { 0%{transform:translateY(60px);opacity:0} 60%,100%{transform:translateY(-8px);opacity:1} }
        @keyframes ef-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        @keyframes ef-drop { 0%{transform:translateY(0);opacity:1} 100%{transform:translateY(10px);opacity:0} }
        @keyframes ef-fadeout { to { opacity: 0; } }
        .ef-flap { transform-origin: top center; transform-style: preserve-3d; }
      `}</style>

      {/* Watercolor flowers */}
      {flowers.map((f, i) => (
        <svg
          key={i}
          className="pointer-events-none absolute"
          style={{ left: `${f.x}%`, top: `${f.y}%`, transform: `translate(-50%,-50%) scale(${f.s}) rotate(${f.r}deg)`, opacity: 0.7 }}
          width="60" height="60" viewBox="0 0 60 60"
        >
          <g fill={f.c}>
            <circle cx="30" cy="18" r="10" />
            <circle cx="18" cy="30" r="10" />
            <circle cx="42" cy="30" r="10" />
            <circle cx="30" cy="42" r="10" />
            <circle cx="30" cy="30" r="6" fill="#F7E3B8" />
          </g>
        </svg>
      ))}

      <div
        className="relative"
        style={{
          perspective: 900,
          animation: opened ? `ef-fadeout 400ms ease forwards ${duration - 400}ms` : undefined,
        }}
      >
        <div className="relative mx-auto" style={{ width: 300, height: 210 }}>
          <div className="absolute inset-0 rounded-md shadow-xl" style={{ background: "#F7EFE4", border: "1px solid rgba(180,140,90,0.25)" }} />
          <div
            className="absolute inset-3 flex flex-col items-center justify-center rounded-sm bg-white px-6 py-8 text-center"
            style={{
              animation: opened ? "ef-card 900ms cubic-bezier(.2,.7,.2,1) 500ms both" : undefined,
              opacity: opened ? undefined : 0,
              boxShadow: `inset 0 0 0 1px ${sealColor}22`,
              zIndex: 1,
            }}
          >
            <p className="mt-1 font-serif text-2xl italic" style={{ color: sealColor }}>{couple.brideName}</p>
            <p className="my-1 font-serif text-sm italic opacity-70">&amp;</p>
            <p className="font-serif text-2xl italic" style={{ color: sealColor }}>{couple.groomName}</p>
            <p className="mt-3 text-[10px] uppercase tracking-wider opacity-60">{formatDate(couple.weddingDate)}</p>
          </div>

          <div
            className="ef-flap absolute inset-x-0 top-0"
            style={{ height: 120, animation: opened ? "ef-flap 800ms ease forwards" : undefined, zIndex: 2 }}
          >
            <svg viewBox="0 0 300 120" width="100%" height="100%">
              <polygon points="0,0 300,0 150,110" fill="#EAD9C0" stroke="rgba(180,140,90,0.3)" strokeWidth="1" />
              {/* Floral garland */}
              <g style={{ animation: opened ? "ef-drop 500ms ease forwards" : undefined }}>
                {[70, 110, 150, 190, 230].map((x, idx) => (
                  <g key={idx} transform={`translate(${x},${90 - Math.abs(x - 150) * 0.15})`}>
                    <circle r="6" fill={idx % 2 ? "#E8B4B8" : "#B8CDB3"} />
                    <circle r="3" fill="#F7E3B8" />
                  </g>
                ))}
              </g>
            </svg>
            <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 58, animation: opened ? undefined : "ef-pulse 2s ease infinite" }}>
              <svg width="48" height="48" viewBox="0 0 48 48">
                <defs>
                  <radialGradient id="ef-seal" cx="50%" cy="40%" r="60%">
                    <stop offset="0%" stopColor={lighten(sealColor, 0.2)} />
                    <stop offset="100%" stopColor={darken(sealColor, 0.15)} />
                  </radialGradient>
                </defs>
                <circle cx="24" cy="24" r="22" fill="url(#ef-seal)" stroke={darken(sealColor, 0.25)} strokeWidth="1" />
                <circle cx="24" cy="24" r="17" fill="none" stroke={darken(sealColor, 0.3)} strokeWidth="0.6" />
                <text x="24" y="29" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontStyle="italic" fontSize="14" fill="#fff">
                  {a}&amp;{b}
                </text>
              </svg>
            </div>
          </div>
        </div>

        {!opened && (
          <button
            type="button"
            onClick={() => setOpened(true)}
            className="mt-8 mx-auto block rounded-full bg-white/90 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.25em] shadow"
            style={{ color: sealColor, animation: "ef-pulse 2s ease infinite" }}
          >
            Tap to open
          </button>
        )}
      </div>

      <SkipButton onClick={onDone} />
    </div>
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
      {/* Ornamental frame */}
      <rect x="14" y="14" width="172" height="572" fill="none" stroke={gold} strokeWidth="1.5" />
      <rect x="22" y="22" width="156" height="556" fill="none" stroke={gold} strokeWidth="0.6" />
      {/* Corner flourishes */}
      {[
        [22, 22],
        [178, 22],
        [22, 578],
        [178, 578],
      ].map(([cx, cy], i) => (
        <g key={i} transform={`translate(${cx},${cy})`}>
          <circle r="4" fill={gold} />
        </g>
      ))}
      {/* Flower garland on inner edge */}
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
 * EFFECT 4 — Rideau de Gala
 * ================================================== */

function CinemaCurtain({ couple, onDone }: { couple: Couple; onDone: () => void }) {
  useAutoClose(4300, onDone);
  const raw = couple.accent ?? "#993556";
  const curtain = isLight(raw) ? "#993556" : raw;

  const stripes = 14;
  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-black">
      <style>{`
        @keyframes cc-left { 0%,15%{transform:translateX(0)} 100%{transform:translateX(-102%)} }
        @keyframes cc-right { 0%,15%{transform:translateX(0)} 100%{transform:translateX(102%)} }
        @keyframes cc-sway { 0%,100%{transform:translateX(0)} 50%{transform:translateX(3px)} }
        @keyframes cc-title { 0%,20%{opacity:0} 50%,100%{opacity:1} }
      `}</style>

      {/* Content behind */}
      <div
        className="absolute inset-0 grid place-items-center text-center text-white"
        style={{ animation: "cc-title 4.3s ease forwards" }}
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] opacity-70">
            {formatDate(couple.weddingDate)}
          </p>
          <p className="mt-4 font-serif text-5xl italic">{couple.brideName}</p>
          <p className="my-2 font-serif text-2xl italic opacity-80">&amp;</p>
          <p className="font-serif text-5xl italic">{couple.groomName}</p>
        </div>
      </div>

      {/* Left curtain */}
      <div
        className="absolute inset-y-0 left-0 w-[55%]"
        style={{ background: curtain, animation: "cc-left 2s ease-in-out 300ms forwards" }}
      >
        <CurtainVelvet stripes={stripes} color={curtain} />
      </div>
      {/* Right curtain */}
      <div
        className="absolute inset-y-0 right-0 w-[55%]"
        style={{ background: curtain, animation: "cc-right 2s ease-in-out 300ms forwards" }}
      >
        <CurtainVelvet stripes={stripes} color={curtain} />
      </div>

      {/* Golden rod */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-3" style={{ background: "#C8973A" }} />

      <SkipButton onClick={onDone} />
    </div>
  );
}

function CurtainVelvet({ stripes, color }: { stripes: number; color: string }) {
  return (
    <>
      <div className="absolute inset-0 flex">
        {Array.from({ length: stripes }).map((_, i) => (
          <div
            key={i}
            className="h-full flex-1"
            style={{
              background: i % 2 ? lighten(color, 0.08) : darken(color, 0.08),
              opacity: 0.85 + (i % 3) * 0.05,
              animation: `cc-sway 3s ease-in-out ${i * 30}ms infinite`,
            }}
          />
        ))}
      </div>
      {/* Fringe */}
      <div className="absolute inset-x-0 bottom-0 flex h-3">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="h-full flex-1" style={{ background: i % 2 ? "#C8973A" : darken("#C8973A", 0.15) }} />
        ))}
      </div>
    </>
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
