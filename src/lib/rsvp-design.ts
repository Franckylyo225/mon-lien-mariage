import type { ThemeId } from "./wedding-store";

/**
 * Design tokens for the public RSVP form, keyed by theme.
 * Every theme gets a bespoke palette + typography + ornament so the RSVP
 * section reads as a natural extension of the invitation, not a generic card.
 * Callers use `resolveRsvpDesign(theme)`; unknown themes fall back to a
 * neutral warm design.
 */

const FONT_PLAYFAIR = '"Playfair Display", serif';
const FONT_CORMORANT = '"Cormorant Garamond", serif';
const FONT_INTER = '"Inter", sans-serif';
const FONT_TYPEWRITER = '"Special Elite", "Courier New", monospace';
const FONT_CAVEAT = '"Caveat", cursive';
const FONT_FRAUNCES = '"Fraunces", serif';

export type OrnamentKind =
  | "flourish"
  | "dots"
  | "stripes"
  | "wax"
  | "kente"
  | "arch"
  | "confetti"
  | "watercolor"
  | "stamp"
  | "brutal"
  | "diamond"
  | "leaf";

export interface RsvpDesign {
  // Palette
  bg: string;
  surface: string;
  ink: string;
  mutedInk: string;
  accent: string;
  accentInk: string;
  border: string;
  inputBg: string;
  inputBorder: string;
  inputInk: string;
  placeholderInk: string;
  // Typography
  headingFont: string;
  bodyFont: string;
  eyebrowFont: string;
  headingItalic: boolean;
  // Shape
  wrapperRadius: string; // tailwind class (rounded-*)
  modalRadius: string;
  fieldRadius: string; // for inputs/buttons
  chipRadius: string;
  border1: string; // tailwind border width class
  // Ornament
  ornament: OrnamentKind;
  eyebrow: string;
}

/**
 * Utility – wrap a hex color with alpha.
 * Accepts #rrggbb or #rrggbbaa, returns #rrggbbaa (0-255).
 */
function alpha(hex: string, a: number): string {
  const clean = hex.replace("#", "").slice(0, 6);
  const aa = Math.max(0, Math.min(255, Math.round(a * 255)))
    .toString(16)
    .padStart(2, "0");
  return `#${clean}${aa}`;
}

const DESIGNS: Record<ThemeId, RsvpDesign> = {
  // ---------- Classiques ----------
  "rose-elegance": {
    bg: "#f7e6ec",
    surface: "#fdf5f7",
    ink: "#4a1e2b",
    mutedInk: "#7a4a58",
    accent: "#993556",
    accentInk: "#ffffff",
    border: alpha("#993556", 0.2),
    inputBg: "#ffffff",
    inputBorder: alpha("#993556", 0.25),
    inputInk: "#4a1e2b",
    placeholderInk: alpha("#4a1e2b", 0.4),
    headingFont: FONT_PLAYFAIR,
    bodyFont: FONT_INTER,
    eyebrowFont: FONT_INTER,
    headingItalic: true,
    wrapperRadius: "rounded-3xl",
    modalRadius: "rounded-3xl",
    fieldRadius: "rounded-full",
    chipRadius: "rounded-full",
    border1: "border",
    ornament: "flourish",
    eyebrow: "R S V P",
  },
  "ivoire-epure": {
    bg: "#f4f0e8",
    surface: "#fbf8f2",
    ink: "#1a1a1a",
    mutedInk: "#5a5750",
    accent: "#1a1a1a",
    accentInk: "#f4f0e8",
    border: alpha("#1a1a1a", 0.18),
    inputBg: "#ffffff",
    inputBorder: alpha("#1a1a1a", 0.2),
    inputInk: "#1a1a1a",
    placeholderInk: alpha("#1a1a1a", 0.4),
    headingFont: FONT_CORMORANT,
    bodyFont: FONT_INTER,
    eyebrowFont: FONT_INTER,
    headingItalic: true,
    wrapperRadius: "rounded-none",
    modalRadius: "rounded-none sm:rounded-none",
    fieldRadius: "rounded-none",
    chipRadius: "rounded-none",
    border1: "border",
    ornament: "brutal",
    eyebrow: "RSVP · Confirmation",
  },
  "or-antique": {
    bg: "#f5ecd8",
    surface: "#faf3e0",
    ink: "#3a2b12",
    mutedInk: "#6b5530",
    accent: "#a08234",
    accentInk: "#fbf5e5",
    border: alpha("#a08234", 0.35),
    inputBg: "#fffcf2",
    inputBorder: alpha("#a08234", 0.4),
    inputInk: "#3a2b12",
    placeholderInk: alpha("#3a2b12", 0.4),
    headingFont: FONT_CORMORANT,
    bodyFont: FONT_INTER,
    eyebrowFont: FONT_INTER,
    headingItalic: true,
    wrapperRadius: "rounded-3xl",
    modalRadius: "rounded-3xl",
    fieldRadius: "rounded-full",
    chipRadius: "rounded-full",
    border1: "border",
    ornament: "diamond",
    eyebrow: "◆ R S V P ◆",
  },

  // ---------- Botaniques ----------
  "vert-sauge": {
    bg: "#e8ede0",
    surface: "#f4f6ec",
    ink: "#2c3a26",
    mutedInk: "#5a6b52",
    accent: "#7a8471",
    accentInk: "#fbfaf3",
    border: alpha("#7a8471", 0.3),
    inputBg: "#ffffff",
    inputBorder: alpha("#7a8471", 0.35),
    inputInk: "#2c3a26",
    placeholderInk: alpha("#2c3a26", 0.4),
    headingFont: FONT_CORMORANT,
    bodyFont: FONT_INTER,
    eyebrowFont: FONT_INTER,
    headingItalic: true,
    wrapperRadius: "rounded-3xl",
    modalRadius: "rounded-3xl",
    fieldRadius: "rounded-full",
    chipRadius: "rounded-full",
    border1: "border",
    ornament: "leaf",
    eyebrow: "R S V P",
  },
  "jardin-sauvage": {
    bg: "#eef1e5",
    surface: "#f8f9ee",
    ink: "#1b3a24",
    mutedInk: "#4a5c44",
    accent: "#2d5f3f",
    accentInk: "#f6f2df",
    border: alpha("#2d5f3f", 0.3),
    inputBg: "#ffffff",
    inputBorder: alpha("#2d5f3f", 0.3),
    inputInk: "#1b3a24",
    placeholderInk: alpha("#1b3a24", 0.4),
    headingFont: FONT_PLAYFAIR,
    bodyFont: FONT_INTER,
    eyebrowFont: FONT_INTER,
    headingItalic: true,
    wrapperRadius: "rounded-3xl",
    modalRadius: "rounded-3xl",
    fieldRadius: "rounded-full",
    chipRadius: "rounded-full",
    border1: "border",
    ornament: "leaf",
    eyebrow: "R S V P",
  },
  "terracotta-boheme": {
    bg: "#f5dfc8",
    surface: "#fbecd8",
    ink: "#5c2812",
    mutedInk: "#8a4a2a",
    accent: "#b45309",
    accentInk: "#fbecd8",
    border: alpha("#b45309", 0.3),
    inputBg: "#ffffff",
    inputBorder: alpha("#b45309", 0.3),
    inputInk: "#5c2812",
    placeholderInk: alpha("#5c2812", 0.4),
    headingFont: FONT_CORMORANT,
    bodyFont: FONT_INTER,
    eyebrowFont: FONT_INTER,
    headingItalic: true,
    wrapperRadius: "rounded-3xl",
    modalRadius: "rounded-3xl",
    fieldRadius: "rounded-full",
    chipRadius: "rounded-full",
    border1: "border",
    ornament: "flourish",
    eyebrow: "R S V P",
  },

  // ---------- Héritage ----------
  "wax-dore": {
    bg: "#3a1f14",
    surface: "#4a2818",
    ink: "#f2d8a8",
    mutedInk: alpha("#f2d8a8", 0.7),
    accent: "#d9a441",
    accentInk: "#3a1f14",
    border: alpha("#d9a441", 0.4),
    inputBg: alpha("#000000", 0.25),
    inputBorder: alpha("#d9a441", 0.4),
    inputInk: "#f2d8a8",
    placeholderInk: alpha("#f2d8a8", 0.4),
    headingFont: FONT_PLAYFAIR,
    bodyFont: FONT_INTER,
    eyebrowFont: FONT_INTER,
    headingItalic: true,
    wrapperRadius: "rounded-3xl",
    modalRadius: "rounded-3xl",
    fieldRadius: "rounded-full",
    chipRadius: "rounded-full",
    border1: "border",
    ornament: "wax",
    eyebrow: "R S V P",
  },
  "kente-royal": {
    bg: "#2b0d14",
    surface: "#3a141d",
    ink: "#f3d788",
    mutedInk: alpha("#f3d788", 0.7),
    accent: "#d9a441",
    accentInk: "#2b0d14",
    border: alpha("#d9a441", 0.45),
    inputBg: alpha("#000000", 0.3),
    inputBorder: alpha("#d9a441", 0.45),
    inputInk: "#f3d788",
    placeholderInk: alpha("#f3d788", 0.4),
    headingFont: FONT_PLAYFAIR,
    bodyFont: FONT_INTER,
    eyebrowFont: FONT_INTER,
    headingItalic: true,
    wrapperRadius: "rounded-3xl",
    modalRadius: "rounded-3xl",
    fieldRadius: "rounded-full",
    chipRadius: "rounded-full",
    border1: "border-2",
    ornament: "kente",
    eyebrow: "R S V P",
  },
  "sahel-dore": {
    bg: "#f0e4cc",
    surface: "#f8eed4",
    ink: "#3a2a12",
    mutedInk: "#6b5530",
    accent: "#a08234",
    accentInk: "#f8eed4",
    border: alpha("#a08234", 0.35),
    inputBg: "#fffcf2",
    inputBorder: alpha("#a08234", 0.35),
    inputInk: "#3a2a12",
    placeholderInk: alpha("#3a2a12", 0.4),
    headingFont: FONT_CORMORANT,
    bodyFont: FONT_INTER,
    eyebrowFont: FONT_INTER,
    headingItalic: true,
    wrapperRadius: "rounded-t-[3rem] rounded-b-3xl",
    modalRadius: "rounded-3xl",
    fieldRadius: "rounded-full",
    chipRadius: "rounded-full",
    border1: "border",
    ornament: "arch",
    eyebrow: "R S V P",
  },

  // ---------- Modernes ----------
  "bleu-nuit": {
    bg: "#0f1b2d",
    surface: "#152437",
    ink: "#eae3d0",
    mutedInk: alpha("#eae3d0", 0.7),
    accent: "#c9b57b",
    accentInk: "#0f1b2d",
    border: alpha("#c9b57b", 0.35),
    inputBg: alpha("#000000", 0.25),
    inputBorder: alpha("#c9b57b", 0.35),
    inputInk: "#eae3d0",
    placeholderInk: alpha("#eae3d0", 0.4),
    headingFont: FONT_PLAYFAIR,
    bodyFont: FONT_INTER,
    eyebrowFont: FONT_INTER,
    headingItalic: true,
    wrapperRadius: "rounded-3xl",
    modalRadius: "rounded-3xl",
    fieldRadius: "rounded-full",
    chipRadius: "rounded-full",
    border1: "border",
    ornament: "diamond",
    eyebrow: "◆ R S V P ◆",
  },
  manuscrit: {
    bg: "#ffffff",
    surface: "#ffffff",
    ink: "#111111",
    mutedInk: "#5a5750",
    accent: "#111111",
    accentInk: "#ffffff",
    border: "#111111",
    inputBg: "#ffffff",
    inputBorder: "#111111",
    inputInk: "#111111",
    placeholderInk: alpha("#111111", 0.4),
    headingFont: FONT_CORMORANT,
    bodyFont: FONT_INTER,
    eyebrowFont: FONT_INTER,
    headingItalic: true,
    wrapperRadius: "rounded-none",
    modalRadius: "rounded-none",
    fieldRadius: "rounded-none",
    chipRadius: "rounded-none",
    border1: "border",
    ornament: "stripes",
    eyebrow: "N° 04 — RSVP",
  },
  monochrome: {
    bg: "#000000",
    surface: "#000000",
    ink: "#ffffff",
    mutedInk: alpha("#ffffff", 0.65),
    accent: "#ffffff",
    accentInk: "#000000",
    border: alpha("#ffffff", 0.3),
    inputBg: "#0a0a0a",
    inputBorder: alpha("#ffffff", 0.3),
    inputInk: "#ffffff",
    placeholderInk: alpha("#ffffff", 0.4),
    headingFont: FONT_INTER,
    bodyFont: FONT_INTER,
    eyebrowFont: FONT_INTER,
    headingItalic: false,
    wrapperRadius: "rounded-none",
    modalRadius: "rounded-none",
    fieldRadius: "rounded-none",
    chipRadius: "rounded-none",
    border1: "border",
    ornament: "brutal",
    eyebrow: "RSVP / 001",
  },

  // ---------- Illustrés ----------
  aquarelle: {
    bg: "#fdf1ea",
    surface: "#fef7f1",
    ink: "#4b3a44",
    mutedInk: "#7c6470",
    accent: "#c48b9f",
    accentInk: "#ffffff",
    border: alpha("#c48b9f", 0.35),
    inputBg: "#ffffff",
    inputBorder: alpha("#c48b9f", 0.3),
    inputInk: "#4b3a44",
    placeholderInk: alpha("#4b3a44", 0.4),
    headingFont: FONT_CAVEAT,
    bodyFont: FONT_INTER,
    eyebrowFont: FONT_INTER,
    headingItalic: false,
    wrapperRadius: "rounded-[2.5rem]",
    modalRadius: "rounded-[2rem]",
    fieldRadius: "rounded-full",
    chipRadius: "rounded-full",
    border1: "border",
    ornament: "watercolor",
    eyebrow: "R S V P",
  },
  confetti: {
    bg: "#fffcf5",
    surface: "#fffdf6",
    ink: "#2f2a2e",
    mutedInk: "#655e63",
    accent: "#ef6f6c",
    accentInk: "#ffffff",
    border: alpha("#ef6f6c", 0.35),
    inputBg: "#ffffff",
    inputBorder: alpha("#ef6f6c", 0.35),
    inputInk: "#2f2a2e",
    placeholderInk: alpha("#2f2a2e", 0.4),
    headingFont: FONT_FRAUNCES,
    bodyFont: FONT_INTER,
    eyebrowFont: FONT_INTER,
    headingItalic: true,
    wrapperRadius: "rounded-[2rem]",
    modalRadius: "rounded-[2rem]",
    fieldRadius: "rounded-full",
    chipRadius: "rounded-full",
    border1: "border-2 border-dashed",
    ornament: "confetti",
    eyebrow: "🎉 R S V P 🎉",
  },
  "papier-kraft": {
    bg: "#d6b48a",
    surface: "#f4e4c8",
    ink: "#3b2617",
    mutedInk: "#7a5a3a",
    accent: "#8b3a1f",
    accentInk: "#f4e4c8",
    border: alpha("#8b3a1f", 0.4),
    inputBg: "#faf0da",
    inputBorder: alpha("#8b3a1f", 0.4),
    inputInk: "#3b2617",
    placeholderInk: alpha("#3b2617", 0.5),
    headingFont: FONT_CORMORANT,
    bodyFont: FONT_TYPEWRITER,
    eyebrowFont: FONT_TYPEWRITER,
    headingItalic: true,
    wrapperRadius: "rounded-md",
    modalRadius: "rounded-md",
    fieldRadius: "rounded-sm",
    chipRadius: "rounded-sm",
    border1: "border",
    ornament: "stamp",
    eyebrow: "PAR AVION · RSVP",
  },
};

export function resolveRsvpDesign(theme: ThemeId | undefined | null): RsvpDesign {
  if (theme && DESIGNS[theme]) return DESIGNS[theme];
  return DESIGNS["rose-elegance"];
}
