import type { Couple, ThemeId, TemplateId } from "./wedding-store";

export type BackgroundSlug = "ivoire" | "creme" | "blanc" | "gris";

export type ThemeFamilyId =
  | "classiques"
  | "botaniques"
  | "heritage"
  | "modernes"
  | "illustres";

export interface ThemeDef {
  slug: ThemeId;
  name: string;
  family: ThemeFamilyId;
  mood: string;
  fontHeading: string;
  fontBody: string;
  defaultAccent: string;
  defaultBg: BackgroundSlug;
}

// Google Font families available (loaded in src/routes/__root.tsx)
const FONT_PLAYFAIR = '"Playfair Display", serif';
const FONT_CORMORANT = '"Cormorant Garamond", serif';
const FONT_INTER = '"Inter", sans-serif';
const FONT_TYPEWRITER = '"Special Elite", "Courier New", monospace';

export const THEMES: Record<ThemeId, ThemeDef> = {
  // ---------- Classiques élégants ----------
  "rose-elegance": {
    slug: "rose-elegance",
    name: "Rose Élégance",
    family: "classiques",
    mood: "Classique · Formel",
    fontHeading: FONT_PLAYFAIR,
    fontBody: FONT_INTER,
    defaultAccent: "#993556",
    defaultBg: "ivoire",
  },
  "ivoire-epure": {
    slug: "ivoire-epure",
    name: "Ivoire Épuré",
    family: "classiques",
    mood: "Minimaliste · Éditorial",
    fontHeading: FONT_CORMORANT,
    fontBody: FONT_INTER,
    defaultAccent: "#1A1A1A",
    defaultBg: "creme",
  },
  "or-antique": {
    slug: "or-antique",
    name: "Or Antique",
    family: "classiques",
    mood: "Luxe · Vintage",
    fontHeading: FONT_CORMORANT,
    fontBody: FONT_INTER,
    defaultAccent: "#A08234",
    defaultBg: "ivoire",
  },

  // ---------- Botaniques ----------
  "vert-sauge": {
    slug: "vert-sauge",
    name: "Vert Sauge",
    family: "botaniques",
    mood: "Botanique · Méditerranéen",
    fontHeading: FONT_CORMORANT,
    fontBody: FONT_INTER,
    defaultAccent: "#7A8471",
    defaultBg: "creme",
  },
  "jardin-sauvage": {
    slug: "jardin-sauvage",
    name: "Jardin Sauvage",
    family: "botaniques",
    mood: "Bohème · Champêtre",
    fontHeading: FONT_PLAYFAIR,
    fontBody: FONT_INTER,
    defaultAccent: "#2D5F3F",
    defaultBg: "creme",
  },
  "terracotta-boheme": {
    slug: "terracotta-boheme",
    name: "Terracotta Bohème",
    family: "botaniques",
    mood: "Bohème · Terreux",
    fontHeading: FONT_CORMORANT,
    fontBody: FONT_INTER,
    defaultAccent: "#B45309",
    defaultBg: "ivoire",
  },

  // ---------- Héritage africain ----------
  "wax-dore": {
    slug: "wax-dore",
    name: "Wax Doré",
    family: "heritage",
    mood: "Culturel · Ivoirien",
    fontHeading: FONT_PLAYFAIR,
    fontBody: FONT_INTER,
    defaultAccent: "#B45309",
    defaultBg: "ivoire",
  },
  "kente-royal": {
    slug: "kente-royal",
    name: "Kente Royal",
    family: "heritage",
    mood: "Royal · Cérémoniel",
    fontHeading: FONT_PLAYFAIR,
    fontBody: FONT_INTER,
    defaultAccent: "#993556",
    defaultBg: "ivoire",
  },
  "sahel-dore": {
    slug: "sahel-dore",
    name: "Sahel Doré",
    family: "heritage",
    mood: "Afro-contemporain · Épuré",
    fontHeading: FONT_CORMORANT,
    fontBody: FONT_INTER,
    defaultAccent: "#A08234",
    defaultBg: "creme",
  },

  // ---------- Modernes éditoriaux ----------
  "bleu-nuit": {
    slug: "bleu-nuit",
    name: "Bleu Nuit",
    family: "modernes",
    mood: "Éditorial · Soirée",
    fontHeading: FONT_PLAYFAIR,
    fontBody: FONT_INTER,
    defaultAccent: "#1E3A5F",
    defaultBg: "blanc",
  },
  manuscrit: {
    slug: "manuscrit",
    name: "Manuscrit",
    family: "modernes",
    mood: "Magazine · Mode",
    fontHeading: FONT_CORMORANT,
    fontBody: FONT_INTER,
    defaultAccent: "#1A1A1A",
    defaultBg: "blanc",
  },
  monochrome: {
    slug: "monochrome",
    name: "Monochrome",
    family: "modernes",
    mood: "Brutaliste · Architectural",
    fontHeading: FONT_INTER,
    fontBody: FONT_INTER,
    defaultAccent: "#1A1A1A",
    defaultBg: "blanc",
  },

  // ---------- Illustrés ----------
  aquarelle: {
    slug: "aquarelle",
    name: "Aquarelle",
    family: "illustres",
    mood: "Peint · Romantique",
    fontHeading: FONT_CORMORANT,
    fontBody: FONT_INTER,
    defaultAccent: "#C97B93",
    defaultBg: "creme",
  },
  confetti: {
    slug: "confetti",
    name: "Confetti",
    family: "illustres",
    mood: "Festif · Décomplexé",
    fontHeading: FONT_PLAYFAIR,
    fontBody: FONT_INTER,
    defaultAccent: "#E67E5C",
    defaultBg: "blanc",
  },
  "papier-kraft": {
    slug: "papier-kraft",
    name: "Papier Kraft",
    family: "illustres",
    mood: "Vintage · Postal",
    fontHeading: FONT_PLAYFAIR,
    fontBody: FONT_TYPEWRITER,
    defaultAccent: "#993556",
    defaultBg: "creme",
  },
};

export const THEME_ORDER: ThemeId[] = [
  "rose-elegance", "ivoire-epure", "or-antique",
  "vert-sauge", "jardin-sauvage", "terracotta-boheme",
  "wax-dore", "kente-royal", "sahel-dore",
  "bleu-nuit", "manuscrit", "monochrome",
  "aquarelle", "confetti", "papier-kraft",
];

export interface ThemeFamilyDef {
  id: ThemeFamilyId;
  label: string;
  themes: ThemeId[];
}

export const THEME_FAMILIES: ThemeFamilyDef[] = [
  { id: "classiques", label: "Classiques", themes: ["rose-elegance", "ivoire-epure", "or-antique"] },
  { id: "botaniques", label: "Botaniques", themes: ["vert-sauge", "jardin-sauvage", "terracotta-boheme"] },
  { id: "heritage", label: "Héritage", themes: ["wax-dore", "kente-royal", "sahel-dore"] },
  { id: "modernes", label: "Modernes", themes: ["bleu-nuit", "manuscrit", "monochrome"] },
  { id: "illustres", label: "Illustrés", themes: ["aquarelle", "confetti", "papier-kraft"] },
];

// ---- Mapping theme → template component (Phase 1 skeleton) ----
// Every theme currently resolves to one of the 5 existing template
// components while its distinctive design is being built. Phase 3 replaces
// these mappings one theme at a time.
export const THEME_TO_TEMPLATE: Record<ThemeId, TemplateId> = {
  "rose-elegance": "terracotta",
  "ivoire-epure": "noir-minimal",
  "or-antique": "art-deco",
  "vert-sauge": "botanique-dore",
  "jardin-sauvage": "botanique-dore",
  "terracotta-boheme": "terracotta",
  "wax-dore": "terracotta",
  "kente-royal": "art-deco",
  "sahel-dore": "botanique-dore",
  "bleu-nuit": "noir-minimal",
  manuscrit: "noir-minimal",
  monochrome: "noir-minimal",
  aquarelle: "tropical",
  confetti: "tropical",
  "papier-kraft": "art-deco",
};

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

export function resolveTheme(
  couple: Pick<Couple, "theme" | "accentColor" | "backgroundBase" | "accent">,
): ResolvedTheme {
  const themeSlug: ThemeId = THEMES[couple.theme] ? couple.theme : "rose-elegance";
  const theme = THEMES[themeSlug];
  const bgSlug: BackgroundSlug = isValidBgSlug(couple.backgroundBase)
    ? couple.backgroundBase
    : theme.defaultBg;
  const accent =
    couple.accentColor && /^#[0-9A-Fa-f]{6}$/.test(couple.accentColor)
      ? couple.accentColor
      : couple.accent && /^#[0-9A-Fa-f]{6}$/.test(couple.accent)
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

export function templateForTheme(theme: ThemeId): TemplateId {
  return THEME_TO_TEMPLATE[theme] ?? "terracotta";
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
