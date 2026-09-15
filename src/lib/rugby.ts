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

export function posteRank(poste: string | null): number {
  if (!poste) return POSTES.length + 1;
  const index = POSTES.indexOf(poste as (typeof POSTES)[number]);
  return index === -1 ? POSTES.length : index;
}

export function categorySlug(categorie: string): string {
  return categorie.toLowerCase();
}

export function categoryFromSlug(slug: string): (typeof CATEGORIES)[number] | null {
  const normalized = slug.toLowerCase();
  return CATEGORIES.find((cat) => categorySlug(cat) === normalized) ?? null;
}

// Les 15 postes d'une compo de rugby, numérotés comme sur une feuille de
// match officielle (1 = pilier gauche ... 15 = arrière).
export const POSTE_SLOTS: { slot: number; label: string }[] = [
  { slot: 1, label: "Pilier gauche" },
  { slot: 2, label: "Talonneur" },
  { slot: 3, label: "Pilier droit" },
  { slot: 4, label: "Deuxième ligne" },
  { slot: 5, label: "Deuxième ligne" },
  { slot: 6, label: "3e ligne aile" },
  { slot: 7, label: "3e ligne aile" },
  { slot: 8, label: "3e ligne centre" },
  { slot: 9, label: "Demi de mêlée" },
  { slot: 10, label: "Demi d'ouverture" },
  { slot: 11, label: "Ailier" },
  { slot: 12, label: "Centre" },
  { slot: 13, label: "Centre" },
  { slot: 14, label: "Ailier" },
  { slot: 15, label: "Arrière" },
];

export function slotLabel(slot: number): string {
  return POSTE_SLOTS.find((p) => p.slot === slot)?.label ?? `Poste ${slot}`;
}

// Disposition visuelle d'une compo à XV : les avants en haut (près de la
// mêlée), les arrières en bas, pour former la silhouette classique d'une
// feuille de match.
export const COMPOSITION_ROWS: number[][] = [
  [1, 2, 3],
  [4, 5],
  [6, 8, 7],
  [9, 10],
  [11, 12, 13, 14],
  [15],
];

// Regroupements affichés en bulles sur l'accueil pour choisir le prochain
// match par catégorie. EDR (École De Rugby) rassemble les plus jeunes.
export const MATCH_FILTERS: { key: string; label: string; categories: string[] }[] = [
  { key: "seniors", label: "Seniors", categories: ["Seniors"] },
  { key: "u19", label: "U19", categories: ["U19"] },
  { key: "u16", label: "U16", categories: ["U16"] },
  { key: "u14", label: "U14", categories: ["U14"] },
  { key: "edr", label: "EDR", categories: ["Baby", "U6", "U8", "U10", "U12"] },
];
