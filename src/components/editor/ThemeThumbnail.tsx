import { THEMES, BACKGROUNDS, type BackgroundSlug } from "@/lib/wedding-theme";
import type { ThemeId } from "@/lib/wedding-store";

interface ThemeThumbnailProps {
  theme: ThemeId;
  /** Ratio 3/4 by default; card sizes itself to its container width. */
  className?: string;
}

function bgHex(slug: BackgroundSlug): string {
  return BACKGROUNDS.find((b) => b.slug === slug)?.hex ?? "#F5EFE7";
}

/**
 * Live HTML/CSS + inline SVG preview of a theme. Each theme carries a
 * distinctive ornament that reflects its family signature. Fonts are the
 * real theme fonts, colors are the theme defaults.
 */
export function ThemeThumbnail({ theme, className }: ThemeThumbnailProps) {
  const t = THEMES[theme];
  const bg = bgHex(t.defaultBg);
  const accent = t.defaultAccent;

  return (
    <div
      className={
        "relative flex aspect-[3/4] w-full flex-col items-center justify-center overflow-hidden px-2 text-center " +
        (className ?? "")
      }
      style={{ background: bg }}
    >
      <Ornament theme={theme} accent={accent} />

      <div className="relative z-10 flex flex-col items-center">
        <p
          className="mb-1 font-mono text-[7px] uppercase tracking-[0.25em]"
          style={{ color: accent }}
        >
          Save the date
        </p>
        <p
          className="text-[13px] leading-[1.05] italic"
          style={{ fontFamily: t.fontHeading, color: "#1A1A1A" }}
        >
          Aïcha
          <br />
          <span
            className="inline-block px-1 not-italic"
            style={{ fontFamily: t.fontHeading, color: accent }}
          >
            &amp;
          </span>
          <br />
          Kouamé
        </p>
        <span
          className="mt-1.5 block h-px w-6"
          style={{ background: accent }}
        />
        <p
          className="mt-1 font-mono text-[6px] uppercase tracking-[0.3em]"
          style={{ color: accent, opacity: 0.7 }}
        >
          14.02.27
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Per-theme ornament layers (inline SVG, no external assets)          */
/* ------------------------------------------------------------------ */

function Ornament({ theme, accent }: { theme: ThemeId; accent: string }) {
  switch (theme) {
    /* -------- Classiques -------- */
    case "rose-elegance":
      return (
        <svg
          className="absolute inset-0 h-full w-full opacity-70"
          viewBox="0 0 100 133"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M50 8 C 42 20, 58 20, 50 32"
            stroke={accent}
            strokeWidth="0.5"
            fill="none"
          />
          <circle cx="50" cy="8" r="1" fill={accent} />
          <circle cx="50" cy="32" r="1" fill={accent} />
        </svg>
      );

    case "ivoire-epure":
      return (
        <>
          <span
            className="absolute left-4 right-4 top-3 h-px"
            style={{ background: accent, opacity: 0.4 }}
          />
          <span
            className="absolute left-4 right-4 bottom-3 h-px"
            style={{ background: accent, opacity: 0.4 }}
          />
        </>
      );

    case "or-antique":
      return (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 133"
          preserveAspectRatio="none"
          aria-hidden
        >
          <g stroke={accent} strokeWidth="0.3" fill="none" opacity="0.5">
            <path d="M8 8 Q 12 4, 18 8 M 82 8 Q 88 4, 92 8" />
            <path d="M8 125 Q 12 129, 18 125 M 82 125 Q 88 129, 92 125" />
            <path d="M8 8 L 8 22 M 92 8 L 92 22 M 8 125 L 8 111 M 92 125 L 92 111" />
          </g>
        </svg>
      );

    /* -------- Botaniques -------- */
    case "vert-sauge":
      return (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 133"
          preserveAspectRatio="none"
          aria-hidden
        >
          <g stroke={accent} strokeWidth="0.6" fill="none" opacity="0.55">
            {/* left sprig */}
            <path d="M14 66 Q 22 60, 26 68" />
            <path d="M14 66 Q 20 70, 26 68" />
            <path d="M10 62 L 20 66 M 12 70 L 22 68" />
            {/* right sprig, mirrored */}
            <path d="M86 66 Q 78 60, 74 68" />
            <path d="M86 66 Q 80 70, 74 68" />
            <path d="M90 62 L 80 66 M 88 70 L 78 68" />
          </g>
        </svg>
      );

    case "jardin-sauvage":
      return (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 133"
          preserveAspectRatio="none"
          aria-hidden
        >
          <g fill={accent} opacity="0.5">
            <circle cx="14" cy="16" r="2.2" />
            <circle cx="20" cy="20" r="1.4" />
            <circle cx="86" cy="116" r="2.4" />
            <circle cx="80" cy="120" r="1.4" />
          </g>
          <g stroke={accent} strokeWidth="0.5" fill="none" opacity="0.6">
            <path d="M12 22 Q 18 28, 22 26" />
            <path d="M88 110 Q 82 104, 78 108" />
          </g>
        </svg>
      );

    case "terracotta-boheme":
      return (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 133"
          preserveAspectRatio="none"
          aria-hidden
        >
          <g stroke={accent} strokeWidth="0.4" fill="none" opacity="0.35">
            {/* pampas strokes */}
            <path d="M20 128 Q 22 100, 24 80" />
            <path d="M22 128 Q 24 105, 26 85" />
            <path d="M18 128 Q 20 108, 22 88" />
            <path d="M80 128 Q 78 100, 76 80" />
            <path d="M78 128 Q 76 105, 74 85" />
            <path d="M82 128 Q 80 108, 78 88" />
          </g>
        </svg>
      );

    /* -------- Héritage africain -------- */
    case "wax-dore":
      return (
        <>
          <WaxBand accent={accent} className="absolute inset-x-0 top-0 h-3" />
          <WaxBand accent={accent} className="absolute inset-x-0 bottom-0 h-3" />
        </>
      );

    case "kente-royal":
      return (
        <>
          <KenteStripe accent={accent} className="absolute inset-y-0 left-0 w-2" />
          <KenteStripe accent={accent} className="absolute inset-y-0 right-0 w-2" />
        </>
      );

    case "sahel-dore":
      return (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 133"
          preserveAspectRatio="none"
          aria-hidden
        >
          <g stroke={accent} strokeWidth="0.4" fill="none" opacity="0.55">
            <path d="M0 118 Q 30 108, 50 116 T 100 114" />
            <path d="M0 124 Q 30 118, 50 122 T 100 122" />
            <path d="M10 12 L 16 6 L 22 12" />
            <path d="M78 12 L 84 6 L 90 12" />
          </g>
        </svg>
      );

    /* -------- Modernes -------- */
    case "bleu-nuit":
      return (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${accent}22 0%, transparent 60%)`,
          }}
        />
      );

    case "manuscrit":
      return (
        <>
          <span
            className="absolute left-2 right-2 top-6 h-px"
            style={{ background: accent, opacity: 0.6 }}
          />
          <span
            className="absolute left-2 right-2 bottom-6 h-px"
            style={{ background: accent, opacity: 0.6 }}
          />
          <span
            className="absolute bottom-1.5 left-2 font-mono text-[6px] tracking-widest opacity-50"
            style={{ color: accent }}
          >
            01
          </span>
          <span
            className="absolute bottom-1.5 right-2 font-mono text-[6px] tracking-widest opacity-50"
            style={{ color: accent }}
          >
            AA
          </span>
        </>
      );

    case "monochrome":
      return (
        <>
          <span className="absolute left-3 top-0 h-full w-px bg-black/10" />
          <span className="absolute right-3 top-0 h-full w-px bg-black/10" />
        </>
      );

    /* -------- Illustrés -------- */
    case "aquarelle":
      return (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 133"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <radialGradient id="aqua1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.45" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="30" cy="40" rx="30" ry="22" fill="url(#aqua1)" />
          <ellipse cx="72" cy="95" rx="26" ry="20" fill="url(#aqua1)" />
        </svg>
      );

    case "confetti":
      return (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 133"
          preserveAspectRatio="none"
          aria-hidden
        >
          <g fill={accent}>
            <rect x="10" y="14" width="3" height="1.2" transform="rotate(20 10 14)" />
            <circle cx="88" cy="18" r="1.4" />
            <rect x="14" y="118" width="1.2" height="3" transform="rotate(-30 14 118)" />
            <circle cx="86" cy="112" r="1.2" />
            <rect x="6" y="60" width="2.5" height="1" transform="rotate(40 6 60)" />
            <rect x="92" y="70" width="1" height="2.5" transform="rotate(60 92 70)" />
          </g>
          <g fill={accent} opacity="0.5">
            <circle cx="20" cy="30" r="1" />
            <circle cx="80" cy="100" r="1" />
            <circle cx="12" cy="90" r="0.8" />
            <circle cx="90" cy="46" r="0.8" />
          </g>
        </svg>
      );

    case "papier-kraft":
      return (
        <>
          {/* dashed border */}
          <span
            className="pointer-events-none absolute inset-1.5 rounded-[2px]"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, ${accent} 0 3px, transparent 3px 6px), repeating-linear-gradient(0deg, ${accent} 0 3px, transparent 3px 6px)`,
              backgroundSize: "100% 1px, 1px 100%",
              backgroundPosition: "top left, top left, bottom left, top right",
              backgroundRepeat: "no-repeat, no-repeat, no-repeat, no-repeat",
              opacity: 0.4,
            }}
          />
          {/* postmark */}
          <div
            className="absolute right-2 top-2 grid size-6 place-items-center rounded-full border font-mono text-[5px] uppercase leading-none"
            style={{
              borderColor: accent,
              color: accent,
              opacity: 0.75,
              transform: "rotate(-12deg)",
            }}
          >
            <span className="text-center">
              14
              <br />
              02
            </span>
          </div>
        </>
      );

    default:
      return null;
  }
}

/* --- Wax repeating band (diamonds) --- */
function WaxBand({ accent, className }: { accent: string; className?: string }) {
  return (
    <div
      className={"pointer-events-none " + (className ?? "")}
      style={{
        backgroundImage: `linear-gradient(45deg, ${accent} 25%, transparent 25%), linear-gradient(-45deg, ${accent} 25%, transparent 25%)`,
        backgroundSize: "6px 6px",
        backgroundPosition: "0 0, 3px 0",
        opacity: 0.4,
      }}
    />
  );
}

/* --- Kente vertical stripe (mixed geometric bands) --- */
function KenteStripe({ accent, className }: { accent: string; className?: string }) {
  return (
    <div
      className={"pointer-events-none " + (className ?? "")}
      style={{
        backgroundImage: `repeating-linear-gradient(0deg, ${accent} 0 4px, transparent 4px 6px, ${accent}80 6px 8px, transparent 8px 12px)`,
        opacity: 0.75,
      }}
    />
  );
}
