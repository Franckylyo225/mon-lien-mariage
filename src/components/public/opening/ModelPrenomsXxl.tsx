import { OpeningHint } from "./OpeningHint";
import type { OpeningModelProps } from "./types";

/**
 * Prénoms XXL — éditorial contemporain.
 * Deux prénoms en très gros grotesque qui encadrent une photo portrait plus
 * étroite, « Save the date » réparti sur toute la largeur en haut, date et
 * lieu en petites capitales espacées en bas.
 */
export function ModelPrenomsXxl({
  brideName,
  groomName,
  dateLabel,
  city,
  photoUrl,
  color,
  showDate,
  greeting,
  effectLabel,
  effect,
  fontBody,
}: OpeningModelProps) {
  const name =
    "relative z-10 w-full text-center text-[clamp(2.6rem,15vw,4.2rem)] font-bold uppercase leading-[0.9] tracking-[-0.02em]";

  return (
    <div
      className="relative flex h-full w-full flex-col justify-between px-6 py-9 text-[#141414]"
      style={{ background: color || "#EFE9DC", fontFamily: fontBody }}
    >
      <div className="flex items-baseline justify-between text-[9px] font-medium uppercase tracking-[0.3em] sm:text-[10px]">
        <span>Save</span>
        <span>the</span>
        <span>Date</span>
      </div>

      <div className="flex flex-col items-center">
        <p className={name}>{brideName}</p>
        <div className="-my-[0.06em] w-[54%] max-w-[210px] overflow-hidden bg-black/5">
          <div className="aspect-[3/4] w-full">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt=""
                className="h-full w-full object-cover"
                style={{ filter: "grayscale(1) contrast(1.05)" }}
              />
            ) : null}
          </div>
        </div>
        <p className={name}>{groomName}</p>
      </div>

      {showDate && (dateLabel || city) ? (
        <p className="text-center text-[9px] uppercase leading-[1.9] tracking-[0.28em] opacity-75 sm:text-[10px]">
          {dateLabel}
          {city ? (
            <>
              <br />
              {city}
            </>
          ) : null}
        </p>
      ) : (
        <span />
      )}

      <OpeningHint greeting={greeting} effectLabel={effectLabel} effect={effect} />
    </div>
  );
}

export default ModelPrenomsXxl;
