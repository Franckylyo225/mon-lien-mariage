import { OpeningHint } from "./OpeningHint";
import type { OpeningModelProps } from "./types";

export function ModelBreakingNews({
  brideName,
  groomName,
  dateLabel,
  city,
  photoUrl,
  color,
  showDate,
  greeting,
  effectLabel,
  fontHeading,
  fontBody,
}: OpeningModelProps) {
  const ticker = [
    "Save the date",
    `${brideName} & ${groomName}`,
    [dateLabel, city].filter(Boolean).join(" · "),
  ]
    .filter(Boolean)
    .join("   •   ");

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center px-6 py-10 text-white"
      style={{ background: color, fontFamily: fontBody }}
    >
      <p className="text-center text-[11px] uppercase tracking-[0.3em] opacity-85">
        Vous êtes invité au mariage de
      </p>
      <p
        className="mt-2 text-center text-[34px] italic leading-tight sm:text-[42px]"
        style={{ fontFamily: fontHeading }}
      >
        {brideName} &amp; {groomName}
      </p>

      <div className="mt-6 w-[76vw] max-w-[330px] rounded-[14px] border-[3px] border-white/85 bg-black/25 p-1.5">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[8px] bg-black/40">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
          <span className="absolute left-2 top-2 rounded-[3px] bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-black">
            ● Live
          </span>
        </div>
        <div className="opening-marquee mt-1.5 rounded-[4px] bg-white/95 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-black">
          <span>{ticker}</span>
        </div>
      </div>

      {showDate && dateLabel ? (
        <p className="mt-5 text-center text-[11px] uppercase tracking-[0.3em] opacity-85">
          {dateLabel}
        </p>
      ) : null}

      <OpeningHint greeting={greeting} effectLabel={effectLabel} />
    </div>
  );
}

export default ModelBreakingNews;
