import { OpeningHint } from "./OpeningHint";
import { SCRIPT_FONT, useScriptFont } from "./use-script-font";
import type { OpeningModelProps } from "./types";

function initial(name: string): string {
  return (name || "").trim().charAt(0).toUpperCase();
}

/**
 * Monogramme — minimal éditorial.
 * Initiales séparées d'un filet en haut à droite, « Save our date » centré,
 * et la date empilée en bas à gauche entre deux filets verticaux.
 */
export function ModelMonogramme({
  brideName,
  groomName,
  dateLabel,
  numericDate,
  city,
  color,
  showDate,
  greeting,
  effectLabel,
  effect,
  fontHeading,
  fontBody,
}: OpeningModelProps) {
  useScriptFont();
  const [day, month, year] = numericDate.split("/").map((part) => part.trim());
  const rule = "block w-px flex-1 bg-current opacity-25";

  return (
    <div
      className="relative flex h-full w-full flex-col px-8 py-9 text-[#141414]"
      style={{ background: color || "#FCFCFB", fontFamily: fontBody }}
    >
      {/* Monogramme, en haut à droite */}
      <div className="flex justify-end">
        <div className="flex h-24 flex-col items-center">
          <span className={rule} />
          <p
            className="my-2 text-[clamp(1.4rem,7vw,1.9rem)] leading-none tracking-[0.04em]"
            style={{ fontFamily: fontHeading }}
          >
            {initial(brideName)}
            <span className="mx-1.5 align-middle text-[0.7em] opacity-40">|</span>
            {initial(groomName)}
          </p>
          <span className={rule} />
        </div>
      </div>

      {/* Bloc central */}
      <div className="mt-10 text-center">
        <p
          className="text-[clamp(1.05rem,5vw,1.35rem)] uppercase tracking-[0.26em]"
          style={{ fontFamily: fontHeading }}
        >
          Save
          <span className="px-2 text-[1.5em] normal-case" style={{ fontFamily: SCRIPT_FONT }}>
            our
          </span>
          Date
        </p>
        {showDate && dateLabel ? (
          <p className="mt-4 text-[11px] uppercase tracking-[0.26em]">{dateLabel}</p>
        ) : null}
        {showDate && city ? (
          <p className="mt-2 text-[9px] uppercase tracking-[0.26em] opacity-65">{city}</p>
        ) : null}
      </div>

      {/* Date empilée, en bas à gauche */}
      {showDate ? (
        <div className="mt-auto flex items-stretch gap-4">
          <div className="flex w-px flex-col items-center py-1">
            <span className={rule} />
          </div>
          <div
            className="text-[clamp(2.1rem,11vw,2.9rem)] leading-[1.02] tracking-[0.02em]"
            style={{ fontFamily: fontHeading }}
            aria-label={dateLabel}
          >
            <span className="block">{day}</span>
            <span className="block">{month}</span>
            <span className="block">{year}</span>
          </div>
        </div>
      ) : null}

      <OpeningHint greeting={greeting} effectLabel={effectLabel} effect={effect} />
    </div>
  );
}

export default ModelMonogramme;
