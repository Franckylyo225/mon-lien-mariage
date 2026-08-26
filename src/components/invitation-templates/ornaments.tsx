/**
 * Kit d'ornements vectoriels partagé par les thèmes africains & orientaux.
 * Chaque thème compose une identité visuelle distincte à partir de :
 *   - une forme de cadre photo (arche, ovale, médaillon, hexagone…)
 *   - un séparateur signature (adinkra, kente, chevrons bogolan, arabesque…)
 *   - des ornements d'angle et un bandeau textile.
 * Aucun asset externe : tout est dessiné en SVG/CSS.
 */

export type HeroShape =
  | "arch"
  | "scallop"
  | "oval"
  | "circle"
  | "hexagon"
  | "square"
  | "torn";

export type DividerKey =
  | "adinkra"
  | "kente"
  | "chevron"
  | "medallion"
  | "diamond"
  | "zellige"
  | "lattice"
  | "arabesque"
  | "girih"
  | "swash";

export type CornerKey =
  | "adinkra"
  | "kente"
  | "chevron"
  | "ring"
  | "diamond"
  | "zellige"
  | "lattice"
  | "vine"
  | "girih"
  | "none";

const SHAPE_CLIP: Record<HeroShape, string | undefined> = {
  arch: undefined, // handled with border-radius
  scallop: undefined,
  oval: undefined,
  circle: undefined,
  hexagon: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
  square: undefined,
  torn: undefined,
};

/* ------------------------------------------------------------------ */
/* Photo frame                                                         */
/* ------------------------------------------------------------------ */

export function HeroFrame({
  src,
  shape,
  accent,
  deep,
  ratio = "4/5",
  className,
}: {
  src?: string | null;
  shape: HeroShape;
  accent: string;
  deep: string;
  ratio?: string;
  className?: string;
}) {
  if (!src) return null;

  const radius =
    shape === "arch"
      ? "999px 999px 12px 12px"
      : shape === "scallop"
        ? "50% 50% 14px 14px / 34% 34% 8px 8px"
        : shape === "oval"
          ? "50%"
          : shape === "circle"
            ? "50%"
            : shape === "square"
              ? "2px"
              : "10px";

  const clip = SHAPE_CLIP[shape];
  const aspect = shape === "circle" ? "1/1" : ratio;

  return (
    <figure className={"relative " + (className ?? "")}>
      {/* liseré extérieur */}
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: aspect,
          borderRadius: clip ? undefined : radius,
          clipPath: clip,
          border: shape === "torn" ? "none" : `1px solid ${accent}66`,
          padding: shape === "torn" ? 0 : 6,
          background: `${deep}0d`,
        }}
      >
        <div
          className="h-full w-full overflow-hidden"
          style={{
            borderRadius: clip ? undefined : radius,
            clipPath: clip,
          }}
        >
          <img src={src} alt="" className="h-full w-full object-cover" />
        </div>
      </div>
      {shape === "torn" ? <TornEdge color="var(--wedding-bg)" /> : null}
    </figure>
  );
}

function TornEdge({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 360 18"
      preserveAspectRatio="none"
      aria-hidden
      className="absolute inset-x-0 bottom-0 h-4 w-full"
    >
      <path
        d="M0 18 L0 9 Q 20 2 42 8 T 88 7 T 134 11 T 180 5 T 226 10 T 272 6 T 318 11 T 360 7 L360 18 Z"
        fill={color}
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Dividers                                                            */
/* ------------------------------------------------------------------ */

export function Divider({
  kind,
  accent,
  deep,
  className,
}: {
  kind: DividerKey;
  accent: string;
  deep: string;
  className?: string;
}) {
  const cls = "w-full " + (className ?? "");
  switch (kind) {
    case "adinkra":
      return (
        <svg viewBox="0 0 360 26" className={cls} aria-hidden>
          <line x1="0" y1="13" x2="140" y2="13" stroke={accent} strokeWidth="1" />
          <line x1="220" y1="13" x2="360" y2="13" stroke={accent} strokeWidth="1" />
          <g transform="translate(180 13)" stroke={deep} strokeWidth="1.4" fill="none">
            <path d="M0 -11 V11 M-11 0 H11 M-8 -8 L8 8 M8 -8 L-8 8" />
            <circle cx="0" cy="0" r="4.5" />
          </g>
          <circle cx="180" cy="13" r="1.8" fill={accent} />
          <circle cx="152" cy="13" r="2" fill={accent} />
          <circle cx="208" cy="13" r="2" fill={accent} />
        </svg>
      );
    case "kente":
      return (
        <svg viewBox="0 0 360 20" className={cls} aria-hidden preserveAspectRatio="none">
          <rect x="0" y="0" width="360" height="4" fill={accent} />
          <rect x="0" y="6" width="360" height="8" fill={deep} />
          {Array.from({ length: 24 }).map((_, i) => (
            <rect key={i} x={i * 15 + 3} y="6" width="7" height="8" fill={accent} opacity="0.7" />
          ))}
          <rect x="0" y="16" width="360" height="4" fill={accent} />
        </svg>
      );
    case "chevron":
      return (
        <svg viewBox="0 0 360 22" className={cls} aria-hidden preserveAspectRatio="none">
          <g fill="none" stroke={deep} strokeWidth="2">
            <path d="M0 16 L15 5 L30 16 L45 5 L60 16 L75 5 L90 16 L105 5 L120 16 L135 5 L150 16 L165 5 L180 16 L195 5 L210 16 L225 5 L240 16 L255 5 L270 16 L285 5 L300 16 L315 5 L330 16 L345 5 L360 16" />
          </g>
          <g fill="none" stroke={accent} strokeWidth="1.2">
            <path d="M0 21 L15 10 L30 21 L45 10 L60 21 L75 10 L90 21 L105 10 L120 21 L135 10 L150 21 L165 10 L180 21 L195 10 L210 21 L225 10 L240 21 L255 10 L270 21 L285 10 L300 21 L315 10 L330 21 L345 10 L360 21" />
          </g>
        </svg>
      );
    case "medallion":
      return (
        <svg viewBox="0 0 360 34" className={cls} aria-hidden>
          <line x1="20" y1="17" x2="145" y2="17" stroke={accent} strokeWidth="0.8" />
          <line x1="215" y1="17" x2="340" y2="17" stroke={accent} strokeWidth="0.8" />
          <g transform="translate(180 17)" fill="none">
            <circle r="15" stroke={deep} strokeWidth="1" />
            <circle r="9" stroke={accent} strokeWidth="1" />
            <circle r="3.4" fill={accent} stroke="none" />
          </g>
        </svg>
      );
    case "diamond":
      return (
        <svg viewBox="0 0 360 24" className={cls} aria-hidden>
          <line x1="0" y1="12" x2="150" y2="12" stroke={accent} strokeWidth="0.8" />
          <line x1="210" y1="12" x2="360" y2="12" stroke={accent} strokeWidth="0.8" />
          <g transform="translate(180 12)">
            <path d="M0 -10 L10 0 L0 10 L-10 0 Z" fill="none" stroke={deep} strokeWidth="1.2" />
            <path d="M0 -4.5 L4.5 0 L0 4.5 L-4.5 0 Z" fill={accent} />
          </g>
          <path d="M158 12 l5 -5 l5 5 l-5 5 Z" fill={accent} opacity="0.8" />
          <path d="M192 12 l5 -5 l5 5 l-5 5 Z" fill={accent} opacity="0.8" />
        </svg>
      );
    case "zellige":
      return (
        <svg viewBox="0 0 360 26" className={cls} aria-hidden>
          {Array.from({ length: 9 }).map((_, i) => (
            <g key={i} transform={`translate(${40 * i + 20} 13)`}>
              <path
                d="M0 -10 L2.8 -2.8 L10 0 L2.8 2.8 L0 10 L-2.8 2.8 L-10 0 L-2.8 -2.8 Z"
                fill={i % 2 ? accent : "none"}
                stroke={deep}
                strokeWidth="1"
              />
            </g>
          ))}
          <line x1="0" y1="13" x2="360" y2="13" stroke={accent} strokeWidth="0.5" opacity="0.5" />
        </svg>
      );
    case "lattice":
      return (
        <svg viewBox="0 0 360 24" className={cls} aria-hidden preserveAspectRatio="none">
          <g stroke={deep} strokeWidth="1" fill="none">
            {Array.from({ length: 15 }).map((_, i) => (
              <rect key={i} x={24 * i + 6} y="4" width="11" height="11" transform={`rotate(45 ${24 * i + 11.5} 9.5)`} />
            ))}
          </g>
          <line x1="0" y1="21" x2="360" y2="21" stroke={accent} strokeWidth="1" />
        </svg>
      );
    case "arabesque":
      return (
        <svg viewBox="0 0 360 34" className={cls} aria-hidden>
          <g fill="none" stroke={accent} strokeWidth="1.1" strokeLinecap="round">
            <path d="M10 17 Q 55 -4 100 17 Q 145 38 180 17 Q 215 -4 260 17 Q 305 38 350 17" />
            <path d="M10 17 Q 55 38 100 17 Q 145 -4 180 17 Q 215 38 260 17 Q 305 -4 350 17" />
          </g>
          <circle cx="180" cy="17" r="3.4" fill={deep} />
          <circle cx="10" cy="17" r="2" fill={accent} />
          <circle cx="350" cy="17" r="2" fill={accent} />
        </svg>
      );
    case "girih":
      return (
        <svg viewBox="0 0 360 30" className={cls} aria-hidden>
          <line x1="0" y1="15" x2="128" y2="15" stroke={accent} strokeWidth="0.8" />
          <line x1="232" y1="15" x2="360" y2="15" stroke={accent} strokeWidth="0.8" />
          <g transform="translate(180 15)" fill="none" stroke={deep} strokeWidth="1.1">
            <path d="M0 -13 L12.4 -4 L7.6 10.5 L-7.6 10.5 L-12.4 -4 Z" />
            <path d="M0 -6 L5.7 -1.9 L3.5 4.9 L-3.5 4.9 L-5.7 -1.9 Z" />
          </g>
          <g fill={accent}>
            <circle cx="145" cy="15" r="2" />
            <circle cx="215" cy="15" r="2" />
          </g>
        </svg>
      );
    case "swash":
      return (
        <svg viewBox="0 0 360 30" className={cls} aria-hidden>
          <g fill="none" stroke={accent} strokeWidth="1" strokeLinecap="round">
            <path d="M40 18 Q 95 2 150 18 Q 180 27 210 18 Q 265 2 320 18" />
            <path d="M150 18 Q 180 12 210 18" opacity="0.6" />
          </g>
          <circle cx="180" cy="20.5" r="1.6" fill={accent} />
        </svg>
      );
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* Corner ornaments                                                    */
/* ------------------------------------------------------------------ */

export function CornerOrnaments({
  kind,
  accent,
  deep,
}: {
  kind: CornerKey;
  accent: string;
  deep: string;
}) {
  if (kind === "none") return null;
  const glyph = <CornerGlyph kind={kind} accent={accent} deep={deep} />;
  const base = "pointer-events-none absolute h-14 w-14 opacity-70";
  return (
    <>
      <div className={base + " left-0 top-0"}>{glyph}</div>
      <div className={base + " right-0 top-0 rotate-90"}>{glyph}</div>
      <div className={base + " bottom-0 right-0 rotate-180"}>{glyph}</div>
      <div className={base + " -rotate-90 bottom-0 left-0"}>{glyph}</div>
    </>
  );
}

function CornerGlyph({
  kind,
  accent,
  deep,
}: {
  kind: CornerKey;
  accent: string;
  deep: string;
}) {
  const s = { fill: "none", stroke: accent, strokeWidth: 1 } as const;
  switch (kind) {
    case "adinkra":
      return (
        <svg viewBox="0 0 56 56" className="h-full w-full" aria-hidden>
          <path d="M4 20 V4 H20" {...s} />
          <g transform="translate(16 16)" stroke={deep} strokeWidth="1.1" fill="none">
            <path d="M0 -7 V7 M-7 0 H7 M-5 -5 L5 5 M5 -5 L-5 5" />
          </g>
        </svg>
      );
    case "kente":
      return (
        <svg viewBox="0 0 56 56" className="h-full w-full" aria-hidden>
          <rect x="4" y="4" width="26" height="4" fill={accent} />
          <rect x="4" y="4" width="4" height="26" fill={accent} />
          <rect x="10" y="10" width="12" height="4" fill={deep} />
          <rect x="10" y="10" width="4" height="12" fill={deep} />
        </svg>
      );
    case "chevron":
      return (
        <svg viewBox="0 0 56 56" className="h-full w-full" aria-hidden>
          <g {...s} stroke={deep}>
            <path d="M4 22 L13 12 L22 22" />
            <path d="M4 32 L13 22 L22 32" />
          </g>
          <path d="M4 8 H30" stroke={accent} strokeWidth="1.4" />
        </svg>
      );
    case "ring":
      return (
        <svg viewBox="0 0 56 56" className="h-full w-full" aria-hidden>
          <circle cx="16" cy="16" r="11" {...s} />
          <circle cx="16" cy="16" r="5.5" stroke={deep} strokeWidth="1" fill="none" />
        </svg>
      );
    case "diamond":
      return (
        <svg viewBox="0 0 56 56" className="h-full w-full" aria-hidden>
          <path d="M16 4 L28 16 L16 28 L4 16 Z" {...s} />
          <path d="M16 11 L21 16 L16 21 L11 16 Z" fill={accent} />
        </svg>
      );
    case "zellige":
      return (
        <svg viewBox="0 0 56 56" className="h-full w-full" aria-hidden>
          <path
            d="M18 4 L21 13 L30 16 L21 19 L18 28 L15 19 L6 16 L15 13 Z"
            fill="none"
            stroke={deep}
            strokeWidth="1"
          />
          <path d="M4 34 H8 M34 4 V8" stroke={accent} strokeWidth="1.2" />
        </svg>
      );
    case "lattice":
      return (
        <svg viewBox="0 0 56 56" className="h-full w-full" aria-hidden>
          <g {...s} stroke={deep}>
            <rect x="6" y="6" width="12" height="12" transform="rotate(45 12 12)" />
            <rect x="20" y="6" width="8" height="8" transform="rotate(45 24 10)" />
            <rect x="6" y="20" width="8" height="8" transform="rotate(45 10 24)" />
          </g>
        </svg>
      );
    case "vine":
      return (
        <svg viewBox="0 0 56 56" className="h-full w-full" aria-hidden>
          <path d="M4 30 Q 4 4 30 4" {...s} />
          <path d="M10 22 Q 16 16 22 10" {...s} strokeWidth="0.8" />
          <circle cx="30" cy="4" r="2" fill={accent} />
          <circle cx="4" cy="30" r="2" fill={accent} />
          <path d="M12 12 q 6 -6 2 -8 q -8 2 -2 8" fill={deep} opacity="0.5" />
        </svg>
      );
    case "girih":
      return (
        <svg viewBox="0 0 56 56" className="h-full w-full" aria-hidden>
          <path d="M4 4 H26 L16 16 Z" fill="none" stroke={deep} strokeWidth="1" />
          <path d="M4 4 V26 L16 16 Z" fill="none" stroke={accent} strokeWidth="1" />
        </svg>
      );
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* Textile band                                                        */
/* ------------------------------------------------------------------ */

export function OrnamentBand({
  css,
  className,
  height = 10,
}: {
  css?: string | null;
  className?: string;
  height?: number;
}) {
  if (!css) return null;
  return (
    <div
      aria-hidden
      className={"w-full " + (className ?? "")}
      style={{ background: css, height }}
    />
  );
}
