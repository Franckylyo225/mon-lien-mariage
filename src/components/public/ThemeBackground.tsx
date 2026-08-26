import type { ThemeId } from "@/lib/wedding-store";
import {
  bandForTheme,
  motifBackgroundImage,
  motifForTheme,
} from "@/lib/theme-motifs";

/**
 * Decorative repeating motif rendered behind the invitation content.
 * Purely presentational: fixed, non-interactive, and only rendered for
 * themes that define a motif (the historical 15 themes have none).
 */
export function ThemeBackground({
  theme,
  accent,
}: {
  theme: ThemeId;
  accent?: string;
}) {
  const motif = motifForTheme(theme, accent);
  if (!motif) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        backgroundImage: motifBackgroundImage(motif),
        backgroundRepeat: "repeat",
        backgroundSize: `${motif.size}px ${motif.size}px`,
        opacity: motif.opacity,
      }}
    />
  );
}

/** Thin decorative band (kente / bogolan style) for themes that define one. */
export function ThemeHeroBand({
  theme,
  className,
}: {
  theme: ThemeId;
  className?: string;
}) {
  const band = bandForTheme(theme);
  if (!band) return null;
  return (
    <div
      aria-hidden
      className={"pointer-events-none h-2 w-full " + (className ?? "")}
      style={{ background: band }}
    />
  );
}
