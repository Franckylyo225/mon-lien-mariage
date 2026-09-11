import { Suspense, lazy, type ComponentType } from "react";
import { InvitationSplash, type SplashCustomization } from "@/components/public/InvitationSplash";
import type { ResolvedTheme } from "@/lib/wedding-theme";
import { OpeningShell } from "./OpeningShell";
import {
  OPENING_EFFECT_LABEL,
  formatOpeningDate,
  openingModelMeta,
  type OpeningEffect,
  type OpeningModel,
  type OpeningModelProps,
  type OpeningPageConfig,
} from "./types";

/** Chargement à la demande : seul le modèle choisi est téléchargé. */
const LAZY_MODELS: Partial<Record<OpeningModel, ComponentType<OpeningModelProps>>> = {
  presse: lazy(() => import("./ModelPresse")),
  olive: lazy(() => import("./ModelOlive")),
  arche_floral: lazy(() => import("./ModelArcheFloral")),
  romantique: lazy(() => import("./ModelRomantique")),
  breaking_news: lazy(() => import("./ModelBreakingNews")),
};

interface Props extends SplashCustomization {
  model: OpeningModel;
  effect: OpeningEffect;
  config?: OpeningPageConfig | null;
  brideName: string;
  groomName: string;
  weddingDate?: string | null;
  city?: string | null;
  heroImageUrl?: string | null;
  theme: ResolvedTheme;
  greeting?: string | null;
  onDone: () => void;
  onOpenStart?: () => void;
}

export function OpeningPage({
  model,
  effect,
  config,
  brideName,
  groomName,
  weddingDate,
  city,
  heroImageUrl,
  theme,
  greeting,
  onDone,
  onOpenStart,
  ...splash
}: Props) {
  const meta = openingModelMeta(model);

  if (meta.id === "classique") {
    return (
      <InvitationSplash
        {...splash}
        brideName={brideName}
        groomName={groomName}
        weddingDate={weddingDate}
        city={city}
        theme={theme}
        effect={effect}
        greeting={greeting}
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
    city,
    photoUrl: config?.photoUrl || splash.bgImageUrl || heroImageUrl || null,
    color: config?.color || meta.defaultColor || theme.accent,
    accent: theme.accent,
    fontHeading: theme.fontHeading,
    fontBody: theme.fontBody,
    showDate: splash.showDate !== false,
    greeting,
    effectLabel: OPENING_EFFECT_LABEL[effect],
  };

  return (
    <OpeningShell effect={effect} onDone={onDone} onOpenStart={onOpenStart}>
      <Suspense fallback={<div className="h-full w-full bg-background" />}>
        <Model {...modelProps} />
      </Suspense>
    </OpeningShell>
  );
}

export default OpeningPage;
