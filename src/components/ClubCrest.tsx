export default function ClubCrest({
  className,
  size = 56,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 240 280"
      width={size}
      height={(size * 280) / 240}
      className={className}
      role="img"
      aria-label="Blason US Baumoise Rugby"
    >
      {/* Bordure argent */}
      <path
        d="M50,14 L190,14 Q214,14 214,40 L214,130 Q214,210 120,268 Q26,210 26,130 L26,40 Q26,14 50,14 Z"
        fill="#9aa0aa"
      />
      {/* Corps noir avec liseré or */}
      <path
        d="M58,26 L182,26 Q202,26 202,48 L202,128 Q202,198 120,250 Q38,198 38,128 L38,48 Q38,26 58,26 Z"
        fill="#0b0b0b"
        stroke="#d4a72c"
        strokeWidth="4"
      />

      {/* Texte */}
      <text
        x="120"
        y="50"
        textAnchor="middle"
        fill="#f5f5f0"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="15"
        letterSpacing="3"
      >
        US
      </text>
      <text
        x="120"
        y="75"
        textAnchor="middle"
        fill="#f5f5f0"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="25"
        letterSpacing="1"
      >
        BAUMOISE
      </text>
      <text
        x="120"
        y="92"
        textAnchor="middle"
        fill="#d4a72c"
        fontFamily="Arial, sans-serif"
        fontWeight="600"
        fontSize="11"
        letterSpacing="5"
      >
        RUGBY
      </text>

      {/* Tête de lynx stylisée */}
      <g fill="#d4a72c">
        <polygon points="88,138 70,78 103,128" />
        <polygon points="72,82 66,62 78,86" />
        <polygon points="152,138 170,78 137,128" />
        <polygon points="168,82 174,62 162,86" />
        <polygon points="103,128 137,128 150,150 145,175 120,192 95,175 90,150" />
      </g>
      <ellipse cx="107" cy="149" rx="4.5" ry="3.5" fill="#0b0b0b" />
      <ellipse cx="133" cy="149" rx="4.5" ry="3.5" fill="#0b0b0b" />
      <polygon points="120,159 115,166 125,166" fill="#0b0b0b" />

      <text
        x="120"
        y="234"
        textAnchor="middle"
        fill="#f5f5f0"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="14"
        letterSpacing="3"
      >
        1995
      </text>
    </svg>
  );
}
