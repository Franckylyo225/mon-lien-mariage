export interface WeddingFont {
  id: string;
  label: string;
  family: string;
  googleFont?: string;
}

export const TITLE_FONTS = [
  { id: "cormorant", label: "Cormorant Garamond", family: '"Cormorant Garamond", serif' },
  { id: "playfair", label: "Playfair Display", family: '"Playfair Display", serif' },
  { id: "marcellus", label: "Marcellus", family: '"Marcellus", serif' },
  { id: "eb-garamond", label: "EB Garamond", family: '"EB Garamond", serif', googleFont: "EB+Garamond:ital,wght@0,500;1,400" },
  { id: "cinzel", label: "Cinzel", family: '"Cinzel", serif', googleFont: "Cinzel:wght@500" },
  { id: "prata", label: "Prata", family: '"Prata", serif', googleFont: "Prata" },
  { id: "amiri", label: "Amiri", family: '"Amiri", serif' },
] as const satisfies readonly WeddingFont[];

export const BODY_FONTS = [
  { id: "nunito", label: "Nunito Sans", family: '"Nunito Sans", sans-serif' },
  { id: "quicksand", label: "Quicksand", family: '"Quicksand", sans-serif' },
  { id: "inter", label: "Inter", family: '"Inter", sans-serif' },
  { id: "work-sans", label: "Work Sans", family: '"Work Sans", sans-serif', googleFont: "Work+Sans:wght@400;600" },
  { id: "jost", label: "Jost", family: '"Jost", sans-serif', googleFont: "Jost:wght@400;600" },
  { id: "lato", label: "Lato", family: '"Lato", sans-serif', googleFont: "Lato:wght@400;700" },
] as const satisfies readonly WeddingFont[];

export type TitleFontId = (typeof TITLE_FONTS)[number]["id"];
export type BodyFontId = (typeof BODY_FONTS)[number]["id"];

export function findTitleFont(id?: string | null) {
  return TITLE_FONTS.find((font) => font.id === id);
}

export function findBodyFont(id?: string | null) {
  return BODY_FONTS.find((font) => font.id === id);
}