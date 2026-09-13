import { useEffect, useState } from "react";
import { OpeningHint } from "./OpeningHint";
import type { OpeningModelProps } from "./types";

const DEFAULT_TICKER = "SAVE THE DATE • {PRENOM1} & {PRENOM2} • {DATE}";

function resolveTicker(
  template: string,
  brideName: string,
  groomName: string,
  dateLabel: string,
): string {
  return template
    .replaceAll("{PRENOM1}", brideName)
    .replaceAll("{PRENOM2}", groomName)
    .replaceAll("{DATE}", dateLabel);
}

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
  tickerText,
  channelLabel,
}: OpeningModelProps) {
  const [clock, setClock] = useState("--:--");
  const ticker = resolveTicker(tickerText?.trim() || DEFAULT_TICKER, brideName, groomName, dateLabel);
  const tickerLoop = `${ticker}   •   ${ticker}   •   `;

  useEffect(() => {
    const updateClock = () => {
      setClock(
        new Intl.DateTimeFormat(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    };
    updateClock();
    const interval = window.setInterval(updateClock, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      className="breaking-news-model relative flex h-full w-full flex-col items-center justify-center px-5 py-10"
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

      <div className="breaking-tv mt-6 w-[84vw] max-w-[350px]">
        <div className="breaking-tv-bezel">
        <div className="breaking-tv-screen relative aspect-[4/3] w-full overflow-hidden">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
          <div className="breaking-tv-shade" aria-hidden />
          <div className="breaking-tv-topline">
            <time dateTime={clock}>{clock}</time>
            <span className="breaking-tv-live"><i aria-hidden /> Direct</span>
          </div>
          <div className="breaking-tv-channel" aria-label={`Chaîne ${channelLabel?.trim() || "LOVE TV"}`}>
            <span aria-hidden>♥</span>
            <b>{channelLabel?.trim() || "LOVE TV"}</b>
          </div>
          <div className="breaking-tv-lower-third">
            <strong>Édition spéciale</strong>
            <span>{brideName} &amp; {groomName}</span>
          </div>
        </div>
        {greeting ? <div className="breaking-tv-greeting">{greeting}</div> : null}
        <div className="breaking-tv-ticker" aria-label={ticker}>
          <div className="breaking-tv-ticker-track" aria-hidden>
            <span>{tickerLoop}</span>
            <span>{tickerLoop}</span>
          </div>
        </div>
        </div>
        <div className="breaking-tv-stand" aria-hidden><span /></div>
      </div>

      {showDate && dateLabel ? (
        <p className="mt-5 text-center text-[11px] uppercase tracking-[0.3em] opacity-85">
          {dateLabel}
        </p>
      ) : null}

      <OpeningHint effectLabel={effectLabel} />
    </div>
  );
}

export default ModelBreakingNews;
