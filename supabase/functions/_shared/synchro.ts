// Synchronisation d'une catégorie du site avec Mon Club House (FFR) :
// classement officiel, calendrier et scores, et détail des matchs
// (marqueurs, cartons, remplacements) de notre équipe.

import {
  capitaliser,
  type EvenementFfr,
  lireCalendrier,
  lireClassement,
  lireFeuilleDeMatch,
  lirePage,
  normaliser,
  type PersonneFfr,
  ressemblanceEquipe,
  type RencontreFfr,
} from "./monclubhouse.ts";

// deno-lint-ignore no-explicit-any
type Supabase = any;

export type SourceFfr = {
  categorie: string;
  url: string;
  equipe_ffr: string;
};

type Joueur = { id: string; prenom: string; nom: string; categorie: string };

type MatchLocal = {
  id: string;
  categorie: string;
  adversaire: string | null;
  adversaire2: string | null;
  date_match: string;
  score_us: number | null;
  score_adverse: number | null;
  ffr_match_id: number | null;
  ffr_maj: string | null;
};

type LigneLocale = {
  id: string;
  equipe: string;
  notre_club: boolean;
  ffr_identifiant: string | null;
};

export type Bilan = {
  categorie: string;
  classement: number;
  matchsMisAJour: number;
  matchsCrees: number;
  feuilles: number;
  erreurs: string[];
};

// URL de la compétition sans l'onglet (« /classements », etc.)
export function urlDeBase(url: string): string {
  return url
    .trim()
    .replace(/[?#].*$/, "")
    .replace(/\/+$/, "")
    .replace(/\/(classements|calendrier-resultats|effectifs|informations|statistiques|videos)$/, "");
}

function jourParis(iso: string): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function ecartJours(a: string, b: string): number {
  return Math.abs(Date.parse(jourParis(a)) - Date.parse(jourParis(b))) / 86_400_000;
}

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

function estNous(nom: string, source: SourceFfr): boolean {
  return normaliser(nom) === normaliser(source.equipe_ffr);
}

// --- Joueurs ------------------------------------------------------------------

function trouverJoueur(p: PersonneFfr, joueurs: Joueur[], categorie: string): Joueur | null {
  const cible = normaliser(`${p.prenom} ${p.nom}`);
  const cibleInverse = normaliser(`${p.nom} ${p.prenom}`);
  const correspond = (j: Joueur) => {
    const n = normaliser(`${j.prenom} ${j.nom}`);
    return n === cible || n === cibleInverse;
  };
  const dansCategorie = joueurs.filter((j) => j.categorie === categorie && correspond(j));
  if (dansCategorie.length === 1) return dansCategorie[0];
  const partout = joueurs.filter(correspond);
  return partout.length === 1 ? partout[0] : null;
}

function nomPersonne(p: PersonneFfr): string {
  return `${capitaliser(p.prenom)} ${capitaliser(p.nom)}`.trim();
}

function versLigneEvenement(
  e: EvenementFfr,
  matchId: string,
  position: number,
  joueurs: Joueur[],
  categorie: string
) {
  const joueur = e.joueur ? trouverJoueur(e.joueur, joueurs, categorie) : null;
  const sortant = e.joueurSortant ? trouverJoueur(e.joueurSortant, joueurs, categorie) : null;
  return {
    match_id: matchId,
    position,
    type: e.type,
    minute: e.minute != null && e.minute >= 0 && e.minute <= 120 ? e.minute : null,
    joueur_id: joueur?.id ?? null,
    // Sans lien avec l'effectif, le site affichera « (OB) » après ce nom.
    joueur_nom: joueur ? `${joueur.prenom} ${joueur.nom}` : e.joueur ? nomPersonne(e.joueur) : null,
    joueur_sortant_id: sortant?.id ?? null,
    joueur_sortant_nom: sortant
      ? `${sortant.prenom} ${sortant.nom}`
      : e.joueurSortant
        ? nomPersonne(e.joueurSortant)
        : null,
  };
}

// --- Classement ---------------------------------------------------------------

async function synchroniserClassementFfr(
  supabase: Supabase,
  source: SourceFfr,
  base: string,
  // Noms d'adversaires utilisés sur notre site pour chaque équipe FFR
  // (appris en reliant les matchs) : « Rugby Club Auxonnais » = « Auxonne Gdr ».
  alias: Map<string, Set<string>>
) {
  const ffr = lireClassement(await lirePage(`${base}/classements`));
  if (ffr.length === 0) return 0;

  const { data, error } = await supabase
    .from("classements")
    .select("id, equipe, notre_club, ffr_identifiant")
    .eq("categorie", source.categorie);
  if (error) throw error;
  const locales = (data ?? []) as LigneLocale[];
  const utilisees = new Set<string>();

  for (const ligne of ffr) {
    const nous = estNous(ligne.equipe, source);
    let locale =
      locales.find((l) => !utilisees.has(l.id) && l.ffr_identifiant === ligne.identifiant) ??
      (nous ? locales.find((l) => !utilisees.has(l.id) && l.notre_club) : undefined);
    if (!locale && !nous) {
      const nomsConnus = alias.get(normaliser(ligne.equipe));
      if (nomsConnus) {
        locale = locales.find(
          (l) => !utilisees.has(l.id) && !l.notre_club && nomsConnus.has(normaliser(l.equipe))
        );
      }
    }
    if (!locale && !nous) {
      let meilleure: LigneLocale | undefined;
      let score = 0;
      for (const l of locales) {
        if (utilisees.has(l.id) || l.notre_club || l.ffr_identifiant) continue;
        const s = ressemblanceEquipe(l.equipe, ligne.equipe);
        if (s > score) {
          score = s;
          meilleure = l;
        }
      }
      if (score >= 0.5) locale = meilleure;
    }

    const valeurs = {
      joues: ligne.joues,
      gagnes: ligne.gagnes,
      nuls: ligne.nuls,
      perdus: ligne.perdus,
      points_marques: ligne.pointsMarques,
      points_encaisses: ligne.pointsEncaisses,
      points_classement: ligne.points,
      ffr_identifiant: ligne.identifiant,
    };
    if (locale) {
      utilisees.add(locale.id);
      const { error: e } = await supabase.from("classements").update(valeurs).eq("id", locale.id);
      if (e) throw e;
    } else {
      const { error: e } = await supabase.from("classements").insert({
        categorie: source.categorie,
        equipe: ligne.equipe,
        notre_club: nous,
        ...valeurs,
      });
      if (e) throw e;
    }
  }

  // Les équipes qui ne sont pas (ou plus) dans la poule officielle.
  const aRetirer = locales.filter((l) => !utilisees.has(l.id)).map((l) => l.id);
  if (aRetirer.length > 0) {
    await supabase.from("classements").delete().in("id", aRetirer);
  }

  // Le classement vient désormais de la FFR : les ajouts faits à la main
  // par la feuille de match ne doivent plus être retirés plus tard.
  await supabase
    .from("matchs")
    .update({ classement_applique: null })
    .eq("categorie", source.categorie)
    .not("classement_applique", "is", null);

  return ffr.length;
}

// --- Matchs -------------------------------------------------------------------

function trouverMatchLocal(r: RencontreFfr, adversaire: string, matchs: MatchLocal[]) {
  const parId = matchs.find((m) => m.ffr_match_id === r.id);
  if (parId) return parId;
  const candidats = matchs.filter(
    (m) => m.ffr_match_id == null && !m.adversaire2 && ecartJours(m.date_match, r.date) <= 1
  );
  const parNom = candidats.filter(
    (m) => m.adversaire && ressemblanceEquipe(m.adversaire, adversaire) >= 0.5
  );
  if (parNom.length === 1) return parNom[0];
  const memeJour = candidats.filter((m) => ecartJours(m.date_match, r.date) === 0);
  return memeJour.length === 1 ? memeJour[0] : null;
}

export async function synchroniserCategorie(
  supabase: Supabase,
  source: SourceFfr,
  options: { detailsDepuisJours?: number } = {}
): Promise<Bilan> {
  const bilan: Bilan = {
    categorie: source.categorie,
    classement: 0,
    matchsMisAJour: 0,
    matchsCrees: 0,
    feuilles: 0,
    erreurs: [],
  };
  const base = urlDeBase(source.url);

  const alias = new Map<string, Set<string>>();
  const synchroClassement = async () => {
    try {
      bilan.classement = await synchroniserClassementFfr(supabase, source, base, alias);
    } catch (e) {
      bilan.erreurs.push(`Classement : ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  let rencontres: RencontreFfr[] = [];
  try {
    rencontres = lireCalendrier(await lirePage(`${base}/calendrier-resultats`)).filter(
      (r) => estNous(r.locale.nom, source) || estNous(r.visiteuse.nom, source)
    );
  } catch (e) {
    bilan.erreurs.push(`Calendrier : ${e instanceof Error ? e.message : String(e)}`);
    await synchroClassement();
    return bilan;
  }

  const [{ data: matchsData, error: matchsError }, { data: joueursData }] = await Promise.all([
    supabase
      .from("matchs")
      .select(
        "id, categorie, adversaire, adversaire2, date_match, score_us, score_adverse, ffr_match_id, ffr_maj"
      )
      .eq("categorie", source.categorie),
    supabase.from("joueurs").select("id, prenom, nom, categorie"),
  ]);
  if (matchsError) {
    bilan.erreurs.push(`Matchs : ${matchsError.message}`);
    await synchroClassement();
    return bilan;
  }
  const matchs = (matchsData ?? []) as MatchLocal[];
  const joueurs = (joueursData ?? []) as Joueur[];
  const detailsDepuis = Date.now() - (options.detailsDepuisJours ?? 21) * 86_400_000;

  for (const r of rencontres) {
    const domicile = estNous(r.locale.nom, source);
    const adversaire = domicile ? r.visiteuse.nom : r.locale.nom;
    const notreEquipeId = domicile ? r.locale.id : r.visiteuse.id;
    const scoreUs = domicile ? r.scoreLocale : r.scoreVisiteuse;
    const scoreAdv = domicile ? r.scoreVisiteuse : r.scoreLocale;
    const resultat = r.termine && scoreUs != null && scoreAdv != null;

    try {
      let local = trouverMatchLocal(r, adversaire, matchs);
      if (local?.adversaire) {
        const cle = normaliser(adversaire);
        if (!alias.has(cle)) alias.set(cle, new Set());
        alias.get(cle)!.add(normaliser(local.adversaire));
      }
      if (!local) {
        // Match présent sur le site de la FFR mais pas encore sur le nôtre.
        const { data: cree, error } = await supabase
          .from("matchs")
          .insert({
            adversaire,
            domicile,
            date_match: r.date,
            competition: [r.competition, r.journee].filter(Boolean).join(" · ") || null,
            categorie: source.categorie,
            score_us: resultat ? scoreUs : null,
            score_adverse: resultat ? scoreAdv : null,
            ffr_match_id: r.id,
          })
          .select(
            "id, categorie, adversaire, adversaire2, date_match, score_us, score_adverse, ffr_match_id, ffr_maj"
          )
          .single();
        if (error) throw error;
        local = cree as MatchLocal;
        matchs.push(local);
        bilan.matchsCrees++;
      } else {
        const maj: Record<string, unknown> = {};
        if (local.ffr_match_id !== r.id) maj.ffr_match_id = r.id;
        if (Date.parse(local.date_match) !== Date.parse(r.date)) maj.date_match = r.date;
        if (resultat && (local.score_us !== scoreUs || local.score_adverse !== scoreAdv)) {
          maj.score_us = scoreUs;
          maj.score_adverse = scoreAdv;
        }
        if (Object.keys(maj).length > 0) {
          const { error } = await supabase.from("matchs").update(maj).eq("id", local.id);
          if (error) throw error;
          Object.assign(local, maj);
          bilan.matchsMisAJour++;
        }
      }

      // Détail du match : seulement les matchs terminés récents ou jamais lus.
      if (!r.termine) continue;
      if (local.ffr_maj && Date.parse(r.date) < detailsDepuis) continue;
      await pause(400);
      const feuille = lireFeuilleDeMatch(await lirePage(r.url), r.id);
      if (feuille.majFfr && feuille.majFfr === local.ffr_maj) continue;
      const nosEvenements = feuille.evenements.filter((e) => e.equipeId === notreEquipeId);
      if (nosEvenements.length > 0) {
        await supabase.from("match_evenements").delete().eq("match_id", local.id);
        const { error } = await supabase
          .from("match_evenements")
          .insert(
            nosEvenements.map((e, i) => versLigneEvenement(e, local!.id, i, joueurs, source.categorie))
          );
        if (error) throw error;
        bilan.feuilles++;
      }
      await supabase.from("matchs").update({ ffr_maj: feuille.majFfr }).eq("id", local.id);
      local.ffr_maj = feuille.majFfr;
    } catch (e) {
      bilan.erreurs.push(
        `Match du ${jourParis(r.date)} contre ${adversaire} : ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  await synchroClassement();
  return bilan;
}
