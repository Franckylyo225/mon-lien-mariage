import type { CeremonyType, TemplateId } from "./wedding-store";

export const ceremonyMeta: Record<
  CeremonyType,
  { label: string; short: string; icon: string; color: string; blurb: string }
> = {
  dot: {
    label: "Dot traditionnelle",
    short: "Dot",
    icon: "◈",
    color: "#c17c74",
    blurb: "L'engagement des deux familles, kolas et pagnes à l'appui.",
  },
  civil: {
    label: "Mariage civil",
    short: "Civil",
    icon: "❍",
    color: "#8b6f5e",
    blurb: "La signature à la mairie, entre proches.",
  },
  religieux: {
    label: "Mariage religieux",
    short: "Religieux",
    icon: "✦",
    color: "#6b3a2a",
    blurb: "La bénédiction, à l'église, au temple ou à la mosquée.",
  },
  traditionnel: {
    label: "Étape traditionnelle",
    short: "Traditionnel",
    icon: "❋",
    color: "#a0522d",
    blurb: "Rites de la région, tenues locales, danse et libations.",
  },
  diner: {
    label: "Dîner / Réception",
    short: "Dîner",
    icon: "✿",
    color: "#d97757",
    blurb: "Le grand soir : dîner, discours, piste de danse.",
  },
  anniversaire: {
    label: "Anniversaire de mariage",
    short: "Anniversaire",
    icon: "⌘",
    color: "#c9a84c",
    blurb: "Célébrer une union qui dure, une année de plus.",
  },
  fiancailles: {
    label: "Fiançailles",
    short: "Fiançailles",
    icon: "♡",
    color: "#993556",
    blurb: "L'annonce officielle, entre proches.",
  },
  autre: {
    label: "Autre étape",
    short: "Autre",
    icon: "✧",
    color: "#4a6741",
    blurb: "Un moment sur-mesure à votre image.",
  },
};

export const templateMeta: Record<
  TemplateId,
  { label: string; tagline: string; swatch: string[]; mood: string }
> = {
  terracotta: {
    label: "Terracotta",
    tagline: "Chaleureux · ivoirien",
    swatch: ["#faf6f1", "#e8c5b6", "#d97757", "#4a2a20"],
    mood: "Douce lumière d'Abidjan, serif italique.",
  },
  "noir-minimal": {
    label: "Noir Minimal",
    tagline: "Éditorial · net",
    swatch: ["#f5f3ee", "#c9c5bc", "#2d2d2d", "#0d0d0d"],
    mood: "Noir ivoire, typo grotesque, ultra clean.",
  },
  "botanique-dore": {
    label: "Botanique Doré",
    tagline: "Classique · végétal",
    swatch: ["#f5f0e4", "#dcd5b8", "#c9a84c", "#3d4a2d"],
    mood: "Feuillages, filets dorés, papier crème.",
  },
  tropical: {
    label: "Tropical",
    tagline: "Lagunaire · vif",
    swatch: ["#0d3b2e", "#1a6b52", "#e88b62", "#f4e4c1"],
    mood: "Palmes, vert profond, corail Abidjan.",
  },
  "art-deco": {
    label: "Art Déco",
    tagline: "Prestige · doré",
    swatch: ["#1a0f1a", "#4a1c2e", "#c9a84c", "#f0d78c"],
    mood: "Géométrie or et bordeaux, années 20.",
  },
};

export const templateOrder: TemplateId[] = [
  "terracotta",
  "noir-minimal",
  "botanique-dore",
  "tropical",
  "art-deco",
];
