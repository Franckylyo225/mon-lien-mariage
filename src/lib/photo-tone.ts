/**
 * Reads how bright a region of an already-loaded <img> is, so a template can
 * pick text/scrim treatment that stays legible over whatever photo the couple
 * uploaded, instead of assuming every photo is dark (or light) enough.
 *
 * Originally built inline for the "Date éditoriale" opening model; extracted
 * so any template that puts text over a raw photo can reuse the same
 * technique instead of re-implementing canvas sampling.
 */
export type PhotoTone = "light" | "dark";

/** Normalized sample region: 0–1 fractions of the image's natural size. */
export interface SampleRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

const FULL_REGION: SampleRegion = { x: 0, y: 0, width: 1, height: 1 };

/**
 * Average perceptual luminance (0–255) of `region` in `image`, or null if it
 * can't be read (tainted canvas from a cross-origin image without CORS, etc).
 * Downsamples to a small canvas — this only needs a rough average, not pixels.
 */
export function sampleLuminance(
  image: HTMLImageElement,
  region: SampleRegion = FULL_REGION,
): number | null {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const sx = Math.round(region.x * canvas.width);
    const sy = Math.round(region.y * canvas.height);
    const sw = Math.max(1, Math.round(region.width * canvas.width));
    const sh = Math.max(1, Math.round(region.height * canvas.height));
    const { data } = ctx.getImageData(sx, sy, sw, sh);

    let luminance = 0;
    let samples = 0;
    for (let i = 0; i < data.length; i += 4) {
      luminance += data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;
      samples += 1;
    }
    return samples > 0 ? luminance / samples : null;
  } catch {
    // Tainted canvas (no crossOrigin, remote host without CORS headers) — caller keeps its fallback tone.
    return null;
  }
}

/** `threshold` is the 0–255 luminance above which the region reads as "light" (needs dark text). */
export function toneFromLuminance(luminance: number, threshold = 156): PhotoTone {
  return luminance > threshold ? "light" : "dark";
}
