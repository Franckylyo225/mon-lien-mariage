import { OpeningHint } from "./OpeningHint";
import { SCRIPT_FONT, useScriptFont } from "./use-script-font";
import type { OpeningModelProps } from "./types";

/**
 * Save the date — classique épuré.
 * « SAVE » et « DATE » en grandes capitales serif très espacées, reliées par
 * un « the » en script posé sur une volute fine ; date, prénoms et mention de
 * l'invitation à suivre en bas.
 */
export function ModelSaveTheDate({
  brideName,
  groomName,
  dateLabel,
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
  const ink = color || "#7C7F63";

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center bg-[#FBF8F7] px-8 py-10"
      style={{ color: ink, fontFamily: fontBody }}
    >
      <div className="relative w-full max-w-[320px]">
        <p
          className="text-center text-[clamp(2.1rem,11vw,3rem)] uppercase leading-none tracking-[0.3em]"
          style={{ fontFamily: fontHeading }}
        >
          Save
        </p>

        {/* Volute fine qui traverse la page et porte le « the ». */}
        <div className="relative my-1 h-14">
          <svg viewBox="0 0 320 56" className="absolute inset-0 h-full w-full" aria-hidden>
            <path
              d="M4 44 C 70 44, 96 12, 150 12 C 212 12, 236 44, 316 44"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.9"
              opacity="0.55"
              strokeLinecap="round"
            />
          </svg>
          <p
            className="absolute inset-0 grid place-items-center text-[clamp(1.9rem,9vw,2.4rem)] leading-none"
            style={{ fontFamily: SCRIPT_FONT }}
          >
            the
          </p>
        </div>

        <p
          className="text-center text-[clamp(2.1rem,11vw,3rem)] uppercase leading-none tracking-[0.3em]"
          style={{ fontFamily: fontHeading }}
        >
          Date
        </p>
      </div>

      <div className="mt-12 text-center">
        {showDate && dateLabel ? (
          <p className="text-[13px] tracking-[0.06em]" style={{ fontFamily: fontHeading }}>
            {dateLabel}
          </p>
        ) : null}
        <p
          className="mt-3 text-[clamp(0.95rem,4.4vw,1.15rem)] uppercase tracking-[0.22em]"
          style={{ fontFamily: fontHeading }}
        >
          {brideName}
          <span className="px-2 text-[1.35em] lowercase" style={{ fontFamily: SCRIPT_FONT }}>
            &amp;
          </span>
          {groomName}
        </p>
        {showDate && city ? (
          <p className="mt-2 text-[10px] uppercase tracking-[0.24em] opacity-70">{city}</p>
        ) : null}
        <p className="mt-3 text-[11px] italic opacity-75" style={{ fontFamily: fontHeading }}>
          L'invitation officielle suivra
        </p>
      </div>

      <OpeningHint greeting={greeting} effectLabel={effectLabel} effect={effect} />
    </div>
  );
}

export default ModelSaveTheDate;
