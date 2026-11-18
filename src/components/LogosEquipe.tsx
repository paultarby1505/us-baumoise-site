import Image from "next/image";

// Initiales affichées quand aucun logo n'est connu : « RC Vesoul » -> « RV ».
function initiales(nom: string): string {
  const mots = nom
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^A-Za-z0-9]+/)
    .filter((m) => m.length > 0 && !/^(de|du|des|la|le|les|l|d|et)$/i.test(m));
  return mots
    .slice(0, 2)
    .map((m) => m[0].toUpperCase())
    .join("");
}

// Pastille(s) de logo pour une ligne de classement. Une entente a un logo
// par club : ils se chevauchent légèrement pour garder la colonne étroite.
export default function LogosEquipe({
  logos,
  nom,
  taille = 24,
}: {
  logos: string[];
  nom: string;
  taille?: number;
}) {
  const style = { width: taille, height: taille };
  if (logos.length === 0) {
    return (
      <span
        aria-hidden
        style={{ ...style, fontSize: Math.round(taille * 0.38) }}
        className="flex shrink-0 items-center justify-center rounded-full border border-black/10 bg-black/5 font-bold text-foreground/50"
      >
        {initiales(nom)}
      </span>
    );
  }
  return (
    <span className="flex shrink-0 items-center">
      {logos.slice(0, 3).map((url, i) => (
        <span
          key={url}
          style={{ ...style, marginLeft: i === 0 ? 0 : -Math.round(taille * 0.3) }}
          className="relative shrink-0 overflow-hidden rounded-full border border-black/10 bg-white"
        >
          <Image
            src={url}
            alt={i === 0 ? `Logo ${nom}` : ""}
            fill
            className="object-contain p-0.5"
            sizes={`${taille}px`}
          />
        </span>
      ))}
    </span>
  );
}
