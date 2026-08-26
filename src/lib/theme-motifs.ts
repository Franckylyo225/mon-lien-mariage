import type { ThemeId } from "./wedding-store";
import { THEMES } from "./wedding-theme";

export interface ThemeMotif {
  /** Raw SVG tile (will be URL-encoded as a data URI). */
  svg: string;
  /** Tile size in CSS pixels. */
  size: number;
  /** Overlay opacity. */
  opacity: number;
}

type MotifBuilder = (deep: string, accent: string) => ThemeMotif;

const tile = (size: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${body}</svg>`;

const MOTIFS: Partial<Record<ThemeId, MotifBuilder>> = {
  // A1 — Adinkra: étoile rayonnante
  "indigo-adinkra": (deep, accent) => ({
    size: 48,
    opacity: 0.15,
    svg: tile(
      48,
      `<g fill="none" stroke="${deep}" stroke-width="1.4">
        <path d="M24 6 L24 42 M6 24 L42 24 M11 11 L37 37 M37 11 L11 37"/>
        <circle cx="24" cy="24" r="7"/>
      </g>
      <circle cx="24" cy="24" r="2.4" fill="${accent}"/>`,
    ),
  }),

  // A2 — Kente: grille croisée
  "kente-souverain": (deep, accent) => ({
    size: 40,
    opacity: 0.2,
    svg: tile(
      40,
      `<g stroke="${deep}" stroke-width="2" fill="none">
        <path d="M0 10 H40 M0 30 H40 M10 0 V40 M30 0 V40"/>
      </g>
      <g stroke="${accent}" stroke-width="2" fill="none">
        <path d="M0 20 H40 M20 0 V40"/>
      </g>`,
    ),
  }),

  // A3 — Bogolan: chevrons
  "bogolan-bordeaux": (deep, accent) => ({
    size: 40,
    opacity: 0.22,
    svg: tile(
      40,
      `<g fill="none" stroke="${deep}" stroke-width="2">
        <path d="M0 14 L10 4 L20 14 L30 4 L40 14"/>
        <path d="M0 34 L10 24 L20 34 L30 24 L40 34"/>
      </g>
      <g fill="none" stroke="${accent}" stroke-width="1.2">
        <path d="M0 20 L10 10 L20 20 L30 10 L40 20"/>
      </g>`,
    ),
  }),

  // A4 — Wax: médaillon concentrique
  "wax-ivoire": (deep, accent) => ({
    size: 56,
    opacity: 0.24,
    svg: tile(
      56,
      `<g fill="none" stroke="${deep}" stroke-width="1.2">
        <circle cx="28" cy="28" r="20"/>
        <circle cx="28" cy="28" r="13"/>
      </g>
      <g fill="none" stroke="${accent}" stroke-width="1.4">
        <circle cx="28" cy="28" r="6"/>
      </g>
      <circle cx="28" cy="28" r="2" fill="${accent}"/>`,
    ),
  }),

  // A5 — Losanges
  "nuit-ebene": (deep, accent) => ({
    size: 44,
    opacity: 0.18,
    svg: tile(
      44,
      `<g fill="none" stroke="${deep}" stroke-width="1.2">
        <path d="M22 2 L42 22 L22 42 L2 22 Z"/>
        <path d="M22 12 L32 22 L22 32 L12 22 Z"/>
      </g>
      <circle cx="22" cy="22" r="2" fill="${accent}"/>`,
    ),
  }),

  // M1 — Zellige: étoile à 8 branches
  "zellige-emeraude": (deep, accent) => ({
    size: 52,
    opacity: 0.18,
    svg: tile(
      52,
      `<g fill="none" stroke="${deep}" stroke-width="1.3">
        <path d="M26 3 L33 19 L49 26 L33 33 L26 49 L19 33 L3 26 L19 19 Z"/>
        <rect x="14" y="14" width="24" height="24" transform="rotate(45 26 26)"/>
      </g>
      <circle cx="26" cy="26" r="2.2" fill="${accent}"/>`,
    ),
  }),

  // M2 — Mashrabiya: treillis carré
  "mashrabiya-sable": (deep, accent) => ({
    size: 40,
    opacity: 0.2,
    svg: tile(
      40,
      `<g fill="none" stroke="${deep}" stroke-width="1.2">
        <rect x="4" y="4" width="32" height="32"/>
        <rect x="10" y="10" width="20" height="20" transform="rotate(45 20 20)"/>
        <path d="M20 0 V40 M0 20 H40"/>
      </g>
      <circle cx="20" cy="20" r="2" fill="${accent}"/>`,
    ),
  }),

  // M3 — Arabesque: entrelacs
  "arabesque-bordeaux": (deep, accent) => ({
    size: 56,
    opacity: 0.16,
    svg: tile(
      56,
      `<g fill="none" stroke="${deep}" stroke-width="1.3">
        <path d="M0 28 Q14 6 28 28 Q42 50 56 28"/>
        <path d="M0 28 Q14 50 28 28 Q42 6 56 28"/>
      </g>
      <g fill="none" stroke="${accent}" stroke-width="1">
        <circle cx="28" cy="28" r="4"/>
      </g>`,
    ),
  }),

  // M4 — Girih: pentagone étoilé
  "nacre-girih": (deep, accent) => ({
    size: 60,
    opacity: 0.17,
    svg: tile(
      60,
      `<g fill="none" stroke="${deep}" stroke-width="1.2">
        <path d="M30 4 L56 23 L46 54 L14 54 L4 23 Z"/>
        <path d="M30 16 L44 26 L38 43 L22 43 L16 26 Z"/>
      </g>
      <g fill="none" stroke="${accent}" stroke-width="1">
        <path d="M30 4 L30 16 M56 23 L44 26 M46 54 L38 43 M14 54 L22 43 M4 23 L16 26"/>
      </g>`,
    ),
  }),

  // M5 — Calligraphie: minimaliste
  "calligraphie-nuit": (deep, accent) => ({
    size: 64,
    opacity: 0.12,
    svg: tile(
      64,
      `<g fill="none" stroke="${deep}" stroke-width="1.1" stroke-linecap="round">
        <path d="M8 44 Q20 20 32 44 Q44 68 56 44"/>
        <path d="M12 20 H52"/>
      </g>
      <circle cx="32" cy="14" r="1.8" fill="${accent}"/>`,
    ),
  }),
};

/** Decorative background motif for a theme, or null when it has none. */
export function motifForTheme(
  theme: ThemeId,
  accent?: string,
): ThemeMotif | null {
  const build = MOTIFS[theme];
  if (!build) return null;
  const def = THEMES[theme];
  return build(def?.deep ?? "#1A1A1A", accent ?? def?.defaultAccent ?? "#C9A227");
}

/** CSS `background-image` value for a motif. */
export function motifBackgroundImage(motif: ThemeMotif): string {
  return `url("data:image/svg+xml,${encodeURIComponent(motif.svg)}")`;
}

/** Decorative hero band CSS for a theme, if any. */
export function bandForTheme(theme: ThemeId): string | null {
  return THEMES[theme]?.bandCss ?? null;
}
