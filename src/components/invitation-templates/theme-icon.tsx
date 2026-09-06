/**
 * Theme-aware PNG icon.
 *
 * Uploaded icons are black line-art on a transparent background. By rendering
 * them through a CSS mask we can tint them with the current theme colour so
 * they remain visible on both light and dark templates.
 */
export function ThemeIcon({
  src,
  color = "currentColor",
  className = "size-6",
  alt = "",
}: {
  src: string;
  color?: string;
  className?: string;
  alt?: string;
}) {
  return (
    <span
      aria-hidden={alt ? undefined : "true"}
      role="img"
      aria-label={alt}
      className={`inline-block shrink-0 ${className}`}
      style={{
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        backgroundColor: color,
      }}
    />
  );
}
