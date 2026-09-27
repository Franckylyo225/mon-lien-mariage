import { useState } from "react";
import { sampleLuminance, toneFromLuminance, type PhotoTone } from "@/lib/photo-tone";
import { OpeningHint } from "./OpeningHint";
import type { OpeningModelProps } from "./types";

type ResolvedTone = PhotoTone;

// Narrow vertical strip behind the stacked day/month/year numerals (right half of the photo).
const NUMERALS_REGION = { x: 0.5, y: 1 / 6, width: 0.5, height: 2 / 3 };

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
    const luminance = sampleLuminance(image, NUMERALS_REGION);
    // toneFromLuminance's "light"/"dark" names the *photo*, but this template's own
    // tone classes are named after the *text* — so a light photo needs "dark" text and vice versa.
    setAutomaticTone(
      luminance === null ? "light" : toneFromLuminance(luminance) === "light" ? "dark" : "light",
    );
  };

  return (
    <div
      className={`editorial-date editorial-date-${resolvedTone}`}
      style={{ fontFamily: fontBody }}
    >
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
        <p className="editorial-date-names">
          {brideName} &amp; {groomName}
        </p>
      </div>
      <OpeningHint greeting={greeting?.toUpperCase()} effectLabel={effectLabel} effect={effect} />
    </div>
  );
}

export default ModelEditorialDate;
