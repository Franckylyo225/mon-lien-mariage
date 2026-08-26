import type { Couple, ThemeId, TemplateId } from "./wedding-store";

export type BackgroundSlug = "ivoire" | "creme" | "blanc" | "gris";

export type ThemeFamilyId =
  | "classiques"
  | "botaniques"
  | "heritage"
  | "modernes"
  | "illustres"
  | "africain"
  | "oriental";

export interface ThemeDef {
  slug: ThemeId;
  name: string;
  family: ThemeFamilyId;
  mood: string;
  fontHeading: string;
  fontBody: string;
  defaultAccent: string;
  defaultBg: BackgroundSlug;
  /** Exact background hex (overrides defaultBg when present). */
  defaultBgHex?: string;
  /** Main text colour when the couple has not overridden it. */
  defaultText?: string;
  /** Deep/contrast colour used for bands, overlays and ornaments. */
  deep?: string;
  /** Foreground colour on top of `deep`. */
  onDeep?: string;
  /** Secondary/muted text colour. */
  muted?: string;
  /** Short marketing description. */
  description?: string;
  /** Dress code suggestion shown in the theme picker. */
  dressLabel?: string;
  /** Decorative hero band (CSS background shorthand). */
  bandCss?: string;
}

// Google Font families available (loaded in src/routes/__root.tsx)
const FONT_PLAYFAIR = '"Playfair Display", serif';
const FONT_CORMORANT = '"Cormorant Garamond", serif';
const FONT_INTER = '"Inter", sans-serif';
const FONT_TYPEWRITER = '"Special Elite", "Courier New", monospace';
const FONT_MARCELLUS = '"Marcellus", serif';
const FONT_AMIRI = '"Amiri", serif';

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

  // ---------- Africains ----------
  "indigo-adinkra": {
    slug: "indigo-adinkra",
    name: "Indigo Adinkra",
    family: "africain",
    mood: "Ancestral · Solennel",
    description:
      "Fond ivoire chaud, accents or, motif adinkra en profond indigo.",
    dressLabel: "Indigo, or et blanc cassé",
    fontHeading: FONT_CORMORANT,
    fontBody: FONT_INTER,
    defaultAccent: "#c9a227",
    defaultBg: "ivoire",
    defaultBgHex: "#f4efe6",
    defaultText: "#241f1a",
    deep: "#1b2a4a",
    onDeep: "#f4efe6",
    muted: "rgba(36,31,26,0.62)",
  },
  "kente-souverain": {
    slug: "kente-souverain",
    name: "Kente Souverain",
    family: "africain",
    mood: "Festif · Majestueux",
    description: "Bande kente colorée, fond blanc naturel, accent or.",
    dressLabel: "Pagne, or et émeraude",
    fontHeading: FONT_MARCELLUS,
    fontBody: FONT_INTER,
    defaultAccent: "#d4a017",
    defaultBg: "creme",
    defaultBgHex: "#f7f3e8",
    defaultText: "#14100e",
    deep: "#0a3d25",
    onDeep: "#faf6ee",
    muted: "rgba(20,16,14,0.6)",
    bandCss:
      "repeating-linear-gradient(90deg, #d4a017 0 8px, #0f5132 8px 16px, #14100e 16px 20px)",
  },
  "bogolan-bordeaux": {
    slug: "bogolan-bordeaux",
    name: "Bogolan Bordeaux",
    family: "africain",
    mood: "Terreux · Chaleureux",
    description: "Fond lin crème, accent ocre doré, profondeur bordeaux.",
    dressLabel: "Terre cuite, ocre et crème",
    fontHeading: FONT_CORMORANT,
    fontBody: FONT_INTER,
    defaultAccent: "#d08c34",
    defaultBg: "ivoire",
    defaultBgHex: "#f7efe3",
    defaultText: "#3b2317",
    deep: "#551523",
    onDeep: "#f9f0e4",
    muted: "rgba(59,35,23,0.62)",
    bandCss: "repeating-linear-gradient(90deg, #6b1e2e 0 14px, #d08c34 14px 20px)",
  },
  "wax-ivoire": {
    slug: "wax-ivoire",
    name: "Wax Ivoire",
    family: "africain",
    mood: "Wax épuré · Élégant",
    description: "Fond ivoire, accent bronze, motif médaillon concentrique.",
    dressLabel: "Ivoire, camel et brun",
    fontHeading: FONT_CORMORANT,
    fontBody: FONT_INTER,
    defaultAccent: "#b08d57",
    defaultBg: "ivoire",
    defaultBgHex: "#f2ece1",
    defaultText: "#33291e",
    deep: "#3a2718",
    onDeep: "#f7f2ea",
    muted: "rgba(51,41,30,0.6)",
  },
  "nuit-ebene": {
    slug: "nuit-ebene",
    name: "Nuit d'Ébène",
    family: "africain",
    mood: "Luxe · Nocturne",
    description: "Fond ivoire, profondeur charbon intense, accent or lumineux.",
    dressLabel: "Noir, or et blanc cassé",
    fontHeading: FONT_MARCELLUS,
    fontBody: FONT_INTER,
    defaultAccent: "#c9a227",
    defaultBg: "ivoire",
    defaultBgHex: "#f3efe6",
    defaultText: "#1a1714",
    deep: "#14100e",
    onDeep: "#f3efe6",
    muted: "rgba(26,23,20,0.6)",
  },

  // ---------- Orientaux ----------
  "zellige-emeraude": {
    slug: "zellige-emeraude",
    name: "Zellige Émeraude",
    family: "oriental",
    mood: "Zellige · Andalou",
    description: "Fond ivoire doux, émeraude forêt, accent champagne doré.",
    dressLabel: "Vert émeraude, ivoire et or",
    fontHeading: FONT_AMIRI,
    fontBody: FONT_INTER,
    defaultAccent: "#d9b16b",
    defaultBg: "ivoire",
    defaultBgHex: "#f2ece0",
    defaultText: "#1d2a26",
    deep: "#0b4a3f",
    onDeep: "#f5f0e6",
    muted: "rgba(29,42,38,0.6)",
  },
  "mashrabiya-sable": {
    slug: "mashrabiya-sable",
    name: "Mashrabiya Sable",
    family: "oriental",
    mood: "Oriental · Épuré",
    description: "Fond sable chaud, accent terracotta doré, treillis ajouré.",
    dressLabel: "Sable, caramel et bronze",
    fontHeading: FONT_AMIRI,
    fontBody: FONT_INTER,
    defaultAccent: "#b98b6e",
    defaultBg: "ivoire",
    defaultBgHex: "#ece0cc",
    defaultText: "#4a3c2f",
    deep: "#34261b",
    onDeep: "#f7f0e4",
    muted: "rgba(74,60,47,0.6)",
  },
  "arabesque-bordeaux": {
    slug: "arabesque-bordeaux",
    name: "Arabesque Bordeaux",
    family: "oriental",
    mood: "Arabesque · Classique",
    description: "Fond lin, profondeur prune intense, accent or antique.",
    dressLabel: "Bordeaux, ivoire et or",
    fontHeading: FONT_AMIRI,
    fontBody: FONT_INTER,
    defaultAccent: "#b98a3e",
    defaultBg: "ivoire",
    defaultBgHex: "#f3e9dc",
    defaultText: "#33212a",
    deep: "#4a1220",
    onDeep: "#f3e9dc",
    muted: "rgba(51,33,42,0.6)",
  },
  "nacre-girih": {
    slug: "nacre-girih",
    name: "Nacre & Girih",
    family: "oriental",
    mood: "Géométrie · Élégance",
    description: "Fond écru, profondeur brun nuit, accent or doux.",
    dressLabel: "Nacre, or et brun profond",
    fontHeading: FONT_AMIRI,
    fontBody: FONT_INTER,
    defaultAccent: "#b3934f",
    defaultBg: "creme",
    defaultBgHex: "#f4f0e7",
    defaultText: "#2b2620",
    deep: "#2e281f",
    onDeep: "#f7f2e6",
    muted: "rgba(43,38,32,0.6)",
  },
  "calligraphie-nuit": {
    slug: "calligraphie-nuit",
    name: "Calligraphie Nuit",
    family: "oriental",
    mood: "Calligraphique · Pur",
    description: "Fond ivoire, profondeur noir absolu, accent champagne.",
    dressLabel: "Noir, champagne et ivoire",
    fontHeading: FONT_AMIRI,
    fontBody: FONT_INTER,
    defaultAccent: "#c9a05a",
    defaultBg: "creme",
    defaultBgHex: "#f7f4ee",
    defaultText: "#1a1a1a",
    deep: "#121212",
    onDeep: "#f7f4ee",
    muted: "rgba(26,26,26,0.6)",
  },
};

export const THEME_ORDER: ThemeId[] = [
  "rose-elegance", "ivoire-epure", "or-antique",
  "vert-sauge", "jardin-sauvage", "terracotta-boheme",
  "wax-dore", "kente-royal", "sahel-dore",
  "bleu-nuit", "manuscrit", "monochrome",
  "aquarelle", "confetti", "papier-kraft",
  "indigo-adinkra", "kente-souverain", "bogolan-bordeaux", "wax-ivoire", "nuit-ebene",
  "zellige-emeraude", "mashrabiya-sable", "arabesque-bordeaux", "nacre-girih", "calligraphie-nuit",
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
  {
    id: "africain",
    label: "🌍 Africain",
    themes: ["indigo-adinkra", "kente-souverain", "bogolan-bordeaux", "wax-ivoire", "nuit-ebene"],
  },
  {
    id: "oriental",
    label: "✦ Oriental",
    themes: [
      "zellige-emeraude",
      "mashrabiya-sable",
      "arabesque-bordeaux",
      "nacre-girih",
      "calligraphie-nuit",
    ],
  },
  { id: "modernes", label: "Modernes", themes: ["bleu-nuit", "manuscrit", "monochrome"] },
  { id: "illustres", label: "Illustrés", themes: ["aquarelle", "confetti", "papier-kraft"] },
];

// ---- Mapping theme → template component (Phase 2) ----
//
// Les 5 templates existants sont ré-affectés selon leur "registre visuel",
// pas leur nom historique. Chaque thème est classé dans un registre puis
// mappé sur le template qui l'incarne le mieux, en attendant que la Phase 3
// livre un design dédié par thème.
//
// Registres → template :
//   • "warm-classic"   → terracotta      (chaleureux, ivoire/brique, classique)
//   • "editorial-dark" → noir-minimal    (minimal, éditorial, typographique)
//   • "botanical"      → botanique-dore  (végétal, doré, feuillages)
//   • "painted"        → tropical        (illustré, peint, exubérant)
//                        ⚠ tropical est ici REPURPOSÉ : on n'utilise plus
//                        son imaginaire palmiers/exotique mais uniquement
//                        sa capacité à porter des thèmes illustrés et
//                        colorés (aquarelle, confetti). Aucune icône
//                        tropicale ne sera exposée à l'utilisateur.
//   • "ornamental"     → art-deco        (ornements géométriques, luxe)
//                        ⚠ art-deco est REPURPOSÉ comme socle "ornemental
//                        / géométrique / doré" pour porter les thèmes
//                        héritage (wax, kente) et les vintage luxueux
//                        (or antique). Les motifs déco génériques sont
//                        neutralisés par les tokens de thème (accent,
//                        typo, fond) jusqu'à leur design dédié en Phase 3.
export const THEME_TO_TEMPLATE: Record<ThemeId, TemplateId> = {
  // Classiques
  "rose-elegance": "terracotta",     // warm-classic
  "ivoire-epure": "noir-minimal",    // editorial-dark (minimal éditorial)
  "or-antique": "art-deco",          // ornamental (luxe vintage doré)

  // Botaniques
  "vert-sauge": "botanique-dore",    // botanical
  "jardin-sauvage": "botanique-dore",// botanical
  "terracotta-boheme": "terracotta", // warm-classic

  // Héritage africain
  "wax-dore": "art-deco",            // ornamental (motifs wax, or)
  "kente-royal": "art-deco",         // ornamental (royal, géométrique)
  "sahel-dore": "botanique-dore",    // botanical (afro-contemporain épuré)

  // Modernes éditoriaux
  "bleu-nuit": "noir-minimal",       // editorial-dark
  manuscrit: "noir-minimal",         // editorial-dark (magazine)
  monochrome: "noir-minimal",        // editorial-dark (brutaliste)

  // Illustrés
  aquarelle: "tropical",             // painted (peint, romantique)
  confetti: "tropical",              // painted (festif, illustré)
  "papier-kraft": "terracotta",      // warm-classic (vintage postal chaleureux)

  // Africains (Phase 4)
  "indigo-adinkra": "art-deco",      // ornamental
  "kente-souverain": "art-deco",     // ornamental
  "bogolan-bordeaux": "terracotta",  // warm-classic
  "wax-ivoire": "art-deco",          // ornamental
  "nuit-ebene": "noir-minimal",      // editorial-dark

  // Orientaux (Phase 4)
  "zellige-emeraude": "art-deco",
  "mashrabiya-sable": "terracotta",
  "arabesque-bordeaux": "art-deco",
  "nacre-girih": "art-deco",
  "calligraphie-nuit": "noir-minimal",
};

// Répartition résultante (15 thèmes / 5 templates) :
//   terracotta      : 3  (rose-elegance, terracotta-boheme, papier-kraft)
//   noir-minimal    : 4  (ivoire-epure, bleu-nuit, manuscrit, monochrome)
//   botanique-dore  : 3  (vert-sauge, jardin-sauvage, sahel-dore)
//   tropical        : 2  (aquarelle, confetti)
//   art-deco        : 3  (or-antique, wax-dore, kente-royal)

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
  deep: string;
  onDeep: string;
}

export function resolveTheme(
  couple: Pick<Couple, "theme" | "accentColor" | "backgroundBase" | "accent" | "textColor">,
): ResolvedTheme {
  const themeSlug: ThemeId = THEMES[couple.theme] ? couple.theme : "rose-elegance";
  const theme = THEMES[themeSlug];
  const rawBg = couple.backgroundBase;
  let bg: string;
  if (rawBg && /^#[0-9A-Fa-f]{6}$/.test(rawBg)) {
    bg = rawBg;
  } else if (isValidBgSlug(rawBg)) {
    bg = BG_HEX[rawBg];
  } else {
    bg = theme.defaultBgHex ?? BG_HEX[theme.defaultBg];
  }
  const accent =
    couple.accentColor && /^#[0-9A-Fa-f]{6}$/.test(couple.accentColor)
      ? couple.accentColor
      : couple.accent && /^#[0-9A-Fa-f]{6}$/.test(couple.accent)
        ? couple.accent
        : theme.defaultAccent;
  const customText =
    couple.textColor && /^#[0-9A-Fa-f]{6}$/.test(couple.textColor)
      ? couple.textColor
      : null;

  return {
    themeSlug,
    bg,
    accent,
    textPrimary: customText ?? theme.defaultText ?? "#1A1A1A",
    textSecondary: customText ?? theme.muted ?? "#6B6B6B",
    border: "rgba(0,0,0,0.08)",
    surface: "#FFFFFF",
    fontHeading: theme.fontHeading,
    fontBody: theme.fontBody,
    deep: theme.deep ?? customText ?? theme.defaultText ?? "#1A1A1A",
    onDeep: theme.onDeep ?? "#FFFFFF",
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
    "--wedding-deep": r.deep,
    "--wedding-on-deep": r.onDeep,
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
