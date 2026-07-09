import type { OrnamentKind } from "@/lib/rsvp-design";

/**
 * Small decorative ornaments used in the RSVP section header, keyed to the
 * theme identity. Kept tiny and inline SVG so they inherit color via
 * `currentColor` from a parent wrapper.
 */
export function RsvpOrnament({
  kind,
  color,
  className,
}: {
  kind: OrnamentKind;
  color: string;
  className?: string;
}) {
  const common = "mx-auto block " + (className ?? "h-6 w-32");

  switch (kind) {
    case "flourish":
      return (
        <svg viewBox="0 0 160 24" className={common} aria-hidden>
          <g stroke={color} strokeWidth="1" fill="none" strokeLinecap="round">
            <path d="M4 12 Q 40 4, 74 12 T 156 12" opacity="0.7" />
            <circle cx="80" cy="12" r="2.5" fill={color} />
          </g>
        </svg>
      );
    case "diamond":
      return (
        <svg viewBox="0 0 160 24" className={common} aria-hidden>
          <g stroke={color} strokeWidth="1" fill="none">
            <line x1="6" y1="12" x2="70" y2="12" opacity="0.6" />
            <line x1="90" y1="12" x2="154" y2="12" opacity="0.6" />
            <path d="M80 4 L 88 12 L 80 20 L 72 12 Z" fill={color} opacity="0.9" />
          </g>
        </svg>
      );
    case "dots":
      return (
        <svg viewBox="0 0 160 12" className={common} aria-hidden>
          <g fill={color}>
            {Array.from({ length: 15 }, (_, i) => (
              <circle key={i} cx={12 + i * 10} cy="6" r="1.4" opacity="0.7" />
            ))}
          </g>
        </svg>
      );
    case "stripes":
      return (
        <svg viewBox="0 0 160 8" className={common} aria-hidden>
          <rect x="0" y="0" width="160" height="1" fill={color} />
          <rect x="0" y="4" width="160" height="0.5" fill={color} opacity="0.6" />
          <rect x="0" y="7" width="160" height="1" fill={color} />
        </svg>
      );
    case "wax":
      return (
        <svg viewBox="0 0 160 20" className={common} aria-hidden>
          <g fill={color}>
            {Array.from({ length: 8 }, (_, i) => (
              <g key={i} transform={`translate(${8 + i * 20} 10)`}>
                <path d="M0,-6 L6,0 L0,6 L-6,0 Z" opacity="0.85" />
                <circle cx="10" cy="0" r="1.5" opacity="0.7" />
              </g>
            ))}
          </g>
        </svg>
      );
    case "kente":
      return (
        <svg viewBox="0 0 160 16" className={common} aria-hidden>
          <g>
            <rect x="0" y="1" width="160" height="2" fill={color} opacity="0.9" />
            <rect x="0" y="6" width="160" height="1" fill={color} opacity="0.5" />
            <rect x="0" y="10" width="160" height="2" fill={color} opacity="0.9" />
            {Array.from({ length: 20 }, (_, i) => (
              <rect
                key={i}
                x={i * 8}
                y="13"
                width="4"
                height="3"
                fill={color}
                opacity={i % 2 === 0 ? 0.9 : 0.4}
              />
            ))}
          </g>
        </svg>
      );
    case "arch":
      return (
        <svg viewBox="0 0 160 28" className={common} aria-hidden>
          <path
            d="M20 26 L20 14 Q 80 -4, 140 14 L140 26"
            fill="none"
            stroke={color}
            strokeWidth="1.2"
            opacity="0.85"
          />
          <circle cx="80" cy="8" r="2" fill={color} />
        </svg>
      );
    case "confetti":
      return (
        <svg viewBox="0 0 160 24" className={common} aria-hidden>
          <g fill={color}>
            {Array.from({ length: 18 }, (_, i) => {
              const x = 10 + i * 8;
              const y = ((i * 37) % 18) + 3;
              const rot = (i * 47) % 360;
              return (
                <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}>
                  {i % 3 === 0 ? (
                    <rect x="-2" y="-0.6" width="4" height="1.2" opacity="0.85" />
                  ) : i % 3 === 1 ? (
                    <circle r="1.1" opacity="0.85" />
                  ) : (
                    <path d="M0,-1.6 L1.4,1 L-1.4,1 Z" opacity="0.85" />
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      );
    case "watercolor":
      return (
        <svg viewBox="0 0 160 24" className={common} aria-hidden>
          <defs>
            <radialGradient id="rsvp-wc" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={color} stopOpacity="0.55" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="80" cy="12" rx="55" ry="9" fill="url(#rsvp-wc)" />
          <ellipse cx="50" cy="14" rx="18" ry="5" fill={color} opacity="0.25" />
          <ellipse cx="115" cy="10" rx="16" ry="4" fill={color} opacity="0.25" />
        </svg>
      );
    case "stamp":
      return (
        <svg viewBox="0 0 160 26" className={common} aria-hidden>
          <g stroke={color} strokeWidth="0.8" fill="none">
            <rect x="60" y="4" width="40" height="18" strokeDasharray="1.2 1.2" />
            <line x1="6" y1="13" x2="55" y2="13" opacity="0.6" />
            <line x1="105" y1="13" x2="154" y2="13" opacity="0.6" />
          </g>
          <text
            x="80"
            y="16"
            fill={color}
            fontSize="7"
            textAnchor="middle"
            style={{ fontFamily: '"Special Elite", monospace' }}
          >
            RSVP
          </text>
        </svg>
      );
    case "brutal":
      return (
        <svg viewBox="0 0 160 6" className={common} aria-hidden>
          <rect x="0" y="0" width="160" height="6" fill={color} />
        </svg>
      );
    case "leaf":
      return (
        <svg viewBox="0 0 160 24" className={common} aria-hidden>
          <g stroke={color} strokeWidth="1" fill="none" strokeLinecap="round">
            <path d="M20 12 Q 80 4, 140 12" opacity="0.7" />
            <g transform="translate(80 12)" fill={color} opacity="0.9">
              <path d="M-6,0 Q 0,-6 6,0 Q 0,6 -6,0 Z" />
            </g>
            <line x1="60" y1="12" x2="66" y2="8" opacity="0.6" />
            <line x1="94" y1="12" x2="100" y2="16" opacity="0.6" />
          </g>
        </svg>
      );
    default:
      return null;
  }
}
