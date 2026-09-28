export type OpeningModel =
  | "classique"
  | "presse"
  | "olive"
  | "arche_floral"
  | "romantique"
  | "editorial_date"
  | "prenoms_xxl"
  | "chiffres_geants"
  | "save_the_date"
  | "monogramme";

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

/**
 * Réglages qu'un modèle sait réellement afficher. L'éditeur s'en sert pour ne
 * proposer que les champs utiles : un champ absent de cette liste n'est pas
 * masqué au hasard, il n'existe simplement pas pour ce modèle.
 */
export type OpeningField =
  "photo" | "color" | "backgroundMode" | "kicker" | "tapLabel" | "quote" | "textTone";

export interface OpeningModelMeta {
  id: OpeningModel;
  label: string;
  description: string;
  defaultEffect: OpeningEffect;
  defaultColor?: string;
  fields: OpeningField[];
}

export function modelSupports(meta: OpeningModelMeta, field: OpeningField): boolean {
  return meta.fields.includes(field);
}

const FIELD_LABELS: Record<OpeningField, string> = {
  photo: "photo",
  color: "couleur",
  backgroundMode: "fond",
  kicker: "petite phrase",
  tapLabel: "texte du bouton",
  quote: "citation",
  textTone: "lisibilité du texte",
};

/** « photo, couleur, bandeau défilant » — pour annoncer ce que le modèle permet de régler. */
export function modelFieldsLabel(meta: OpeningModelMeta): string {
  return meta.fields.map((f) => FIELD_LABELS[f]).join(", ");
}

/** Ordre d'affichage dans la galerie : le modèle historique en premier. */
export const OPENING_MODELS: OpeningModelMeta[] = [
  {
    id: "classique",
    label: "Classique",
    description: "Ornements floraux, prénoms et date. Le modèle historique.",
    defaultEffect: "tap",
    fields: ["photo", "backgroundMode", "kicker", "tapLabel"],
  },
  {
    id: "presse",
    label: "Presse",
    description: "Fond blanc épuré, prénoms en majuscules, photo verticale.",
    defaultEffect: "tap",
    fields: ["photo"],
  },
  {
    id: "olive",
    label: "Olive",
    description: "Fond uni coloré, titre script et photo encadrée.",
    defaultEffect: "tap",
    defaultColor: "#6B7A4F",
    fields: ["photo", "color"],
  },
  {
    id: "arche_floral",
    label: "Arche florale",
    description: "Photo plein écran et arche colorée avec médaillon.",
    defaultEffect: "swipe_up",
    defaultColor: "#B4654A",
    fields: ["photo", "color"],
  },
  {
    id: "romantique",
    label: "Romantique",
    description: "Fond crème, grand script et photo en arche.",
    defaultEffect: "tap",
    fields: ["photo"],
  },
  {
    id: "editorial_date",
    label: "Date éditoriale",
    description: "Photo plein écran et date monumentale superposée.",
    defaultEffect: "tap",
    fields: ["photo", "quote", "textTone"],
  },
  {
    id: "prenoms_xxl",
    label: "Prénoms XXL",
    description: "Photo encadrée par vos deux prénoms en très grand.",
    defaultEffect: "swipe_up",
    defaultColor: "#EFE9DC",
    fields: ["photo", "color"],
  },
  {
    id: "chiffres_geants",
    label: "Chiffres géants",
    description: "Votre date en très grands chiffres, prénoms en script.",
    defaultEffect: "tap",
    defaultColor: "#FBFAF8",
    fields: ["color"],
  },
  {
    id: "save_the_date",
    label: "Save the date",
    description: "Grandes capitales serif et « the » calligraphié.",
    defaultEffect: "tap",
    defaultColor: "#7C7F63",
    fields: ["color"],
  },
  {
    id: "monogramme",
    label: "Monogramme",
    description: "Vos initiales, filets fins et date empilée.",
    defaultEffect: "tap",
    defaultColor: "#FCFCFB",
    fields: ["color"],
  },
];

export function openingModelMeta(id: OpeningModel | string | null | undefined): OpeningModelMeta {
  return OPENING_MODELS.find((m) => m.id === id) ?? OPENING_MODELS[0];
}

export interface OpeningPageConfig {
  color?: string | null;
  photoUrl?: string | null;
  quote?: string | null;
  textTone?: "auto" | "light" | "dark" | null;
}

export interface OpeningModelProps {
  brideName: string;
  groomName: string;
  dateLabel: string;
  numericDate: string;
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
  effect?: OpeningEffect;
  quote?: string | null;
  textTone?: "auto" | "light" | "dark" | null;
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
