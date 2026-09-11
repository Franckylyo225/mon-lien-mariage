interface Props {
  first: string;
  second: string;
  className?: string;
}

/**
 * Monogramme entrelacé : deux initiales calligraphiques (Pinyon Script,
 * fort contraste de graisse) qui se chevauchent au centre, tracées en
 * contour fin, unifiées par une volute intégrée au tracé.
 */
export function RoyalMonogram({ first, second, className }: Props) {
  const a = (first || "").charAt(0).toUpperCase();
  const b = (second || "").charAt(0).toUpperCase();

  const fontFamily = "'Pinyon Script', 'Cormorant Garamond', ui-serif, Georgia, serif";

  return (
    <svg
      viewBox="0 0 220 150"
      className={className}
      role="img"
      aria-label={`Monogramme ${a}${b}`}
    >
      {/* volute calligraphique unique qui relie les deux lettres */}
      <path
        d="M14 124c30 22 74 16 96-10 14-17 16-42 38-50 20-7 38 6 38 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.65"
      />


      <g
        fill="none"
        stroke="currentColor"
        fontFamily={fontFamily}
        textAnchor="middle"
        dominantBaseline="alphabetic"
      >
        {/* lettre dominante */}
        <text x="86" y="112" fontSize="128" strokeWidth="1.4">
          {a}
        </text>
        {/* seconde lettre, imbriquée dans la première */}
        <text x="138" y="118" fontSize="106" strokeWidth="1.2" opacity="0.95">
          {b}
        </text>
      </g>
    </svg>
  );
}

export default RoyalMonogram;
