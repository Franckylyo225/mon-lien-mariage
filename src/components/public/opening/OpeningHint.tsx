import type { OpeningEffect } from "./types";

interface Props {
  greeting?: string | null;
  effectLabel: string;
  effect?: OpeningEffect;
  color?: string;
}

/** Slot commun : « Hello {prénom} » (si lien personnel) + texte de l'effet. */
export function OpeningHint({ greeting, effectLabel, effect = "tap", color }: Props) {
  return (
    <div className="opening-hint" style={color ? { color } : undefined}>
      {greeting ? <p className="opening-hint-greeting">{greeting}</p> : null}
      {effect === "swipe_up" ? (
        <span className="opening-hint-arrow" aria-hidden>
          ↑
        </span>
      ) : null}
      {effect === "swipe_down" ? (
        <span className="opening-hint-arrow down" aria-hidden>
          ↓
        </span>
      ) : null}
      <p className="opening-hint-label">{effectLabel}</p>
    </div>
  );
}

export default OpeningHint;
