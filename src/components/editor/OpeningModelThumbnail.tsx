import { useLayoutEffect, useRef, useState } from "react";
import coupleFront from "@/assets/couples/front-view-smiley-couple-posing-together.jpg.asset.json";
import coupleEmbraced from "@/assets/couples/side-view-embraced-smiley-couple.jpg.asset.json";
import ring from "@/assets/engagement-ring.jpg.asset.json";
import bouquet from "@/assets/hero-bouquet.jpg.asset.json";
import { InvitationSplash } from "@/components/public/InvitationSplash";
import { ModelArcheFloral } from "@/components/public/opening/ModelArcheFloral";
import { ModelChiffresGeants } from "@/components/public/opening/ModelChiffresGeants";
import { ModelEditorialDate } from "@/components/public/opening/ModelEditorialDate";
import { ModelMonogramme } from "@/components/public/opening/ModelMonogramme";
import { ModelPrenomsXxl } from "@/components/public/opening/ModelPrenomsXxl";
import { ModelSaveTheDate } from "@/components/public/opening/ModelSaveTheDate";
import { ModelOlive } from "@/components/public/opening/ModelOlive";
import { ModelPresse } from "@/components/public/opening/ModelPresse";
import { ModelRomantique } from "@/components/public/opening/ModelRomantique";
import {
  OPENING_EFFECT_LABEL,
  formatOpeningDate,
  openingModelMeta,
  type OpeningModel,
  type OpeningModelProps,
  type OpeningEffect,
} from "@/components/public/opening/types";
import { resolveOpening } from "@/components/public/opening/config";
import type { Couple } from "@/lib/wedding-store";
import type { ResolvedTheme } from "@/lib/wedding-theme";

const DEMO_PHOTOS: Record<OpeningModel, string> = {
  classique: bouquet.url,
  presse: coupleFront.url,
  olive: ring.url,
  arche_floral: coupleEmbraced.url,
  romantique: coupleFront.url,
  editorial_date: bouquet.url,
  prenoms_xxl: coupleEmbraced.url,
  chiffres_geants: coupleFront.url,
  save_the_date: bouquet.url,
  monogramme: ring.url,
};

const MODELS = {
  presse: ModelPresse,
  olive: ModelOlive,
  arche_floral: ModelArcheFloral,
  romantique: ModelRomantique,
  editorial_date: ModelEditorialDate,
  prenoms_xxl: ModelPrenomsXxl,
  chiffres_geants: ModelChiffresGeants,
  save_the_date: ModelSaveTheDate,
  monogramme: ModelMonogramme,
} as const;

/** La photo réelle du couple, ou une image de démonstration pour ne rien montrer de vide. */
export function previewPhotoFor(model: OpeningModel, couple: Couple): string {
  return resolveOpening(couple).photoUrl || DEMO_PHOTOS[model];
}

function numericDate(date?: string | null): string {
  if (!date) return "12 / 09 / 26";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "12 / 09 / 26";
  return [
    String(parsed.getDate()).padStart(2, "0"),
    String(parsed.getMonth() + 1).padStart(2, "0"),
    String(parsed.getFullYear()).slice(-2),
  ].join(" / ");
}

interface Props {
  model: OpeningModel;
  couple: Couple;
  theme: ResolvedTheme;
}

export function OpeningModelThumbnail({ model, couple, theme }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  const meta = openingModelMeta(model);
  const opening = resolveOpening(couple);
  const photoUrl = previewPhotoFor(model, couple);
  // La vignette du modèle actif montre le geste réellement enregistré ; les
  // autres montrent celui pour lequel elles ont été dessinées.
  const effect: OpeningEffect = model === opening.model ? opening.effect : meta.defaultEffect;

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const resize = () => setScale(frame.clientWidth / 393);
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const shared: OpeningModelProps = {
    brideName: couple.brideName || "Aïcha",
    groomName: couple.groomName || "Loïc",
    dateLabel: formatOpeningDate(couple.weddingDate) || "12 septembre 2026",
    numericDate: numericDate(couple.weddingDate),
    city: couple.city || "Abidjan",
    photoUrl,
    color: (model === opening.model ? opening.color : meta.defaultColor) || theme.accent,
    accent: theme.accent,
    fontHeading: theme.fontHeading,
    fontBody: theme.fontBody,
    showDate: opening.showDate,
    effectLabel: OPENING_EFFECT_LABEL[effect],
    effect,
    quote: opening.quote,
    textTone: opening.textTone,
  };

  let visual;
  if (model === "classique") {
    visual = (
      <InvitationSplash
        compact
        brideName={shared.brideName}
        groomName={shared.groomName}
        weddingDate={couple.weddingDate}
        city={shared.city}
        theme={theme}
        bgMode="image"
        bgImageUrl={photoUrl}
        kicker={opening.kicker}
        tapLabel={opening.tapLabel}
        showDate={shared.showDate}
        effect={effect}
        onDone={() => undefined}
      />
    );
  } else {
    const Model = MODELS[model];
    visual = <Model {...shared} />;
  }

  return (
    <div ref={frameRef} className="opening-model-thumbnail" aria-hidden>
      <div className="opening-model-thumbnail-stage" style={{ transform: `scale(${scale})` }}>
        {visual}
      </div>
    </div>
  );
}
