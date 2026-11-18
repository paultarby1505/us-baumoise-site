import type { Joueur, MatchEvenement, MatchEvenementType } from "./types";

// Les types d'événements d'une feuille de match, dans l'ordre où on les
// propose dans le formulaire.
export const EVENEMENT_TYPES: {
  type: MatchEvenementType;
  label: string;
  icone: string;
  points: number;
}[] = [
  { type: "essai", label: "Essai", icone: "🏉", points: 5 },
  { type: "transformation", label: "Transformation", icone: "🎯", points: 2 },
  { type: "penalite", label: "Pénalité", icone: "🎯", points: 3 },
  { type: "drop", label: "Drop", icone: "🎯", points: 3 },
  { type: "essai_penalite", label: "Essai de pénalité", icone: "🏉", points: 7 },
  { type: "carton_blanc", label: "Carton blanc", icone: "⬜", points: 0 },
  { type: "carton_jaune", label: "Carton jaune", icone: "🟨", points: 0 },
  { type: "carton_rouge", label: "Carton rouge", icone: "🟥", points: 0 },
  { type: "remplacement", label: "Remplacement", icone: "🔄", points: 0 },
];

export const EVENEMENT_TYPE_VALUES = EVENEMENT_TYPES.map((e) => e.type) as [
  MatchEvenementType,
  ...MatchEvenementType[],
];

export function evenementInfo(type: MatchEvenementType) {
  return EVENEMENT_TYPES.find((e) => e.type === type) ?? EVENEMENT_TYPES[0];
}

// Mention ajoutée derrière le nom d'un joueur qui n'est pas dans
// l'effectif enregistré sur le site.
export const MENTION_NON_ENREGISTRE = "(OB)";

export function nomJoueur(joueur: Pick<Joueur, "prenom" | "nom">): string {
  return `${joueur.prenom} ${joueur.nom}`.trim();
}

// Nom à afficher : le nom du joueur de l'effectif s'il est relié, sinon le
// nom tel qu'il a été saisi, suivi de « (OB) ».
export function nomAffiche(
  joueurId: string | null,
  nomSaisi: string | null,
  joueursParId: Map<string, Joueur>
): string | null {
  if (joueurId) {
    const joueur = joueursParId.get(joueurId);
    if (joueur) return nomJoueur(joueur);
  }
  const nom = (nomSaisi ?? "").replace(/\s*\(OB\)\s*$/i, "").trim();
  if (!nom) return null;
  return `${nom} ${MENTION_NON_ENREGISTRE}`;
}

// Points marqués par notre équipe d'après les événements saisis : sert à
// vérifier que le score et le détail concordent.
export function pointsDesEvenements(evenements: Pick<MatchEvenement, "type">[]): number {
  return evenements.reduce((total, e) => total + evenementInfo(e.type).points, 0);
}

function normaliserNom(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Retrouve un joueur de l'effectif à partir d'un nom saisi librement
// (« Dupont », « Léo Dupont », « Dupont Léo »...). Ne renvoie un joueur que
// si un seul correspond, pour ne jamais attribuer un essai au mauvais.
export function trouverJoueur(nomSaisi: string, joueurs: Joueur[]): Joueur | null {
  const cible = normaliserNom(nomSaisi.replace(/\(OB\)/gi, ""));
  if (!cible) return null;

  const complets = joueurs.filter((j) => {
    const a = normaliserNom(`${j.prenom} ${j.nom}`);
    const b = normaliserNom(`${j.nom} ${j.prenom}`);
    return cible === a || cible === b;
  });
  if (complets.length === 1) return complets[0];
  if (complets.length > 1) return null;

  const parNom = joueurs.filter((j) => normaliserNom(j.nom) === cible);
  if (parNom.length === 1) return parNom[0];

  return null;
}
