import { OpeningHint } from "./OpeningHint";
import type { OpeningModelProps } from "./types";

export function ModelOlive({
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
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center px-7 py-10 text-[#F6F2E9]"
      style={{ background: color, fontFamily: fontBody }}
    >
      <p className="text-center text-[34px] italic leading-none sm:text-[42px]" style={{ fontFamily: fontHeading }}>
        Save
      </p>
      <p className="mt-1 text-center text-[13px] uppercase tracking-[0.45em]">The Date</p>

      <div className="mt-6 w-[70vw] max-w-[300px] border border-white/40 p-2">
        <div className="aspect-[4/5] w-full overflow-hidden bg-white/10">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
      </div>

      <p
        className="mt-6 text-center text-[30px] italic leading-tight sm:text-[36px]"
        style={{ fontFamily: fontHeading }}
      >
        {brideName} <span className="opacity-70">&amp;</span> {groomName}
      </p>

      {showDate && (dateLabel || city) ? (
        <p className="mt-2 text-center text-[11px] uppercase tracking-[0.28em] opacity-80">
          {[dateLabel, city].filter(Boolean).join(" · ")}
        </p>
      ) : null}

      <OpeningHint greeting={greeting} effectLabel={effectLabel} />
    </div>
  );
}

export default ModelOlive;
