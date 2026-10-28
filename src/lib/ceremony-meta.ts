import type { CeremonyType, EventType, TemplateId } from "./wedding-store";
import mariageHero from "@/assets/abidjan-couple.jpg.asset.json";

const EVENT_TYPE_META: Record<
  EventType,
  { label: string; programTitle: string; themeTitle: string; identityTitle: string }
> = {
  mariage: {
    label: "Mariage",
    programTitle: "Programme du mariage",
    themeTitle: "Thème du mariage",
    identityTitle: "Vos prénoms",
  },
  dot: {
    label: "Mariage traditionnel",
    programTitle: "Programme du mariage traditionnel",
    themeTitle: "Thème du mariage traditionnel",
    identityTitle: "Vos prénoms",
  },
  traditionnel: {
    label: "Cérémonie traditionnelle",
    programTitle: "Programme de la cérémonie",
    themeTitle: "Thème de la cérémonie",
    identityTitle: "Vos prénoms",
  },
  coutumier: {
    label: "Mariage coutumier",
    programTitle: "Programme du mariage coutumier",
    themeTitle: "Thème du mariage coutumier",
    identityTitle: "Vos prénoms",
  },
  anniversaire: {
    label: "Anniversaire",
    programTitle: "Programme de l'anniversaire",
    themeTitle: "Thème de l'anniversaire",
    identityTitle: "Les prénoms à l'honneur",
  },
  autre: {
    label: "Autre événement",
    programTitle: "Programme de l'événement",
    themeTitle: "Thème de l'événement",
    identityTitle: "Les prénoms à l'honneur",
  },
};

export const eventTypeMeta = new Proxy(EVENT_TYPE_META, {
  get(target, prop: string | symbol) {
    if (typeof prop !== "string") return Reflect.get(target, prop);
    return target[prop as EventType] ?? target.mariage;
  },
}) as typeof EVENT_TYPE_META;

export function normalizeEventType(value: string | null | undefined): EventType {
  return value && value in EVENT_TYPE_META ? (value as EventType) : "mariage";
}

export const eventTypeOrder: EventType[] = [
  "mariage",
  "coutumier",
  "anniversaire",
  "dot",
  "traditionnel",
  "autre",
];

/**
 * Prénoms d'exemple affichés dans un aperçu tant que l'utilisateur n'a pas
 * saisi les siens.
 *
 * Les événements de couple en portent deux ; une célébration individuelle n'en
 * porte qu'un et laisse `groomName` vide. Centralisé ici, à côté de
 * `eventTypeMeta`, pour qu'un aperçu n'invente jamais ses propres prénoms.
 */
const EVENT_TYPE_PLACEHOLDER_NAMES: Record<EventType, { brideName: string; groomName: string }> = {
  mariage: { brideName: "Aïcha", groomName: "Loïc" },
  dot: { brideName: "Aïcha", groomName: "Loïc" },
  traditionnel: { brideName: "Aïcha", groomName: "Loïc" },
  coutumier: { brideName: "Aïcha", groomName: "Loïc" },
  anniversaire: { brideName: "Aïcha", groomName: "" },
  autre: { brideName: "Aya", groomName: "" },
};

/* ------------------------------------------------------------------ */
/* Choix d'événement de l'onboarding (première étape)                  */
/* ------------------------------------------------------------------ */

/**
 * Les identifiants proposés à la première étape. Volontairement plus large que
 * `EventType` : un choix peut être affiché en teasing avant que le reste du
 * système (modèle de données, thèmes, vocabulaire) ne sache le traiter.
 */
export type EventChoiceId = EventType | "bapteme" | "entreprise";

export interface EventChoice {
  id: EventChoiceId;
  label: string;
  sublabel: string;
  /** Nom d'icône lucide-react, résolu par la vue — ce module reste sans React. */
  icon: string;
  /** Dégradé décor, du haut-gauche vers le bas-droit. */
  gradient: [string, string];
  /** Couleur d'anneau quand le choix est sélectionné. */
  accent: string;
  /** Photo de fond : rendu en carte hero plutôt qu'en tuile décor. */
  image?: string;
  /** Affiché mais pas encore sélectionnable. */
  comingSoon?: boolean;
}

/**
 * Pour activer un choix « bientôt » : ajouter son id à `EventType` dans
 * wedding-store, puis retirer `comingSoon` ici. Le composant n'a pas à bouger.
 */
export const EVENT_CHOICES: EventChoice[] = [
  {
    id: "mariage",
    label: "Mariage",
    sublabel: "Civil, religieux, traditionnel — toutes vos cérémonies réunies.",
    icon: "rings",
    gradient: ["#8E2A47", "#4A1526"],
    accent: "#E82050",
    image: mariageHero.url,
  },
  {
    id: "coutumier",
    label: "Mariage coutumier",
    sublabel: "Rites & traditions",
    icon: "gem",
    gradient: ["#B45309", "#7E3908"],
    accent: "#B45309",
  },
  {
    id: "anniversaire",
    label: "Anniversaire",
    sublabel: "De mariage",
    icon: "cake",
    gradient: ["#D98BA8", "#A8486B"],
    accent: "#A8486B",
    comingSoon: true,
  },
  {
    id: "bapteme",
    label: "Baptême",
    sublabel: "Première célébration",
    icon: "droplet",
    gradient: ["#8FA7C4", "#5E7BA0"],
    accent: "#5E7BA0",
    comingSoon: true,
  },
  {
    id: "entreprise",
    label: "Entreprise",
    sublabel: "Événement professionnel",
    icon: "building",
    gradient: ["#33404E", "#1A2129"],
    accent: "#C6A15B",
    comingSoon: true,
  },
  {
    id: "autre",
    label: "Autre célébration",
    sublabel: "Un moment à votre image",
    icon: "sparkles",
    gradient: ["#FFFFFF", "#F5F5F4"],
    accent: "#6B6B6B",
  },
];

/** Un choix est enregistrable seulement s'il existe dans `EventType`. */
export function isSelectableChoice(choice: EventChoice): choice is EventChoice & { id: EventType } {
  return !choice.comingSoon;
}

export function placeholderNamesFor(eventType: string | null | undefined): {
  brideName: string;
  groomName: string;
} {
  return EVENT_TYPE_PLACEHOLDER_NAMES[normalizeEventType(eventType)];
}

export const ceremonyMeta: Record<
  CeremonyType,
  { label: string; short: string; icon: string; color: string; blurb: string }
> = {
  dot: {
    label: "Mariage traditionnel",
    short: "Traditionnel",
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
  benediction: {
    label: "Bénédiction nuptiale",
    short: "Bénédiction",
    icon: "✝",
    color: "#7d6a9c",
    blurb: "La cérémonie de bénédiction des époux, à l'église ou au temple.",
  },
  traditionnel: {
    label: "Étape traditionnelle",
    short: "Traditionnel",
    icon: "❋",
    color: "#a0522d",
    blurb: "Rites de la région, tenues locales, danse et libations.",
  },
  dejeuner: {
    label: "Déjeuner",
    short: "Déjeuner",
    icon: "☀",
    color: "#e8a85d",
    blurb: "Le repas du midi, entre proches, avant la fête.",
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
