import { OpeningHint } from "./OpeningHint";
import { RoyalMonogram } from "./RoyalMonogram";
import type { OpeningModelProps } from "./types";

export function ModelArcheFloral({
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
      className="relative h-full w-full overflow-hidden bg-[#2b2320] text-white"
      style={{ fontFamily: fontBody }}
    >
      {photoUrl ? (
        <img src={photoUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/70" />

      <div
        className="absolute inset-x-0 bottom-0 flex flex-col items-center px-7 pb-24 pt-16"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${color}CC 28%, ${color}F2 100%)`,
          borderTopLeftRadius: "50% 22%",
          borderTopRightRadius: "50% 22%",
        }}
      >
        <div
          className="-mt-10 grid h-36 w-36 place-items-center overflow-hidden rounded-full border-[2.5px] border-white/75 shadow-[0_10px_34px_rgba(0,0,0,0.28),inset_0_1px_2px_rgba(255,255,255,0.35),inset_0_-1px_2px_rgba(0,0,0,0.15)] backdrop-blur-md"
          style={{
            background: "radial-gradient(circle at 30% 28%, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.14) 45%, rgba(255,255,255,0.08) 100%)",
          }}
        >
          <RoyalMonogram
            first={brideName}
            second={groomName}
            className="royal-monogram"
          />
        </div>

        <p className="mt-5 text-[12px] uppercase tracking-[0.4em] opacity-90">Save the date</p>
        <p
          className="mt-2 text-center text-[32px] italic leading-tight sm:text-[38px]"
          style={{ fontFamily: fontHeading }}
        >
          {brideName} &amp; {groomName}
        </p>
        {showDate && (dateLabel || city) ? (
          <p className="mt-2 text-center text-[11px] uppercase tracking-[0.26em] opacity-85">
            {[dateLabel, city].filter(Boolean).join(" · ")}
          </p>
        ) : null}
      </div>

      <OpeningHint greeting={greeting} effectLabel={effectLabel} effect="swipe_up" />
    </div>
  );
}

export default ModelArcheFloral;
