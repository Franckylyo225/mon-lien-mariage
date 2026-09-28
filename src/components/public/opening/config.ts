import type { Couple } from "@/lib/wedding-store";
import { openingModelMeta, type OpeningEffect, type OpeningModel } from "./types";

/**
 * Les réglages de la page d'ouverture vivent sur deux générations de champs :
 * les colonnes `splash_*` (historique, modèle « classique ») et le JSON
 * `opening_page_config` (modèles récents). Ce module est le seul endroit qui
 * connaît les deux : tout le reste — rendu public, éditeur, miniatures — lit
 * `resolveOpening()` et écrit via `openingPatch()`, pour que les priorités de
 * repli et les effets de bord ne divergent plus d'un appelant à l'autre.
 */
export type OpeningCouple = Pick<
  Couple,
  | "splashEnabled"
  | "splashBgMode"
  | "splashBgColor"
  | "splashBgImageUrl"
  | "splashKicker"
  | "splashTapLabel"
  | "splashShowDate"
  | "openingPageModel"
  | "openingPageEffect"
  | "openingPageConfig"
  | "heroImageUrl"
>;

export interface ResolvedOpening {
  enabled: boolean;
  model: OpeningModel;
  effect: OpeningEffect;
  /** Couleur du modèle, déjà repliée sur la valeur par défaut du modèle. */
  color: string | null;
  /** Photo plein écran, commune à tous les modèles. */
  photoUrl: string | null;
  bgMode: "theme" | "color" | "image";
  bgColor: string | null;
  kicker: string | null;
  tapLabel: string | null;
  showDate: boolean;
  quote: string | null;
  textTone: "auto" | "light" | "dark";
}

export function resolveOpening(couple: OpeningCouple): ResolvedOpening {
  const model = (couple.openingPageModel ?? "classique") as OpeningModel;
  const meta = openingModelMeta(model);
  const config = couple.openingPageConfig ?? {};

  return {
    enabled: couple.splashEnabled !== false,
    model: meta.id,
    effect: (couple.openingPageEffect as OpeningEffect) ?? meta.defaultEffect,
    color: config.color || meta.defaultColor || null,
    photoUrl: config.photoUrl || couple.splashBgImageUrl || couple.heroImageUrl || null,
    bgMode: couple.splashBgMode ?? "theme",
    bgColor: couple.splashBgColor ?? null,
    kicker: couple.splashKicker ?? null,
    tapLabel: couple.splashTapLabel ?? null,
    showDate: couple.splashShowDate !== false,
    quote: config.quote ?? null,
    textTone: config.textTone ?? "auto",
  };
}

export type OpeningChange = Partial<{
  enabled: boolean;
  model: OpeningModel;
  effect: OpeningEffect;
  color: string;
  photoUrl: string | null;
  bgMode: "theme" | "color" | "image";
  bgColor: string;
  kicker: string;
  tapLabel: string;
  showDate: boolean;
  quote: string;
  textTone: "auto" | "light" | "dark";
}>;

/**
 * Traduit un changement de l'éditeur vers les champs de stockage. La photo est
 * écrite dans les deux générations : le JSON fait autorité, la colonne reste
 * juste — sans quoi retirer une photo ferait réapparaître l'ancienne par repli.
 */
export function openingPatch(couple: OpeningCouple, change: OpeningChange): Partial<Couple> {
  const patch: Partial<Couple> = {};
  const config = { ...(couple.openingPageConfig ?? {}) };
  let configTouched = false;

  if (change.enabled !== undefined) patch.splashEnabled = change.enabled;
  if (change.model !== undefined) {
    patch.openingPageModel = change.model;
    // Chaque modèle a le geste pour lequel il a été dessiné.
    patch.openingPageEffect = change.effect ?? openingModelMeta(change.model).defaultEffect;
  } else if (change.effect !== undefined) {
    patch.openingPageEffect = change.effect;
  }
  if (change.bgMode !== undefined) patch.splashBgMode = change.bgMode;
  if (change.bgColor !== undefined) patch.splashBgColor = change.bgColor;
  if (change.kicker !== undefined) patch.splashKicker = change.kicker;
  if (change.tapLabel !== undefined) patch.splashTapLabel = change.tapLabel;
  if (change.showDate !== undefined) patch.splashShowDate = change.showDate;

  if (change.photoUrl !== undefined) {
    config.photoUrl = change.photoUrl;
    configTouched = true;
    patch.splashBgImageUrl = change.photoUrl;
    // Seul le modèle classique peut afficher autre chose que la photo : lui
    // seul a besoin de basculer son mode de fond quand on en ajoute une.
    const model = change.model ?? couple.openingPageModel ?? "classique";
    if (model === "classique" && change.photoUrl) patch.splashBgMode = "image";
  }

  if (change.color !== undefined) {
    config.color = change.color;
    configTouched = true;
  }
  if (change.quote !== undefined) {
    config.quote = change.quote;
    configTouched = true;
  }
  if (change.textTone !== undefined) {
    config.textTone = change.textTone;
    configTouched = true;
  }

  if (configTouched) patch.openingPageConfig = config;
  return patch;
}
