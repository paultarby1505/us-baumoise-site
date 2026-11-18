// Lecture des pages publiques de Mon Club House (site officiel de la FFR).
//
// Les pages sont rendues par Next.js : les données (classement, calendrier,
// feuille de match) sont incluses dans la page HTML, dans les morceaux
// `self.__next_f.push([1, "..."])`. On recolle ces morceaux puis on extrait
// les objets JSON qui nous intéressent.
//
// Ce n'est pas une API officielle : si la FFR change son site, ce fichier
// est le seul à adapter.

export const MONCLUBHOUSE = "https://monclubhouse.ffr.fr";

const USER_AGENT =
  "Mozilla/5.0 (compatible; USBaumoiseSite/1.0; +https://usbaumoise.fr)";

export async function lirePage(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "text/html" } });
  if (!res.ok) throw new Error(`Mon Club House a répondu ${res.status} pour ${url}`);
  return extrairePayload(await res.text());
}

export function extrairePayload(html: string): string {
  const re = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
  let payload = "";
  for (const m of html.matchAll(re)) payload += JSON.parse(`"${m[1]}"`);
  return payload;
}

// Renvoie la valeur JSON (objet ou tableau) qui commence à `debut`.
function lireValeurJson(texte: string, debut: number): unknown {
  const ouvrant = texte[debut];
  const fermant = ouvrant === "{" ? "}" : ouvrant === "[" ? "]" : null;
  if (!fermant) return undefined;
  let profondeur = 0;
  let dansChaine = false;
  for (let i = debut; i < texte.length; i++) {
    const c = texte[i];
    if (dansChaine) {
      if (c === "\\") i++;
      else if (c === '"') dansChaine = false;
      continue;
    }
    if (c === '"') dansChaine = true;
    else if (c === "{" || c === "[") profondeur++;
    else if (c === "}" || c === "]") {
      profondeur--;
      if (profondeur === 0) return JSON.parse(texte.slice(debut, i + 1));
    }
  }
  return undefined;
}

// Valeur de la première clé `"cle":` trouvée dans la page.
export function valeurApresCle(payload: string, cle: string): unknown {
  const marqueur = `"${cle}":`;
  const i = payload.indexOf(marqueur);
  if (i === -1) return undefined;
  return lireValeurJson(payload, i + marqueur.length);
}

// --- Classement -----------------------------------------------------------

export type LigneClassementFfr = {
  position: number;
  equipe: string; // nom affiché (« Us Baumoise Ob »)
  identifiant: string; // identifiant stable FFR (« us-baumoise-ob »)
  points: number;
  joues: number;
  gagnes: number;
  nuls: number;
  perdus: number;
  pointsMarques: number;
  pointsEncaisses: number;
};

type RankingBrut = {
  position: number;
  classementId: {
    pointTerrain: number | null;
    joues: number | null;
    gagnes: number | null;
    nuls: number | null;
    perdus: number | null;
    pointsDeMarqueAcquis: number | null;
    pointsDeMarqueConcedes: number | null;
  };
  competitionEquipeId: { nomEdito: string | null; nom: string; identifiant: string };
};

export function lireClassement(payload: string): LigneClassementFfr[] {
  const brut = valeurApresCle(payload, "rankingData");
  if (!Array.isArray(brut)) throw new Error("Classement introuvable sur la page FFR");
  return (brut as RankingBrut[])
    .filter((e) => e.competitionEquipeId?.identifiant && e.competitionEquipeId.identifiant !== "exempt")
    .map((e) => ({
      position: e.position,
      equipe: (e.competitionEquipeId.nomEdito || e.competitionEquipeId.nom).trim(),
      identifiant: e.competitionEquipeId.identifiant,
      points: e.classementId.pointTerrain ?? 0,
      joues: e.classementId.joues ?? 0,
      gagnes: e.classementId.gagnes ?? 0,
      nuls: e.classementId.nuls ?? 0,
      perdus: e.classementId.perdus ?? 0,
      pointsMarques: e.classementId.pointsDeMarqueAcquis ?? 0,
      pointsEncaisses: e.classementId.pointsDeMarqueConcedes ?? 0,
    }));
}

// --- Calendrier & résultats -----------------------------------------------

export type RencontreFfr = {
  id: number;
  date: string; // ISO UTC
  url: string;
  termine: boolean;
  competition: string;
  journee: string | null;
  locale: { id: number; nom: string };
  visiteuse: { id: number; nom: string };
  scoreLocale: number | null;
  scoreVisiteuse: number | null;
};

type RencontreBrute = {
  id: number;
  dateEffective: string;
  url_monclubhouse: string;
  etatMixte: string | null;
  competitionJourId?: { nom: string | null } | null;
  competitionId?: { nom: string | null } | null;
  competitionEquipeLocaleId: { id: number; nom: string; nomEdito: string | null } | null;
  competitionEquipeVisiteuseId: { id: number; nom: string; nomEdito: string | null } | null;
  rencontreResultatLocaleId: { pointsDeMarque: number | null } | null;
  rencontreResultatVisiteuseId: { pointsDeMarque: number | null } | null;
};

export function lireCalendrier(payload: string): RencontreFfr[] {
  const brut = valeurApresCle(payload, "calendarResultsData");
  if (!brut || typeof brut !== "object") throw new Error("Calendrier introuvable sur la page FFR");
  const rencontres: RencontreFfr[] = [];
  for (const jour of Object.values(brut as Record<string, { listData?: RencontreBrute[] }>)) {
    for (const r of jour.listData ?? []) {
      if (!r.competitionEquipeLocaleId || !r.competitionEquipeVisiteuseId) continue;
      const exempt = [r.competitionEquipeLocaleId, r.competitionEquipeVisiteuseId].some(
        (e) => normaliser(e.nomEdito || e.nom) === "exempt"
      );
      // Journée sans match (« Exempt ») : rien à afficher sur le site.
      if (exempt) continue;
      const etat = (r.etatMixte ?? "").toLowerCase();
      rencontres.push({
        id: r.id,
        date: heureFfrVersUtc(r.dateEffective),
        url: MONCLUBHOUSE + r.url_monclubhouse,
        termine: etat.startsWith("termin"),
        competition: r.competitionId?.nom ?? "",
        journee: r.competitionJourId?.nom ?? null,
        locale: {
          id: r.competitionEquipeLocaleId.id,
          nom: (r.competitionEquipeLocaleId.nomEdito || r.competitionEquipeLocaleId.nom).trim(),
        },
        visiteuse: {
          id: r.competitionEquipeVisiteuseId.id,
          nom: (r.competitionEquipeVisiteuseId.nomEdito || r.competitionEquipeVisiteuseId.nom).trim(),
        },
        scoreLocale: r.rencontreResultatLocaleId?.pointsDeMarque ?? null,
        scoreVisiteuse: r.rencontreResultatVisiteuseId?.pointsDeMarque ?? null,
      });
    }
  }
  return rencontres;
}

// --- Feuille de match ------------------------------------------------------

export type TypeEvenement =
  | "essai"
  | "essai_penalite"
  | "transformation"
  | "penalite"
  | "drop"
  | "carton_blanc"
  | "carton_jaune"
  | "carton_rouge"
  | "remplacement";

export type PersonneFfr = { prenom: string; nom: string };

export type EvenementFfr = {
  type: TypeEvenement;
  minute: number | null;
  equipeId: number;
  joueur: PersonneFfr | null; // pour un remplacement : le joueur qui ENTRE
  joueurSortant: PersonneFfr | null;
};

type ActionBrute = {
  minutes: number | null;
  type: string;
  sousType: string | null;
  competitionEquipeId: number | null;
  joueur1Id: { personneId?: { nom: string; prenom: string } | null } | null;
  joueur2Id: { personneId?: { nom: string; prenom: string } | null } | null;
};

function personne(j: ActionBrute["joueur1Id"]): PersonneFfr | null {
  const p = j?.personneId;
  if (!p) return null;
  return { prenom: p.prenom ?? "", nom: p.nom ?? "" };
}

function typeEvenement(a: ActionBrute): TypeEvenement | null {
  switch (a.type) {
    case "TRY":
      return "essai";
    case "PENALTYTRY":
    case "PENALTY_TRY":
      return "essai_penalite";
    case "GOALAFTERTRY":
      return "transformation";
    case "GOALPENALTY":
      return "penalite";
    case "DROPGOAL":
    case "DROP_GOAL":
    case "GOALDROP":
      return "drop";
    case "REPLACEMENT":
      return "remplacement";
    case "CARD": {
      const s = (a.sousType ?? "").toUpperCase();
      if (s === "YELLOW") return "carton_jaune";
      if (s === "RED") return "carton_rouge";
      if (s === "WHITE") return "carton_blanc";
      return null;
    }
    default:
      return null;
  }
}

export type FeuilleFfr = {
  id: number;
  equipeLocaleId: number;
  equipeVisiteuseId: number;
  scoreLocale: number | null;
  scoreVisiteuse: number | null;
  majFfr: string | null;
  evenements: EvenementFfr[];
};

type FeuilleBrute = {
  data: {
    updatedAt: string | null;
    competitionEquipeLocaleId: number | { id: number } | null;
    competitionEquipeVisiteuseId: number | { id: number } | null;
    rencontreResultatLocaleFdmd?: number | null;
    rencontreResultatVisiteuseFdmd?: number | null;
    rencontreResultatLocaleId?: { pointsDeMarque: number | null } | null;
    rencontreResultatVisiteuseId?: { pointsDeMarque: number | null } | null;
    Actions?: ActionBrute[];
  };
};

const idEquipe = (v: number | { id: number } | null | undefined): number =>
  typeof v === "number" ? v : (v?.id ?? -1);

export function lireFeuilleDeMatch(payload: string, matchId: number): FeuilleFfr {
  // La page contient plusieurs objets pour ce match (en-tête, feuille...) :
  // on prend celui qui porte la liste des actions.
  const marqueur = `{"data":{"id":${matchId},`;
  let brut: FeuilleBrute | null = null;
  for (let i = payload.indexOf(marqueur); i !== -1; i = payload.indexOf(marqueur, i + 1)) {
    const candidat = lireValeurJson(payload, i) as FeuilleBrute | undefined;
    if (!candidat?.data) continue;
    if (!brut) brut = candidat;
    if (Array.isArray(candidat.data.Actions)) {
      brut = candidat;
      break;
    }
  }
  if (!brut) throw new Error(`Feuille du match ${matchId} introuvable sur la page FFR`);
  const d = brut.data;
  const evenements: EvenementFfr[] = [];
  for (const a of d.Actions ?? []) {
    const type = typeEvenement(a);
    if (!type || a.competitionEquipeId == null) continue;
    // Pour un remplacement, la FFR met le joueur qui sort en premier et
    // celui qui entre en second.
    const remplacement = type === "remplacement";
    evenements.push({
      type,
      minute: a.minutes,
      equipeId: a.competitionEquipeId,
      joueur: remplacement ? personne(a.joueur2Id) : personne(a.joueur1Id),
      joueurSortant: remplacement ? personne(a.joueur1Id) : null,
    });
  }
  return {
    id: matchId,
    equipeLocaleId: idEquipe(d.competitionEquipeLocaleId),
    equipeVisiteuseId: idEquipe(d.competitionEquipeVisiteuseId),
    scoreLocale: d.rencontreResultatLocaleId?.pointsDeMarque ?? d.rencontreResultatLocaleFdmd ?? null,
    scoreVisiteuse:
      d.rencontreResultatVisiteuseId?.pointsDeMarque ?? d.rencontreResultatVisiteuseFdmd ?? null,
    majFfr: d.updatedAt,
    evenements,
  };
}

// La FFR enregistre l'heure locale du match (heure de Paris) avec un « Z »
// final trompeur : « 2026-09-20T15:00:00.000Z » = coup d'envoi à 15 h à Paris.
export function heureFfrVersUtc(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso);
  if (!m) return iso;
  const [, an, mois, jour, h, min] = m.map(Number);
  const supposeUtc = Date.UTC(an, mois - 1, jour, h, min);
  const decalage = (instant: number) => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Paris",
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(new Date(instant));
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
    return (
      (Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute")) - instant) /
      60_000
    );
  };
  let utc = supposeUtc - decalage(supposeUtc) * 60_000;
  utc = supposeUtc - decalage(utc) * 60_000;
  return new Date(utc).toISOString();
}

// --- Noms --------------------------------------------------------------------

export function normaliser(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// « JEAN-PIERRE » -> « Jean-Pierre »
export function capitaliser(value: string): string {
  return value
    .toLowerCase()
    .replace(/(^|[\s'-])(\p{L})/gu, (_m, sep: string, l: string) => sep + l.toUpperCase());
}

export function memeEquipe(a: string, b: string): boolean {
  const x = normaliser(a);
  const y = normaliser(b);
  if (!x || !y) return false;
  return x === y || (x.length > 3 && y.includes(x)) || (y.length > 3 && x.includes(y));
}

// Ressemblance entre deux noms d'équipe (0 à 1), en comptant les mots
// en commun : « RC Vallée de l'ouche » ~ « RC Vallee Ouche Csb ».
export function ressemblanceEquipe(a: string, b: string): number {
  const vides = new Set(["de", "du", "des", "la", "le", "les", "l", "d", "et", "rc", "us", "as", "fc", "sc", "cs"]);
  const mots = (s: string) => normaliser(s).split(" ").filter((m) => m.length > 1 && !vides.has(m));
  const ma = mots(a);
  const mb = new Set(mots(b));
  if (ma.length === 0 || mb.size === 0) return 0;
  // Mots identiques, ou même début (« Auxonnais » ~ « Auxonne »).
  const proche = (m: string) =>
    mb.has(m) || [...mb].some((n) => m.length >= 5 && n.length >= 5 && m.slice(0, 5) === n.slice(0, 5));
  const communs = ma.filter(proche).length;
  return communs / Math.min(ma.length, mb.size);
}
