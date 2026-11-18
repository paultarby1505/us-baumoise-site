"use client";

import { useMemo, useState, useTransition } from "react";
import { analyserFeuilleDeMatch, enregistrerFeuilleDeMatch } from "@/app/admin/feuille-actions";
import { pointsClassement } from "@/lib/classement";
import {
  EVENEMENT_TYPES,
  MENTION_NON_ENREGISTRE,
  evenementInfo,
  nomJoueur,
  pointsDesEvenements,
  trouverJoueur,
} from "@/lib/match-evenements";
import type { ClassementLigne, Joueur, MatchEvenementType } from "@/lib/types";

export type EvenementEdition = {
  key: string;
  type: MatchEvenementType;
  minute: number | null;
  joueur_id: string | null;
  joueur_nom: string | null;
  joueur_sortant_id: string | null;
  joueur_sortant_nom: string | null;
};

type ClassementInitial = {
  actif: boolean;
  usId: string | null;
  advId: string | null;
  pointsUs: number | null;
  pointsAdv: number | null;
  avertissement: string | null;
};

const AUTRE = "__autre__";

function nouvelleCle() {
  return Math.random().toString(36).slice(2);
}

function JoueurPicker({
  label,
  joueurs,
  joueurId,
  joueurNom,
  onChange,
}: {
  label: string;
  joueurs: Joueur[];
  joueurId: string | null;
  joueurNom: string | null;
  onChange: (id: string | null, nom: string | null) => void;
}) {
  const valeur = joueurId ?? (joueurNom ? AUTRE : "");
  const [autre, setAutre] = useState(valeur === AUTRE);
  const affichageAutre = autre || valeur === AUTRE;

  return (
    <div className="min-w-0 flex-1">
      <label className="block text-[11px] font-semibold uppercase text-foreground/50">
        {label}
      </label>
      <select
        value={affichageAutre ? AUTRE : valeur}
        onChange={(e) => {
          const v = e.target.value;
          if (v === AUTRE) {
            setAutre(true);
            onChange(null, joueurNom);
          } else {
            setAutre(false);
            const joueur = joueurs.find((j) => j.id === v);
            onChange(v || null, joueur ? nomJoueur(joueur) : null);
          }
        }}
        className="mt-1 w-full rounded border border-black/20 px-2 py-1.5 text-sm"
      >
        <option value="">— Choisir —</option>
        {joueurs.map((j) => (
          <option key={j.id} value={j.id}>
            {nomJoueur(j)}
            {j.numero != null ? ` (n°${j.numero})` : ""} · {j.categorie}
          </option>
        ))}
        <option value={AUTRE}>Autre joueur, pas dans l&apos;effectif {MENTION_NON_ENREGISTRE}</option>
      </select>
      {affichageAutre && (
        <div className="mt-1 flex items-center gap-1">
          <input
            type="text"
            value={joueurNom ?? ""}
            onChange={(e) => onChange(null, e.target.value)}
            placeholder="Prénom Nom"
            className="w-full rounded border border-black/20 px-2 py-1.5 text-sm"
          />
          <span className="shrink-0 text-xs font-semibold text-club-gold">
            {MENTION_NON_ENREGISTRE}
          </span>
        </div>
      )}
    </div>
  );
}

export default function FeuilleDeMatchEditor({
  matchId,
  adversaire,
  joueurs,
  initialScoreUs,
  initialScoreAdverse,
  initialEvenements,
  lignesClassement,
  classementInitial,
  classementPossible,
  iaActive,
}: {
  matchId: string;
  adversaire: string;
  joueurs: Joueur[];
  initialScoreUs: number | null;
  initialScoreAdverse: number | null;
  initialEvenements: EvenementEdition[];
  lignesClassement: ClassementLigne[];
  classementInitial: ClassementInitial;
  classementPossible: string | null;
  iaActive: boolean;
}) {
  const [texte, setTexte] = useState("");
  const [analyseEnCours, startAnalyse] = useTransition();
  const [analyseErreur, setAnalyseErreur] = useState<string | null>(null);
  const [remarques, setRemarques] = useState<string | null>(null);

  const [scoreUs, setScoreUs] = useState<string>(initialScoreUs?.toString() ?? "");
  const [scoreAdv, setScoreAdv] = useState<string>(initialScoreAdverse?.toString() ?? "");
  const [evenements, setEvenements] = useState<EvenementEdition[]>(initialEvenements);

  const [classementActif, setClassementActif] = useState(classementInitial.actif);
  const [advId, setAdvId] = useState(classementInitial.advId ?? "");
  const [pointsUsManuel, setPointsUsManuel] = useState<string | null>(
    classementInitial.pointsUs?.toString() ?? null
  );
  const [pointsAdvManuel, setPointsAdvManuel] = useState<string | null>(
    classementInitial.pointsAdv?.toString() ?? null
  );

  const us = scoreUs === "" ? null : Number(scoreUs);
  const adv = scoreAdv === "" ? null : Number(scoreAdv);
  const scoreComplet = us != null && adv != null && !Number.isNaN(us) && !Number.isNaN(adv);
  const pointsUsAuto = scoreComplet ? pointsClassement(us, adv) : null;
  const pointsAdvAuto = scoreComplet ? pointsClassement(adv, us) : null;
  const pointsUs = pointsUsManuel ?? pointsUsAuto?.toString() ?? "";
  const pointsAdv = pointsAdvManuel ?? pointsAdvAuto?.toString() ?? "";

  const pointsDetail = pointsDesEvenements(evenements);
  const aDesPoints = evenements.some((e) => evenementInfo(e.type).points > 0);

  const evenementsJson = useMemo(
    () =>
      JSON.stringify(
        evenements.map((e) => ({
          type: e.type,
          minute: e.minute,
          joueur_id: e.joueur_id,
          joueur_nom: e.joueur_nom,
          joueur_sortant_id: e.joueur_sortant_id,
          joueur_sortant_nom: e.joueur_sortant_nom,
        }))
      ),
    [evenements]
  );

  function majEvenement(key: string, patch: Partial<EvenementEdition>) {
    setEvenements((list) => list.map((e) => (e.key === key ? { ...e, ...patch } : e)));
  }

  function lancerAnalyse() {
    setAnalyseErreur(null);
    startAnalyse(async () => {
      const resultat = await analyserFeuilleDeMatch(matchId, texte);
      if (!resultat.ok) {
        setAnalyseErreur(resultat.error);
        return;
      }
      const { feuille } = resultat;
      if (feuille.score_us != null) setScoreUs(String(feuille.score_us));
      if (feuille.score_adverse != null) setScoreAdv(String(feuille.score_adverse));
      setPointsUsManuel(null);
      setPointsAdvManuel(null);
      setRemarques(feuille.remarques);
      setEvenements(
        feuille.evenements.map((e) => {
          // Filet de sécurité : si l'IA n'a pas relié le joueur mais que le
          // nom correspond exactement à un seul joueur de l'effectif.
          const joueur =
            !e.joueur_id && e.joueur_nom ? trouverJoueur(e.joueur_nom, joueurs) : null;
          const sortant =
            !e.joueur_sortant_id && e.joueur_sortant_nom
              ? trouverJoueur(e.joueur_sortant_nom, joueurs)
              : null;
          return {
            key: nouvelleCle(),
            type: e.type,
            minute: e.minute,
            joueur_id: e.joueur_id ?? joueur?.id ?? null,
            joueur_nom: joueur ? nomJoueur(joueur) : e.joueur_nom,
            joueur_sortant_id: e.joueur_sortant_id ?? sortant?.id ?? null,
            joueur_sortant_nom: sortant ? nomJoueur(sortant) : e.joueur_sortant_nom,
          };
        })
      );
    });
  }

  return (
    <div className="space-y-8">
      {/* 1. L'agent IA */}
      <section className="rounded-lg border-2 border-club-gold/60 bg-white p-4">
        <h2 className="text-lg font-bold">✨ Assistant IA</h2>
        <p className="mt-1 text-sm text-foreground/60">
          À la fin du match, raconte-le en quelques mots (ou dicte-le avec le micro du
          téléphone). L&apos;assistant remplit le score, les marqueurs, les cartons et les
          changements ci-dessous. Tu relis, tu corriges si besoin, puis tu enregistres.
        </p>
        <textarea
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          rows={5}
          placeholder={`Ex : Victoire 27-12 contre ${adversaire}. Essais de Dupont (x2, 12e et 55e) et Martin. Durand passe 3 transfos et 2 pénalités. Carton jaune pour Petit à la 30e. Lefebvre remplace Martin à la 60e.`}
          className="mt-3 w-full rounded border border-black/20 px-3 py-2 text-sm"
          disabled={!iaActive}
        />
        {!iaActive && (
          <p className="mt-2 rounded bg-amber-50 px-3 py-2 text-xs text-amber-800">
            L&apos;assistant IA n&apos;est pas encore activé sur le site (clé ANTHROPIC_API_KEY à
            ajouter dans Vercel). Tu peux quand même remplir la feuille à la main ci-dessous.
          </p>
        )}
        {analyseErreur && (
          <p className="mt-2 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{analyseErreur}</p>
        )}
        {remarques && (
          <p className="mt-2 rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
            À vérifier : {remarques}
          </p>
        )}
        <button
          type="button"
          onClick={lancerAnalyse}
          disabled={!iaActive || analyseEnCours || !texte.trim()}
          className="mt-3 rounded bg-club-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {analyseEnCours ? "Analyse en cours…" : "Remplir la feuille avec l'IA"}
        </button>
      </section>

      <form action={enregistrerFeuilleDeMatch.bind(null, matchId)} className="space-y-8">
        <input type="hidden" name="evenements" value={evenementsJson} />

        {/* 2. Le score */}
        <section>
          <h2 className="text-lg font-bold">Score final</h2>
          <div className="mt-3 flex items-end gap-3">
            <div>
              <label className="block text-xs font-semibold">US Baumoise</label>
              <input
                type="number"
                name="score_us"
                min={0}
                value={scoreUs}
                onChange={(e) => {
                  setScoreUs(e.target.value);
                  setPointsUsManuel(null);
                  setPointsAdvManuel(null);
                }}
                className="mt-1 w-24 rounded border border-black/20 px-3 py-2"
              />
            </div>
            <span className="pb-2 font-bold">–</span>
            <div>
              <label className="block text-xs font-semibold">{adversaire}</label>
              <input
                type="number"
                name="score_adverse"
                min={0}
                value={scoreAdv}
                onChange={(e) => {
                  setScoreAdv(e.target.value);
                  setPointsUsManuel(null);
                  setPointsAdvManuel(null);
                }}
                className="mt-1 w-24 rounded border border-black/20 px-3 py-2"
              />
            </div>
          </div>
          {aDesPoints && us != null && pointsDetail !== us && (
            <p className="mt-2 text-xs text-amber-700">
              Les points du détail ci-dessous font {pointsDetail}, le score indique {us}. Vérifie
              qu&apos;il ne manque rien.
            </p>
          )}
        </section>

        {/* 3. Le détail */}
        <section>
          <h2 className="text-lg font-bold">Détail du match</h2>
          <p className="mt-1 text-xs text-foreground/50">
            Marqueurs, cartons et changements de l&apos;US Baumoise. Un joueur qui n&apos;est pas
            dans l&apos;effectif du site s&apos;affiche avec {MENTION_NON_ENREGISTRE} après son nom.
          </p>
          <div className="mt-3 space-y-3">
            {evenements.length === 0 && (
              <p className="text-sm text-foreground/60">Aucun événement pour le moment.</p>
            )}
            {evenements.map((e) => (
              <div
                key={e.key}
                className="flex flex-wrap items-end gap-2 rounded-lg border border-black/10 bg-white p-3"
              >
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-foreground/50">
                    Type
                  </label>
                  <select
                    value={e.type}
                    onChange={(ev) => {
                      const type = ev.target.value as MatchEvenementType;
                      majEvenement(e.key, {
                        type,
                        ...(type === "remplacement"
                          ? {}
                          : { joueur_sortant_id: null, joueur_sortant_nom: null }),
                      });
                    }}
                    className="mt-1 rounded border border-black/20 px-2 py-1.5 text-sm"
                  >
                    {EVENEMENT_TYPES.map((t) => (
                      <option key={t.type} value={t.type}>
                        {t.icone} {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-foreground/50">
                    Minute
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={e.minute ?? ""}
                    onChange={(ev) =>
                      majEvenement(e.key, {
                        minute: ev.target.value === "" ? null : Number(ev.target.value),
                      })
                    }
                    className="mt-1 w-16 rounded border border-black/20 px-2 py-1.5 text-sm"
                  />
                </div>
                {e.type !== "essai_penalite" && (
                  <JoueurPicker
                    label={e.type === "remplacement" ? "Entre" : "Joueur"}
                    joueurs={joueurs}
                    joueurId={e.joueur_id}
                    joueurNom={e.joueur_nom}
                    onChange={(id, nom) => majEvenement(e.key, { joueur_id: id, joueur_nom: nom })}
                  />
                )}
                {e.type === "remplacement" && (
                  <JoueurPicker
                    label="Sort"
                    joueurs={joueurs}
                    joueurId={e.joueur_sortant_id}
                    joueurNom={e.joueur_sortant_nom}
                    onChange={(id, nom) =>
                      majEvenement(e.key, { joueur_sortant_id: id, joueur_sortant_nom: nom })
                    }
                  />
                )}
                <button
                  type="button"
                  onClick={() => setEvenements((list) => list.filter((x) => x.key !== e.key))}
                  className="pb-1.5 text-sm text-red-600 hover:underline"
                >
                  Retirer
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              setEvenements((list) => [
                ...list,
                {
                  key: nouvelleCle(),
                  type: "essai",
                  minute: null,
                  joueur_id: null,
                  joueur_nom: null,
                  joueur_sortant_id: null,
                  joueur_sortant_nom: null,
                },
              ])
            }
            className="mt-3 text-sm font-semibold text-club-gold hover:underline"
          >
            + Ajouter un événement
          </button>
        </section>

        {/* 4. Le classement */}
        <section>
          <h2 className="text-lg font-bold">Classement</h2>
          {classementPossible ? (
            <p className="mt-2 text-sm text-foreground/60">{classementPossible}</p>
          ) : (
            <div className="mt-3 space-y-3 rounded-lg border border-black/10 bg-white p-4">
              <input type="hidden" name="classement_us_id" value={classementInitial.usId ?? ""} />
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  name="classement_actif"
                  checked={classementActif}
                  onChange={(e) => setClassementActif(e.target.checked)}
                />
                Mettre à jour le classement avec ce résultat
              </label>
              {classementInitial.avertissement && (
                <p className="rounded bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  {classementInitial.avertissement}
                </p>
              )}
              {classementActif && (
                <>
                  <div>
                    <label className="block text-xs font-semibold">
                      Ligne de l&apos;adversaire dans le classement
                    </label>
                    <select
                      name="classement_adv_id"
                      value={advId}
                      onChange={(e) => setAdvId(e.target.value)}
                      className="mt-1 w-full rounded border border-black/20 px-3 py-2 text-sm"
                    >
                      <option value="">— Ne pas modifier la ligne de l&apos;adversaire —</option>
                      {lignesClassement
                        .filter((l) => !l.notre_club)
                        .map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.equipe}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <label className="block text-xs font-semibold">Points pour nous</label>
                      <input
                        type="number"
                        name="points_us"
                        min={0}
                        value={pointsUs}
                        onChange={(e) => setPointsUsManuel(e.target.value)}
                        className="mt-1 w-20 rounded border border-black/20 px-3 py-2"
                      />
                    </div>
                    {advId && (
                      <div>
                        <label className="block text-xs font-semibold">
                          Points pour l&apos;adversaire
                        </label>
                        <input
                          type="number"
                          name="points_adv"
                          min={0}
                          value={pointsAdv}
                          onChange={(e) => setPointsAdvManuel(e.target.value)}
                          className="mt-1 w-20 rounded border border-black/20 px-3 py-2"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-foreground/50">
                    Calcul automatique : victoire 4 pts, nul 2, défaite 0, +1 bonus offensif si on
                    gagne de 15 points ou plus, +1 bonus défensif si on perd de 7 points ou moins.
                    Corrige les points si la fédération a compté autrement. Joués, gagnés,
                    points marqués et encaissés se mettent à jour tout seuls, et une correction
                    du score ne compte jamais le match deux fois.
                  </p>
                </>
              )}
            </div>
          )}
        </section>

        <button
          type="submit"
          className="rounded bg-club-gold px-4 py-2 font-semibold text-black hover:bg-club-gold-light"
        >
          Enregistrer la feuille de match
        </button>
      </form>
    </div>
  );
}
