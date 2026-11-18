import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getJoueurs } from "@/lib/queries";
import { categoryRank } from "@/lib/rugby";
import { trouverLigneAdversaire } from "@/lib/classement";
import { iaDisponible } from "@/lib/ia-feuille-de-match";
import FeuilleDeMatchEditor from "@/components/FeuilleDeMatchEditor";
import { formatParis } from "@/lib/date-fr";
import type { ClassementLigne, Match, MatchEvenement } from "@/lib/types";

export default async function FeuilleDeMatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { id } = await params;
  const { error, success } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("matchs").select("*").eq("id", id).maybeSingle();
  const match = data as Match | null;
  if (!match) notFound();

  const [allJoueurs, { data: evenementsData }, { data: lignesData }] = await Promise.all([
    getJoueurs(),
    supabase.from("match_evenements").select("*").eq("match_id", id).order("position"),
    supabase.from("classements").select("*").eq("categorie", match.categorie),
  ]);
  const evenements = (evenementsData ?? []) as MatchEvenement[];
  const lignes = ((lignesData ?? []) as ClassementLigne[]).sort((a, b) =>
    a.equipe.localeCompare(b.equipe, "fr")
  );

  // Joueurs de la catégorie du match en premier.
  const joueurs = [...allJoueurs].sort((a, b) => {
    const memeCategorie =
      (a.categorie === match.categorie ? 0 : 1) - (b.categorie === match.categorie ? 0 : 1);
    if (memeCategorie !== 0) return memeCategorie;
    const rang = categoryRank(a.categorie) - categoryRank(b.categorie);
    if (rang !== 0) return rang;
    return `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, "fr");
  });

  // Le classement ne peut être mis à jour que pour un match contre un seul
  // adversaire, dans une catégorie qui a un classement avec notre club.
  const notreLigne = lignes.find((l) => l.notre_club) ?? null;
  let classementPossible: string | null = null;
  if (!match.adversaire || match.adversaire2) {
    classementPossible =
      "Tournoi ou triangulaire : le classement n'est pas mis à jour automatiquement.";
  } else if (!notreLigne) {
    classementPossible = `Pas de classement ${match.categorie} avec notre club pour le moment (à créer dans Classements). Le score et le détail seront quand même enregistrés.`;
  }

  const applique = match.classement_applique;
  const adversaireDevine = trouverLigneAdversaire(match.adversaire, lignes);
  const resultatAncien = !applique && match.score_us != null && match.score_adverse != null;
  const classementInitial = {
    // Un résultat saisi avant l'automatisation est sûrement déjà compté :
    // on ne le recompte pas sans que l'admin le demande.
    actif: Boolean(applique) || !resultatAncien,
    usId: applique?.us_id ?? notreLigne?.id ?? null,
    advId: applique ? applique.adv_id : (adversaireDevine?.id ?? null),
    pointsUs: applique?.us.points_classement ?? null,
    pointsAdv: applique?.adv?.points_classement ?? null,
    avertissement: resultatAncien
      ? "Ce résultat a été saisi avant la mise à jour automatique : il est peut-être déjà compté dans le classement. Ne coche la case que si ce n'est pas le cas."
      : applique
        ? "Ce match est déjà compté : en enregistrant, l'ancien résultat est retiré du classement puis le nouveau est ajouté."
        : !adversaireDevine
          ? "L'adversaire n'a pas été retrouvé automatiquement dans le classement : choisis sa ligne ci-dessous."
          : null,
  };

  const titre = match.adversaire
    ? `US Baumoise – ${match.adversaire}`
    : match.nom_tournoi || `Tournoi ${match.categorie}`;

  return (
    <div className="max-w-2xl">
      <Link
        href={`/admin/matchs/${id}`}
        className="text-xs font-semibold uppercase tracking-wide text-club-gold hover:underline"
      >
        ← Retour au match
      </Link>
      <h1 className="mt-2 text-2xl font-extrabold">Feuille de match</h1>
      <p className="mt-1 text-sm text-foreground/60">
        {match.categorie} · {titre} · {formatParis(match.date_match, { day: "numeric", month: "long" })}
      </p>
      {error && <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      {success && (
        <p className="mt-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Feuille de match enregistrée. Le score, le détail et le classement sont à jour sur le
          site.
        </p>
      )}
      <div className="mt-6">
        <FeuilleDeMatchEditor
          matchId={id}
          adversaire={match.adversaire || "Adversaire"}
          joueurs={joueurs}
          initialScoreUs={match.score_us}
          initialScoreAdverse={match.score_adverse}
          initialEvenements={evenements.map((e) => ({
            key: e.id,
            type: e.type,
            minute: e.minute,
            joueur_id: e.joueur_id,
            joueur_nom: e.joueur_nom,
            joueur_sortant_id: e.joueur_sortant_id,
            joueur_sortant_nom: e.joueur_sortant_nom,
          }))}
          lignesClassement={lignes}
          classementInitial={classementInitial}
          classementPossible={classementPossible}
          iaActive={iaDisponible()}
        />
      </div>
    </div>
  );
}
