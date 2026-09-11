export const CATEGORIES = [
  "Baby",
  "U6",
  "U8",
  "U10",
  "U12",
  "U14",
  "U16",
  "U19",
  "Seniors",
] as const;

export const POSTES = [
  "Pilier",
  "Talonneur",
  "Deuxième ligne",
  "Troisième ligne aile",
  "Troisième ligne centre",
  "Demi de mêlée",
  "Demi d'ouverture",
  "Centre",
  "Ailier",
  "Arrière",
] as const;

export function categoryRank(categorie: string): number {
  const index = CATEGORIES.indexOf(categorie as (typeof CATEGORIES)[number]);
  return index === -1 ? CATEGORIES.length : index;
}
