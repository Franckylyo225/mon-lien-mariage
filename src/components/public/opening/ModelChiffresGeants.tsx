import { OpeningHint } from "./OpeningHint";
import { SCRIPT_FONT, useScriptFont } from "./use-script-font";
import type { OpeningModelProps } from "./types";

/**
 * Chiffres géants — la date prend toute la page.
 * Bloc d'informations aligné en haut à gauche, prénoms en script, puis le
 * jour, le mois et l'année empilés en très grands chiffres à droite.
 */
export function ModelChiffresGeants({
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

  return (
    <div
      className="relative flex h-full w-full flex-col px-7 py-10 text-[#121212]"
      style={{ background: color || "#FBFAF8", fontFamily: fontBody }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em]">Save our date</p>
      {city ? (
        <p className="mt-3 max-w-[60%] text-[9px] uppercase leading-[2] tracking-[0.24em] opacity-70">
          {city}
        </p>
      ) : null}
      <span className="mt-4 block h-px w-10 bg-current opacity-40" />

      <div className="mt-auto flex flex-col items-end">
        <p
          className="mb-1 pr-1 text-[clamp(1.5rem,7vw,2rem)] leading-none"
          style={{ fontFamily: SCRIPT_FONT }}
        >
          {brideName} + {groomName}
        </p>
        {showDate ? (
          <div
            className="flex flex-col items-end text-[clamp(3.4rem,20vw,5.6rem)] font-medium leading-[0.82] tracking-[-0.01em]"
            style={{ fontFamily: fontHeading }}
            aria-label={dateLabel}
          >
            <span>{day}</span>
            <span>{month}</span>
            <span>{year}</span>
          </div>
        ) : null}
      </div>

      <OpeningHint greeting={greeting} effectLabel={effectLabel} effect={effect} />
    </div>
  );
}

export default ModelChiffresGeants;
