import Image from "next/image";

// Un club en rassemblement peut aligner trois logos dans une colonne qui ne
// fait qu'un tiers d'écran de téléphone. Plutôt que de les laisser déborder
// (ou passer à la ligne les uns sous les autres, ce qui décalait le nom de
// l'équipe), on réduit leur taille à mesure qu'ils sont nombreux. Au-delà de
// `sm`, la place ne manque plus et ils reprennent leur taille normale.
const TAILLES: Record<number, string> = {
  1: "h-12 w-12",
  2: "h-10 w-10",
};

export default function MatchLogos({
  logos,
  alt,
  className = "",
}: {
  logos: string[];
  alt: string;
  className?: string;
}) {
  if (logos.length === 0) return null;
  const taille = TAILLES[logos.length] ?? "h-8 w-8";
  return (
    <span className={`flex max-w-full items-center justify-center gap-1 ${className}`}>
      {logos.map((url) => (
        <Image
          key={url}
          src={url}
          alt={alt}
          width={64}
          height={64}
          className={`${taille} shrink-0 object-contain sm:h-16 sm:w-16`}
        />
      ))}
    </span>
  );
}
