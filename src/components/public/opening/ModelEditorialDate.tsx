import { useState } from "react";
import { OpeningHint } from "./OpeningHint";
import type { OpeningModelProps } from "./types";

type ResolvedTone = "light" | "dark";

export function ModelEditorialDate({
  brideName,
  groomName,
  numericDate,
  photoUrl,
  greeting,
  effectLabel,
  effect,
  fontBody,
  quote,
  textTone = "auto",
}: OpeningModelProps) {
  const [automaticTone, setAutomaticTone] = useState<ResolvedTone>("light");
  const resolvedTone: ResolvedTone = textTone === "auto" || !textTone ? automaticTone : textTone;
  const [day, month, year] = numericDate.split("/").map((part) => part.trim());

  const detectTone = (image: HTMLImageElement) => {
    if (textTone !== "auto" && textTone) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 12;
      canvas.height = 24;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(6, 4, 6, 16).data;
      let luminance = 0;
      let samples = 0;
      for (let index = 0; index < pixels.length; index += 16) {
        luminance += pixels[index] * 0.2126 + pixels[index + 1] * 0.7152 + pixels[index + 2] * 0.0722;
        samples += 1;
      }
      setAutomaticTone(samples > 0 && luminance / samples > 156 ? "dark" : "light");
    } catch {
      setAutomaticTone("light");
    }
  };

  return (
    <div className={`editorial-date editorial-date-${resolvedTone}`} style={{ fontFamily: fontBody }}>
      {photoUrl ? (
        <img
          src={photoUrl}
          alt="Portrait des mariés"
          crossOrigin="anonymous"
          className="editorial-date-photo"
          onLoad={(event) => detectTone(event.currentTarget)}
        />
      ) : (
        <div className="editorial-date-photo editorial-date-placeholder" />
      )}
      <div className="editorial-date-contrast" aria-hidden />
      <div className="editorial-date-numerals" aria-label={numericDate}>
        <span>{day}</span>
        <span>{month}</span>
        <span>{year}</span>
      </div>
      <div className="editorial-date-footer">
        {quote ? <p className="editorial-date-quote">“{quote}”</p> : null}
        <p className="editorial-date-names">{brideName} &amp; {groomName}</p>
      </div>
      <OpeningHint greeting={greeting?.toUpperCase()} effectLabel={effectLabel} effect={effect} />
    </div>
  );
}

export default ModelEditorialDate;