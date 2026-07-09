import type { Couple, ThemeId } from "./wedding-store";

export type BackgroundSlug = "ivoire" | "creme" | "blanc" | "gris";

export interface ThemeDef {
  slug: ThemeId;
  name: string;
  fontHeading: string;
  fontBody: string;
  defaultAccent: string;
  defaultBg: BackgroundSlug;
  pattern?: "wax" | "botanique" | "or";
}

export const THEMES: Record<ThemeId, ThemeDef> = {
  "rose-elegance": {
    slug: "rose-elegance",
    name: "Rose Élégance",
    fontHeading: '"Playfair Display", serif',
    fontBody: '"Inter", sans-serif',
    defaultAccent: "#993556",
    defaultBg: "ivoire",
  },
  "ivoire-epure": {
    slug: "ivoire-epure",
    name: "Ivoire Épuré",
    fontHeading: '"Cormorant Garamond", serif',
    fontBody: '"Inter", sans-serif',
    defaultAccent: "#1A1A1A",
    defaultBg: "creme",
  },
  "wax-dore": {
    slug: "wax-dore",
    name: "Wax Doré",
    fontHeading: '"Playfair Display", serif',
    fontBody: '"Inter", sans-serif',
    defaultAccent: "#B45309",
    defaultBg: "ivoire",
    pattern: "wax",
  },
  "vert-sauge": {
    slug: "vert-sauge",
    name: "Vert Sauge",
    fontHeading: '"Cormorant Garamond", serif',
    fontBody: '"Inter", sans-serif',
    defaultAccent: "#7A8471",
    defaultBg: "creme",
    pattern: "botanique",
  },
  "bleu-nuit": {
    slug: "bleu-nuit",
    name: "Bleu Nuit",
    fontHeading: '"Playfair Display", serif',
    fontBody: '"Inter", sans-serif',
    defaultAccent: "#1E3A5F",
    defaultBg: "blanc",
  },
  "or-antique": {
    slug: "or-antique",
    name: "Or Antique",
    fontHeading: '"Cormorant Garamond", serif',
    fontBody: '"Inter", sans-serif',
    defaultAccent: "#A08234",
    defaultBg: "ivoire",
    pattern: "or",
  },
};

export const THEME_ORDER: ThemeId[] = [
  "rose-elegance",
  "ivoire-epure",
  "wax-dore",
  "vert-sauge",
  "bleu-nuit",
  "or-antique",
];

export interface AccentDef {
  name: string;
  hex: string;
}

export const ACCENTS: AccentDef[] = [
  { name: "Bordeaux", hex: "#993556" },
  { name: "Rose poudré", hex: "#C97B93" },
  { name: "Corail", hex: "#E67E5C" },
  { name: "Terracotta", hex: "#B45309" },
  { name: "Or antique", hex: "#A08234" },
  { name: "Vert sauge", hex: "#7A8471" },
  { name: "Vert forêt", hex: "#2D5F3F" },
  { name: "Bleu nuit", hex: "#1E3A5F" },
  { name: "Bleu poudré", hex: "#7DA0BF" },
  { name: "Lavande", hex: "#8B7DAC" },
  { name: "Noir profond", hex: "#1A1A1A" },
  { name: "Prune", hex: "#5C2B4A" },
];

export const ACCENT_HEX_SET = new Set(ACCENTS.map((a) => a.hex.toLowerCase()));

export interface BackgroundDef {
  slug: BackgroundSlug;
  name: string;
  hex: string;
}

export const BACKGROUNDS: BackgroundDef[] = [
  { slug: "ivoire", name: "Ivoire", hex: "#F5EFE7" },
  { slug: "creme", name: "Crème", hex: "#FAF8F3" },
  { slug: "blanc", name: "Blanc", hex: "#FFFFFF" },
  { slug: "gris", name: "Gris doux", hex: "#F3F4F6" },
];

export const BG_SLUGS = new Set<BackgroundSlug>(["ivoire", "creme", "blanc", "gris"]);

const BG_HEX: Record<BackgroundSlug, string> = {
  ivoire: "#F5EFE7",
  creme: "#FAF8F3",
  blanc: "#FFFFFF",
  gris: "#F3F4F6",
};

export interface ResolvedTheme {
  themeSlug: ThemeId;
  bg: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  surface: string;
  fontHeading: string;
  fontBody: string;
}

export function resolveTheme(couple: Pick<Couple, "theme" | "accentColor" | "backgroundBase" | "accent">): ResolvedTheme {
  const themeSlug: ThemeId = THEMES[couple.theme] ? couple.theme : "rose-elegance";
  const theme = THEMES[themeSlug];
  const bgSlug: BackgroundSlug = (couple.backgroundBase && BG_SLUGS.has(couple.backgroundBase))
    ? couple.backgroundBase
    : theme.defaultBg;
  const accent = (couple.accentColor && /^#[0-9A-Fa-f]{6}$/.test(couple.accentColor))
    ? couple.accentColor
    : (couple.accent && /^#[0-9A-Fa-f]{6}$/.test(couple.accent))
      ? couple.accent
      : theme.defaultAccent;

  return {
    themeSlug,
    bg: BG_HEX[bgSlug],
    accent,
    textPrimary: "#1A1A1A",
    textSecondary: "#6B6B6B",
    border: "rgba(0,0,0,0.08)",
    surface: "#FFFFFF",
    fontHeading: theme.fontHeading,
    fontBody: theme.fontBody,
  };
}

export function themeCssVars(r: ResolvedTheme): Record<string, string> {
  return {
    "--wedding-bg": r.bg,
    "--wedding-accent": r.accent,
    "--wedding-text-primary": r.textPrimary,
    "--wedding-text-secondary": r.textSecondary,
    "--wedding-border": r.border,
    "--wedding-surface": r.surface,
    "--wedding-font-heading": r.fontHeading,
    "--wedding-font-body": r.fontBody,
  };
}

export function applyThemeVars(root: HTMLElement, r: ResolvedTheme) {
  const vars = themeCssVars(r);
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
}

export function themeCssString(r: ResolvedTheme): string {
  const vars = themeCssVars(r);
  return Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(";");
}

export function isValidAccentHex(hex: string | null | undefined): boolean {
  if (!hex) return false;
  return ACCENT_HEX_SET.has(hex.toLowerCase());
}

export function isValidBgSlug(s: string | null | undefined): s is BackgroundSlug {
  return !!s && BG_SLUGS.has(s as BackgroundSlug);
}
