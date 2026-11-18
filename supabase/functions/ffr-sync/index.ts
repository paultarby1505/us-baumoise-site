// Fonction Supabase appelée automatiquement (pg_cron) et depuis l'admin
// (« Synchroniser maintenant ») : met à jour scores, classements et
// feuilles de match à partir de Mon Club House (FFR).

import { createClient } from "npm:@supabase/supabase-js@2";
import { synchroniserCategorie, type SourceFfr } from "../_shared/synchro.ts";

const DELAI_MINIMUM_MINUTES = 10;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  // Un membre de l'équipe du site peut forcer une synchronisation ;
  // sinon (appel planifié), on ne relance pas si la dernière est trop récente.
  let force = false;
  const jeton = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (jeton) {
    const { data } = await supabase.auth.getUser(jeton);
    if (data.user) {
      const { data: profil } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();
      force = Boolean(profil);
    }
  }

  const { data: sourcesData, error } = await supabase
    .from("ffr_sources")
    .select("categorie, url, equipe_ffr, derniere_synchro")
    .eq("actif", true);
  if (error) return json({ error: error.message }, 500);
  const sources = (sourcesData ?? []) as (SourceFfr & { derniere_synchro: string | null })[];

  if (!force) {
    const recente = sources.some(
      (s) =>
        s.derniere_synchro &&
        Date.now() - Date.parse(s.derniere_synchro) < DELAI_MINIMUM_MINUTES * 60_000
    );
    if (recente) return json({ ignore: "Synchronisation déjà faite il y a moins de 10 minutes." });
  }

  const bilans = [];
  for (const source of sources) {
    const bilan = await synchroniserCategorie(supabase, source);
    bilans.push(bilan);
    const statut =
      bilan.erreurs.length > 0
        ? `Erreurs : ${bilan.erreurs.join(" | ")}`
        : `OK : classement ${bilan.classement} équipes, ${bilan.matchsMisAJour} match(s) mis à jour, ${bilan.matchsCrees} créé(s), ${bilan.feuilles} feuille(s) de match.`;
    await supabase
      .from("ffr_sources")
      .update({ derniere_synchro: new Date().toISOString(), dernier_statut: statut.slice(0, 2000) })
      .eq("categorie", source.categorie);
  }

  return json({ bilans });
});
