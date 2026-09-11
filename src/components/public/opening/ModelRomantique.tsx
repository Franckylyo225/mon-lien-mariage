import { OpeningHint } from "./OpeningHint";
import type { OpeningModelProps } from "./types";

export function ModelRomantique({
  brideName,
  groomName,
  dateLabel,
  city,
  photoUrl,
  accent,
  showDate,
  greeting,
  effectLabel,
  fontHeading,
  fontBody,
}: OpeningModelProps) {
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center bg-[#F4EDE3] px-7 py-10 text-[#3A2E28]"
      style={{ fontFamily: fontBody }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute select-none text-[42vw] italic leading-none opacity-[0.08]"
        style={{ fontFamily: fontHeading, color: accent }}
      >
        &amp;
      </span>

      <p
        className="relative text-center text-[36px] italic leading-none sm:text-[44px]"
        style={{ fontFamily: fontHeading, color: accent }}
      >
        {brideName}
      </p>

      <div className="relative mt-5 w-[62vw] max-w-[260px] overflow-hidden rounded-t-full rounded-b-[999px] border border-[#3A2E28]/15 bg-white/50">
        <div className="aspect-[3/4] w-full">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
      </div>

      <p
        className="relative mt-5 text-center text-[36px] italic leading-none sm:text-[44px]"
        style={{ fontFamily: fontHeading, color: accent }}
      >
        {groomName}
      </p>

      {showDate && (dateLabel || city) ? (
        <p className="relative mt-4 text-center text-[11px] uppercase tracking-[0.3em] opacity-70">
          {[dateLabel, city].filter(Boolean).join(" — ")}
        </p>
      ) : null}

      <svg
        className="relative mt-4"
        width="34"
        height="28"
        viewBox="0 0 34 28"
        fill="none"
        aria-hidden
      >
        <path
          d="M17 25S3 17.4 3 9.9A6 6 0 0 1 17 6.6 6 6 0 0 1 31 9.9C31 17.4 17 25 17 25Z"
          stroke={accent}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>

      <OpeningHint greeting={greeting} effectLabel={effectLabel} />
    </div>
  );
}

export default ModelRomantique;
