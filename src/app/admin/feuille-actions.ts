"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getCurrentProfile } from "@/lib/auth";
import { intOrNull, str } from "@/lib/form-data";
import { deltaPourEquipe } from "@/lib/classement";
import { synchroniserClassement } from "@/lib/classement-server";
import { EVENEMENT_TYPE_VALUES } from "@/lib/match-evenements";
import {
  analyserCompteRendu,
  FeuilleIaError,
  iaDisponible,
  type FeuilleExtraite,
} from "@/lib/ia-feuille-de-match";
import { sendAutoNotification } from "@/lib/push-server";
import type { ClassementApplique, Joueur, Match, MatchEvenementType } from "@/lib/types";

export type AnalyseResultat =
  | { ok: true; feuille: FeuilleExtraite }
  | { ok: false; error: string };

// L'agent IA : lit le compte rendu et propose une feuille de match, que
// l'admin relit avant d'enregistrer.
export async function analyserFeuilleDeMatch(
  matchId: string,
  texte: string
): Promise<AnalyseResultat> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Connecte-toi pour utiliser l'assistant." };
  if (!iaDisponible()) {
    return {
      ok: false,
      error:
        "L'assistant IA n'est pas encore activé : il faut ajouter la clé ANTHROPIC_API_KEY dans les réglages Vercel du site.",
    };
  }
  const compteRendu = texte.trim();
  if (!compteRendu) return { ok: false, error: "Écris d'abord le compte rendu du match." };
  if (compteRendu.length > 8000) {
    return { ok: false, error: "Le compte rendu est trop long (8 000 caractères maximum)." };
  }

  const supabase = await createServerSupabaseClient();
  const [{ data: match }, { data: joueurs }, { data: composition }] = await Promise.all([
    supabase.from("matchs").select("*").eq("id", matchId).maybeSingle(),
    supabase.from("joueurs").select("*"),
    supabase.from("match_compositions").select("slot, joueur_id").eq("match_id", matchId),
  ]);
  if (!match) return { ok: false, error: "Match introuvable." };

  try {
    const feuille = await analyserCompteRendu({
      texte: compteRendu,
      match: match as Match,
      joueurs: (joueurs ?? []) as Joueur[],
      composition: composition ?? [],
    });
    return { ok: true, feuille };
  } catch (e) {
    console.error("Échec de l'analyse IA de la feuille de match", e);
    return {
      ok: false,
      error:
        e instanceof FeuilleIaError
          ? e.message
          : "L'assistant IA n'a pas répondu. Réessaie dans un instant ou remplis la feuille à la main.",
    };
  }
}

type EvenementSaisi = {
  type: MatchEvenementType;
  minute: number | null;
  joueur_id: string | null;
  joueur_nom: string | null;
  joueur_sortant_id: string | null;
  joueur_sortant_nom: string | null;
};

function lireEvenements(raw: string): EvenementSaisi[] | null {
  let parsed: unknown;
  try {
    parsed = raw ? JSON.parse(raw) : [];
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;
  const texte = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
  return parsed
    .filter(
      (e): e is Record<string, unknown> =>
        e !== null &&
        typeof e === "object" &&
        EVENEMENT_TYPE_VALUES.includes((e as { type: MatchEvenementType }).type)
    )
    .map((e) => {
      const type = e.type as MatchEvenementType;
      const minute =
        typeof e.minute === "number" && Number.isInteger(e.minute) && e.minute >= 0 && e.minute <= 120
          ? e.minute
          : null;
      return {
        type,
        minute,
        joueur_id: texte(e.joueur_id),
        joueur_nom: texte(e.joueur_nom),
        joueur_sortant_id: type === "remplacement" ? texte(e.joueur_sortant_id) : null,
        joueur_sortant_nom: type === "remplacement" ? texte(e.joueur_sortant_nom) : null,
      };
    })
    // Un événement sans joueur n'a de sens que pour un essai de pénalité.
    .filter((e) => e.type === "essai_penalite" || e.joueur_id || e.joueur_nom);
}

export async function enregistrerFeuilleDeMatch(matchId: string, formData: FormData) {
  const page = `/admin/matchs/${matchId}/resultat`;
  const erreur = (message: string) => redirect(`${page}?error=${encodeURIComponent(message)}`);

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("matchs").select("*").eq("id", matchId).maybeSingle();
  const match = data as Match | null;
  if (!match) erreur("Match introuvable.");

  const scoreUs = intOrNull(formData, "score_us");
  const scoreAdverse = intOrNull(formData, "score_adverse");
  const evenements = lireEvenements(str(formData, "evenements"));
  if (evenements === null) erreur("Détails du match illisibles, recharge la page.");

  // 1. Le score
  const { error: scoreError } = await supabase
    .from("matchs")
    .update({ score_us: scoreUs, score_adverse: scoreAdverse })
    .eq("id", matchId);
  if (scoreError) erreur(scoreError.message);

  // 2. Le détail du match (on remplace tout)
  await supabase.from("match_evenements").delete().eq("match_id", matchId);
  if (evenements && evenements.length > 0) {
    const { error } = await supabase
      .from("match_evenements")
      .insert(evenements.map((e, position) => ({ ...e, match_id: matchId, position })));
    if (error) erreur(error.message);
  }

  // 3. Le classement
  let apres: ClassementApplique | null = null;
  const usId = str(formData, "classement_us_id");
  if (formData.get("classement_actif") === "on" && usId && scoreUs != null && scoreAdverse != null) {
    const advId = str(formData, "classement_adv_id") || null;
    apres = {
      us_id: usId,
      us: deltaPourEquipe(
        scoreUs,
        scoreAdverse,
        intOrNull(formData, "points_us") ?? undefined
      ),
      adv_id: advId,
      adv: advId
        ? deltaPourEquipe(scoreAdverse, scoreUs, intOrNull(formData, "points_adv") ?? undefined)
        : null,
    };
  }
  try {
    await synchroniserClassement(supabase, matchId, match!.classement_applique, apres);
  } catch (e) {
    erreur(e instanceof Error ? e.message : "Échec de la mise à jour du classement");
  }

  // 4. Notification, seulement à la toute première saisie du résultat.
  const premierResultat =
    match!.score_us == null && match!.score_adverse == null && scoreUs != null && scoreAdverse != null;
  if (premierResultat) {
    try {
      await sendAutoNotification("resultat", {
        adversaire: match!.adversaire || "l'adversaire",
        score_us: String(scoreUs),
        score_adverse: String(scoreAdverse),
      });
    } catch (e) {
      console.error("Échec de la notification automatique (résultat de match)", e);
    }
  }

  redirect(`${page}?success=1`);
}
