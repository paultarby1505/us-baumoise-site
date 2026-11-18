import type { createServerSupabaseClient } from "./supabase-server";
import { appliquerDelta, deltaPourEquipe } from "./classement";
import type { ClassementApplique, ClassementDelta } from "./types";

type Supabase = Awaited<ReturnType<typeof createServerSupabaseClient>>;

async function modifierLigne(
  supabase: Supabase,
  id: string,
  delta: ClassementDelta,
  signe: 1 | -1
) {
  const { data: ligne, error } = await supabase
    .from("classements")
    .select("joues, gagnes, nuls, perdus, points_marques, points_encaisses, points_classement")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  // La ligne a pu être supprimée entre-temps : rien à corriger.
  if (!ligne) return;
  const { error: updateError } = await supabase
    .from("classements")
    .update(appliquerDelta(ligne as ClassementDelta, delta, signe))
    .eq("id", id);
  if (updateError) throw updateError;
}

// Remplace la contribution d'un match au classement : retire l'ancienne
// (si le match avait déjà été compté) puis ajoute la nouvelle. Ainsi une
// correction de score ne compte jamais le match deux fois.
export async function synchroniserClassement(
  supabase: Supabase,
  matchId: string,
  avant: ClassementApplique | null,
  apres: ClassementApplique | null
) {
  if (avant) {
    await modifierLigne(supabase, avant.us_id, avant.us, -1);
    if (avant.adv_id && avant.adv) await modifierLigne(supabase, avant.adv_id, avant.adv, -1);
  }
  if (apres) {
    await modifierLigne(supabase, apres.us_id, apres.us, 1);
    if (apres.adv_id && apres.adv) await modifierLigne(supabase, apres.adv_id, apres.adv, 1);
  }
  const { error } = await supabase
    .from("matchs")
    .update({ classement_applique: apres })
    .eq("id", matchId);
  if (error) throw error;
}

// Recalcule la contribution d'un match déjà compté après une correction
// du score depuis la fiche du match (mêmes lignes, barème par défaut).
export function recalculerContribution(
  avant: ClassementApplique,
  scoreUs: number,
  scoreAdverse: number
): ClassementApplique {
  return {
    us_id: avant.us_id,
    us: deltaPourEquipe(scoreUs, scoreAdverse),
    adv_id: avant.adv_id,
    adv: avant.adv_id ? deltaPourEquipe(scoreAdverse, scoreUs) : null,
  };
}
