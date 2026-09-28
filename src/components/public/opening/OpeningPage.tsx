import { Suspense, lazy, type ComponentType } from "react";
import { InvitationSplash } from "@/components/public/InvitationSplash";
import type { ResolvedTheme } from "@/lib/wedding-theme";
import { OpeningShell } from "./OpeningShell";
import type { ResolvedOpening } from "./config";
import {
  OPENING_EFFECT_LABEL,
  formatOpeningDate,
  openingModelMeta,
  type OpeningModel,
  type OpeningModelProps,
} from "./types";

function formatNumericOpeningDate(date?: string | null): string {
  if (!date) return "-- / -- / --";
  const parsed = new Date(`${date.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return "-- / -- / --";
  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = String(parsed.getFullYear()).slice(-2);
  return `${day} / ${month} / ${year}`;
}

/** Chargement à la demande : seul le modèle choisi est téléchargé. */
const LAZY_MODELS: Partial<Record<OpeningModel, ComponentType<OpeningModelProps>>> = {
  presse: lazy(() => import("./ModelPresse")),
  olive: lazy(() => import("./ModelOlive")),
  arche_floral: lazy(() => import("./ModelArcheFloral")),
  romantique: lazy(() => import("./ModelRomantique")),
  editorial_date: lazy(() => import("./ModelEditorialDate")),
  prenoms_xxl: lazy(() => import("./ModelPrenomsXxl")),
  chiffres_geants: lazy(() => import("./ModelChiffresGeants")),
  save_the_date: lazy(() => import("./ModelSaveTheDate")),
  monogramme: lazy(() => import("./ModelMonogramme")),
};

interface Props {
  /** Réglages déjà repliés par `resolveOpening()`. */
  opening: ResolvedOpening;
  brideName: string;
  groomName: string;
  weddingDate?: string | null;
  city?: string | null;
  theme: ResolvedTheme;
  greeting?: string | null;
  onDone: () => void;
  onOpenStart?: () => void;
}

export function OpeningPage({
  opening,
  brideName,
  groomName,
  weddingDate,
  city,
  theme,
  greeting,
  onDone,
  onOpenStart,
}: Props) {
  const meta = openingModelMeta(opening.model);

  if (meta.id === "classique") {
    return (
      <InvitationSplash
        brideName={brideName}
        groomName={groomName}
        weddingDate={weddingDate}
        city={city}
        theme={theme}
        effect={opening.effect}
        greeting={greeting}
        bgMode={opening.bgMode}
        bgColor={opening.bgColor}
        bgImageUrl={opening.photoUrl}
        kicker={opening.kicker}
        tapLabel={opening.tapLabel}
        showDate={opening.showDate}
        onDone={onDone}
        onOpenStart={onOpenStart}
      />
    );
  }

  const Model = LAZY_MODELS[meta.id];
  if (!Model) return null;

  const modelProps: OpeningModelProps = {
    brideName,
    groomName,
    dateLabel: formatOpeningDate(weddingDate),
    numericDate: formatNumericOpeningDate(weddingDate),
    city,
    photoUrl: opening.photoUrl,
    color: opening.color || theme.accent,
    accent: theme.accent,
    fontHeading: theme.fontHeading,
    fontBody: theme.fontBody,
    showDate: opening.showDate,
    greeting,
    effectLabel: OPENING_EFFECT_LABEL[opening.effect],
    effect: opening.effect,
    quote: opening.quote,
    textTone: opening.textTone,
  };

  return (
    <OpeningShell effect={opening.effect} onDone={onDone} onOpenStart={onOpenStart}>
      <Suspense fallback={<div className="h-full w-full bg-background" />}>
        <Model {...modelProps} />
      </Suspense>
    </OpeningShell>
  );
}

export default OpeningPage;
