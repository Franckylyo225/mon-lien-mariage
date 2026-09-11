export type OpeningModel =
  | "classique"
  | "presse"
  | "olive"
  | "arche_floral"
  | "romantique"
  | "breaking_news";

export type OpeningEffect = "tap" | "swipe_up" | "swipe_down";

export const OPENING_EFFECTS: Array<{
  id: OpeningEffect;
  label: string;
  hint: string;
}> = [
  { id: "tap", label: "Toucher pour ouvrir", hint: "Tapez pour ouvrir" },
  { id: "swipe_up", label: "Glisser vers le haut", hint: "Glissez vers le haut" },
  { id: "swipe_down", label: "Glisser vers le bas", hint: "Glissez vers le bas" },
];

export const OPENING_EFFECT_LABEL: Record<OpeningEffect, string> = {
  tap: "Tapez pour ouvrir",
  swipe_up: "Glissez vers le haut",
  swipe_down: "Glissez vers le bas",
};

export interface OpeningModelMeta {
  id: OpeningModel;
  label: string;
  description: string;
  defaultEffect: OpeningEffect;
  supportsColor: boolean;
  defaultColor?: string;
  supportsPhoto: boolean;
}

/** Ordre d'affichage dans la galerie : le modèle historique en premier. */
export const OPENING_MODELS: OpeningModelMeta[] = [
  {
    id: "classique",
    label: "Classique",
    description: "Ornements floraux, prénoms et date. Le modèle historique.",
    defaultEffect: "tap",
    supportsColor: false,
    supportsPhoto: true,
  },
  {
    id: "presse",
    label: "Presse",
    description: "Fond blanc épuré, prénoms en majuscules, photo verticale.",
    defaultEffect: "tap",
    supportsColor: false,
    supportsPhoto: true,
  },
  {
    id: "olive",
    label: "Olive",
    description: "Fond uni coloré, titre script et photo encadrée.",
    defaultEffect: "tap",
    supportsColor: true,
    defaultColor: "#6B7A4F",
    supportsPhoto: true,
  },
  {
    id: "arche_floral",
    label: "Arche florale",
    description: "Photo plein écran et arche colorée avec médaillon.",
    defaultEffect: "swipe_up",
    supportsColor: true,
    defaultColor: "#B4654A",
    supportsPhoto: true,
  },
  {
    id: "romantique",
    label: "Romantique",
    description: "Fond crème, grand script et photo en arche.",
    defaultEffect: "tap",
    supportsColor: false,
    supportsPhoto: true,
  },
  {
    id: "breaking_news",
    label: "Breaking news",
    description: "Fond vif, écran TV et bandeau défilant.",
    defaultEffect: "tap",
    supportsColor: true,
    defaultColor: "#C81E30",
    supportsPhoto: true,
  },
];

export function openingModelMeta(id: OpeningModel | string | null | undefined): OpeningModelMeta {
  return OPENING_MODELS.find((m) => m.id === id) ?? OPENING_MODELS[0];
}

export interface OpeningPageConfig {
  color?: string | null;
  photoUrl?: string | null;
}

export interface OpeningModelProps {
  brideName: string;
  groomName: string;
  dateLabel: string;
  city?: string | null;
  photoUrl?: string | null;
  color: string;
  accent: string;
  fontHeading: string;
  fontBody: string;
  showDate: boolean;
  /** « Hello Awa » quand l'invité arrive via son lien personnel. */
  greeting?: string | null;
  effectLabel: string;
}

export function formatOpeningDate(date?: string | null): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
