interface Props {
  first: string;
  second: string;
  className?: string;
}

/**
 * Monogramme entrelacé généré dynamiquement pour n'importe quelle paire
 * d'initiales : serif italique à fort contraste, lettres imbriquées de
 * tailles différentes, tracé en contour fin + volute calligraphique.
 */
export function RoyalMonogram({ first, second, className }: Props) {
  const a = (first || "").charAt(0).toUpperCase();
  const b = (second || "").charAt(0).toUpperCase();

  return (
    <svg
      viewBox="0 0 200 170"
      className={className}
      role="img"
      aria-label={`Monogramme ${a}${b}`}
    >
      {/* volute calligraphique qui unifie les deux lettres */}
      <path
        d="M26 128c14 20 44 20 62 4 20-18 24-52 46-64 18-10 38-2 40 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M22 126c-10-14 2-30 18-26 12 3 16 16 10 26"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.7"
      />

      <g
        fill="none"
        stroke="currentColor"
        fontFamily="'Playfair Display', 'Cormorant Garamond', ui-serif, Georgia, serif"
        fontStyle="italic"
        fontWeight={500}
        textAnchor="middle"
        dominantBaseline="alphabetic"
      >
        {/* lettre dominante */}
        <text
          x="82"
          y="126"
          fontSize="132"
          strokeWidth="1.4"
          paintOrder="stroke"
        >
          {a}
        </text>
        {/* seconde lettre, imbriquée et légèrement plus petite */}
        <text
          x="126"
          y="126"
          fontSize="108"
          strokeWidth="1.2"
          opacity="0.95"
        >
          {b}
        </text>
      </g>
    </svg>
  );
}

export default RoyalMonogram;
