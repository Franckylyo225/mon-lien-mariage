import type { ThemeId } from "./wedding-store";
import type {
  CornerKey,
  DividerKey,
  HeroShape,
} from "@/components/invitation-templates/ornaments";

export type HeroLayout =
  /** Photo plein cadre, noms superposés en bas. */
  | "overlay"
  /** Bloc de noms en tête, photo encadrée ensuite. */
  | "names-first"
  /** Photo encadrée en tête, noms dessous. */
  | "photo-first";

export interface ThemeDecor {
  heroLayout: HeroLayout;
  heroShape: HeroShape;
  divider: DividerKey;
  corner: CornerKey;
  /** Séparateur alternatif utilisé avant le programme / la galerie. */
  dividerAlt: DividerKey;
  /** En-tête de page (bandeau plein `deep` ou fond clair). */
  headerFill: "deep" | "light";
  /** Style de la ligne "esperluette" entre les prénoms. */
  ampersand: string;
  /** Casse et graisse du bloc de prénoms. */
  namesCase: "upper" | "normal";
  gallery: "grid" | "masonry" | "mosaic" | "polaroid" | "frames";
  program: "terracotta" | "noir" | "gold" | "tropical" | "deco" | "bleu-nuit";
  /** Lettrage des sur-titres. */
  eyebrowTracking: string;
}

const DECOR: Partial<Record<ThemeId, ThemeDecor>> = {
  /* ---------------- Africains ---------------- */
  "indigo-adinkra": {
    heroLayout: "names-first",
    heroShape: "arch",
    divider: "adinkra",
    dividerAlt: "diamond",
    corner: "adinkra",
    headerFill: "deep",
    ampersand: "✦",
    namesCase: "upper",
    gallery: "grid",
    program: "gold",
    eyebrowTracking: "0.5em",
  },
  "kente-souverain": {
    heroLayout: "photo-first",
    heroShape: "square",
    divider: "kente",
    dividerAlt: "kente",
    corner: "kente",
    headerFill: "light",
    ampersand: "◆",
    namesCase: "upper",
    gallery: "mosaic",
    program: "deco",
    eyebrowTracking: "0.42em",
  },
  "bogolan-bordeaux": {
    heroLayout: "photo-first",
    heroShape: "torn",
    divider: "chevron",
    dividerAlt: "chevron",
    corner: "chevron",
    headerFill: "light",
    ampersand: "⌃",
    namesCase: "upper",
    gallery: "polaroid",
    program: "terracotta",
    eyebrowTracking: "0.38em",
  },
  "wax-ivoire": {
    heroLayout: "names-first",
    heroShape: "circle",
    divider: "medallion",
    dividerAlt: "medallion",
    corner: "ring",
    headerFill: "light",
    ampersand: "◎",
    namesCase: "normal",
    gallery: "frames",
    program: "gold",
    eyebrowTracking: "0.45em",
  },
  "nuit-ebene": {
    heroLayout: "overlay",
    heroShape: "oval",
    divider: "diamond",
    dividerAlt: "diamond",
    corner: "diamond",
    headerFill: "deep",
    ampersand: "◇",
    namesCase: "upper",
    gallery: "masonry",
    program: "noir",
    eyebrowTracking: "0.55em",
  },

  /* ---------------- Orientaux ---------------- */
  "zellige-emeraude": {
    heroLayout: "names-first",
    heroShape: "arch",
    divider: "zellige",
    dividerAlt: "zellige",
    corner: "zellige",
    headerFill: "deep",
    ampersand: "✧",
    namesCase: "normal",
    gallery: "grid",
    program: "gold",
    eyebrowTracking: "0.4em",
  },
  "mashrabiya-sable": {
    heroLayout: "photo-first",
    heroShape: "square",
    divider: "lattice",
    dividerAlt: "lattice",
    corner: "lattice",
    headerFill: "light",
    ampersand: "◈",
    namesCase: "upper",
    gallery: "mosaic",
    program: "terracotta",
    eyebrowTracking: "0.46em",
  },
  "arabesque-bordeaux": {
    heroLayout: "names-first",
    heroShape: "scallop",
    divider: "arabesque",
    dividerAlt: "arabesque",
    corner: "vine",
    headerFill: "deep",
    ampersand: "❦",
    namesCase: "normal",
    gallery: "frames",
    program: "deco",
    eyebrowTracking: "0.35em",
  },
  "nacre-girih": {
    heroLayout: "photo-first",
    heroShape: "hexagon",
    divider: "girih",
    dividerAlt: "girih",
    corner: "girih",
    headerFill: "light",
    ampersand: "✜",
    namesCase: "upper",
    gallery: "grid",
    program: "gold",
    eyebrowTracking: "0.5em",
  },
  "calligraphie-nuit": {
    heroLayout: "overlay",
    heroShape: "oval",
    divider: "swash",
    dividerAlt: "swash",
    corner: "none",
    headerFill: "deep",
    ampersand: "&",
    namesCase: "normal",
    gallery: "masonry",
    program: "noir",
    eyebrowTracking: "0.6em",
  },
};

export function decorForTheme(theme: ThemeId): ThemeDecor | null {
  return DECOR[theme] ?? null;
}

export const ORNATE_THEMES = Object.keys(DECOR) as ThemeId[];
