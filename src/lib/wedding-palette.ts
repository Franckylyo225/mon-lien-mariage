/**
 * Colour palettes, kept deliberately separate from the 30 themes.
 *
 * A theme owns the layout, the typography and the ornaments. A palette owns
 * nothing but colour. Keeping them orthogonal means any layout can wear any
 * palette, and a couple who likes one page structure is no longer stuck with
 * the colours it shipped with.
 *
 * Every palette follows the same grammar, which is the grammar of wedding
 * stationery rather than a colour wheel: a near-desaturated, slightly warm
 * background; an accent dark enough to carry small text on it; a secondary
 * that is the accent pushed to near-black, used for bands and photo veils;
 * and a metal used only for rules, frames and filigree.
 */

export type PaletteId =
  | "ivoire-or"
  | "rose-poudre"
  | "bordeaux-creme"
  | "sauge-lin"
  | "terracotta-sable"
  | "bleu-nuit-laiton"
  | "indigo-wax"
  | "nuit-cuivre";

export interface PaletteDef {
  slug: PaletteId;
  name: string;
  /** Page canvas. Decides whether ink is dark or light. */
  bg: string;
  /** Buttons, small headings, links. Verified ≥ 4.5:1 on `bg`. */
  accent: string;
  /** Bands, photo veils, footer. Carries inverted text. */
  deep: string;
  /**
   * Metal for rules, frames and filigree. Metals top out around 2:1 on a light
   * background — a legible gold is no longer gold — so this never carries text.
   */
  ornament: string;
  /** One line shown under the swatches in the picker. */
  mood: string;
}

export const PALETTES: Record<PaletteId, PaletteDef> = {
  "ivoire-or": {
    slug: "ivoire-or",
    name: "Ivoire & Or",
    bg: "#FAF7F0",
    accent: "#8A6D2C",
    deep: "#2E2A24",
    ornament: "#C6A15B",
    mood: "Classique · Intemporel",
  },
  "rose-poudre": {
    slug: "rose-poudre",
    name: "Rose Poudré",
    bg: "#FDF6F4",
    accent: "#A8485E",
    deep: "#3B1F27",
    ornament: "#C9A227",
    mood: "Romantique · Doux",
  },
  "bordeaux-creme": {
    slug: "bordeaux-creme",
    name: "Bordeaux & Crème",
    bg: "#FAF4EF",
    accent: "#6F1F2F",
    deep: "#2A1016",
    ornament: "#C6A15B",
    mood: "Solennel · Chaleureux",
  },
  "sauge-lin": {
    slug: "sauge-lin",
    name: "Sauge & Lin",
    bg: "#F4F2EB",
    accent: "#5F7352",
    deep: "#2C362A",
    ornament: "#B99A5B",
    mood: "Botanique · Naturel",
  },
  "terracotta-sable": {
    slug: "terracotta-sable",
    name: "Terracotta & Sable",
    bg: "#FBF3EA",
    accent: "#A3512F",
    deep: "#43261B",
    ornament: "#C08A4A",
    mood: "Terreux · Lumineux",
  },
  "bleu-nuit-laiton": {
    slug: "bleu-nuit-laiton",
    name: "Bleu Nuit & Laiton",
    bg: "#F5F6F8",
    accent: "#2B4473",
    deep: "#141E33",
    ornament: "#B9A36B",
    mood: "Élégant · Soirée",
  },
  "indigo-wax": {
    slug: "indigo-wax",
    name: "Indigo & Wax",
    bg: "#F7F4EC",
    accent: "#27406E",
    deep: "#121F38",
    ornament: "#D4A02C",
    mood: "Traditionnel · Indigo",
  },
  "nuit-cuivre": {
    slug: "nuit-cuivre",
    name: "Nuit & Cuivre",
    bg: "#17141A",
    accent: "#D8936A",
    deep: "#F0E6DA",
    ornament: "#C87A4A",
    mood: "Nocturne · Réception",
  },
};

export const PALETTE_LIST: PaletteDef[] = Object.values(PALETTES);

export const DEFAULT_PALETTE: PaletteId = "ivoire-or";

export function isPaletteId(v: unknown): v is PaletteId {
  return typeof v === "string" && v in PALETTES;
}

const HEX6 = /^#[0-9A-Fa-f]{6}$/;

export function isHex(v: unknown): v is string {
  return typeof v === "string" && HEX6.test(v);
}

/* ------------------------------- contrast -------------------------------- */

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two hex colours, 1 → 21. */
export function contrastRatio(a: string, b: string): number {
  if (!isHex(a) || !isHex(b)) return 1;
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Warm near-black, used as ink on light backgrounds. */
export const INK_DARK = "#1A1A1A";
/** Warm ivory, used as ink on dark backgrounds. */
export const INK_LIGHT = "#F7F3EC";

/**
 * Ink is derived, never chosen: whichever of the two reads better on `bg`.
 * This is what stops a couple from producing an unreadable page.
 */
export function inkFor(bg: string): string {
  if (!isHex(bg)) return INK_DARK;
  return contrastRatio(bg, INK_DARK) >= contrastRatio(bg, INK_LIGHT) ? INK_DARK : INK_LIGHT;
}

/** Secondary ink: the primary softened toward the background, hierarchy kept. */
export function mutedInkFor(bg: string): string {
  return inkFor(bg) === INK_DARK ? "#6B6B6B" : "#C3BBB0";
}

/** AA floor for normal-size text. */
export const AA_TEXT = 4.5;

/**
 * Darkens (or, on a dark canvas, lightens) a colour until it clears `target`
 * against `bg`. Backs the one-tap fix offered next to the contrast warning.
 */
export function adjustForContrast(hex: string, bg: string, target = AA_TEXT): string {
  if (!isHex(hex) || !isHex(bg)) return hex;
  const towardDark = inkFor(bg) === INK_DARK;
  let h = hex.replace("#", "");
  let [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  for (let i = 0; i < 40 && contrastRatio(`#${h}`, bg) < target; i++) {
    const step = towardDark ? 0.92 : 1.08;
    r = Math.max(0, Math.min(255, Math.round(r * step)));
    g = Math.max(0, Math.min(255, Math.round(g * step)));
    b = Math.max(0, Math.min(255, Math.round(b * step)));
    if (!towardDark && r === 255 && g === 255 && b === 255) break;
    if (towardDark && r === 0 && g === 0 && b === 0) break;
    h = [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
  }
  return `#${h}`;
}
