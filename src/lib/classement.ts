import type { ClassementDelta, ClassementLigne } from "./types";

// Barème des points de classement. Les bonus sont calculés sur l'écart de
// points (on ne connaît pas les essais de l'adversaire) : ils restent
// modifiables à la main sur la feuille de match avant d'enregistrer.
export const BAREME = {
  victoire: 4,
  nul: 2,
  defaite: 0,
  // Bonus offensif : victoire avec au moins 15 points d'écart.
  bonusOffensifEcartMin: 15,
  // Bonus défensif : défaite de 7 points ou moins.
  bonusDefensifEcartMax: 7,
} as const;

export function pointsClassement(pour: number, contre: number): number {
  const ecart = pour - contre;
  if (ecart > 0) {
    return BAREME.victoire + (ecart >= BAREME.bonusOffensifEcartMin ? 1 : 0);
  }
  if (ecart === 0) return BAREME.nul;
  return BAREME.defaite + (-ecart <= BAREME.bonusDefensifEcartMax ? 1 : 0);
}

export function deltaPourEquipe(
  pour: number,
  contre: number,
  points: number = pointsClassement(pour, contre)
): ClassementDelta {
  return {
    joues: 1,
    gagnes: pour > contre ? 1 : 0,
    nuls: pour === contre ? 1 : 0,
    perdus: pour < contre ? 1 : 0,
    points_marques: pour,
    points_encaisses: contre,
    points_classement: points,
  };
}

const CHAMPS: (keyof ClassementDelta)[] = [
  "joues",
  "gagnes",
  "nuls",
  "perdus",
  "points_marques",
  "points_encaisses",
  "points_classement",
];

// Ajoute (signe = 1) ou retire (signe = -1) un match à une ligne de
// classement. Les compteurs ne descendent jamais sous zéro.
export function appliquerDelta(
  ligne: ClassementDelta,
  delta: ClassementDelta,
  signe: 1 | -1
): ClassementDelta {
  const resultat = { ...ligne };
  for (const champ of CHAMPS) {
    resultat[champ] = Math.max(0, (ligne[champ] ?? 0) + signe * (delta[champ] ?? 0));
  }
  return resultat;
}

function normaliserEquipe(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Retrouve la ligne de l'adversaire dans le classement de la catégorie,
// même si le nom est écrit un peu différemment dans le calendrier.
export function trouverLigneAdversaire(
  adversaire: string | null,
  lignes: ClassementLigne[]
): ClassementLigne | null {
  if (!adversaire) return null;
  const cible = normaliserEquipe(adversaire);
  if (!cible) return null;
  const candidates = lignes.filter((l) => !l.notre_club);

  const exacte = candidates.find((l) => normaliserEquipe(l.equipe) === cible);
  if (exacte) return exacte;

  const incluses = candidates.filter((l) => {
    const nom = normaliserEquipe(l.equipe);
    return nom.length > 2 && (nom.includes(cible) || cible.includes(nom));
  });
  return incluses.length === 1 ? incluses[0] : null;
}
