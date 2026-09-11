import { OpeningHint } from "./OpeningHint";
import type { OpeningModelProps } from "./types";

export function ModelPresse({
  brideName,
  groomName,
  dateLabel,
  city,
  photoUrl,
  showDate,
  greeting,
  effectLabel,
  fontBody,
}: OpeningModelProps & { effect?: never }) {
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center bg-white px-6 py-10 text-[#181818]"
      style={{ fontFamily: fontBody }}
    >
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.42em] sm:text-[13px]">
        {brideName}
      </p>
      <p className="mt-1 text-center text-[11px] font-semibold uppercase tracking-[0.42em] sm:text-[13px]">
        {groomName}
      </p>

      <div className="relative mt-7 w-[68vw] max-w-[300px] overflow-hidden bg-[#efeae4]">
        <div className="aspect-[3/4] w-full">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="absolute inset-0 grid place-items-center">
          <p className="px-3 text-center text-[26px] font-semibold uppercase leading-[0.95] tracking-[0.06em] text-white mix-blend-difference sm:text-[34px]">
            Save
            <br />
            the
            <br />
            date
          </p>
        </div>
      </div>

      {showDate && (dateLabel || city) ? (
        <p className="mt-6 text-center text-[11px] uppercase tracking-[0.3em] opacity-70">
          {[dateLabel, city].filter(Boolean).join(" · ")}
        </p>
      ) : null}

      <OpeningHint greeting={greeting} effectLabel={effectLabel} />
    </div>
  );
}

export default ModelPresse;
