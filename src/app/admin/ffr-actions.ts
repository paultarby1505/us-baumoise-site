"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getCurrentProfile } from "@/lib/auth";
import { str } from "@/lib/form-data";
import { MATCH_CATEGORIES } from "@/lib/rugby";

const PAGE = "/admin/synchro-ffr";
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://geefzxozzuvrqvuuvxkr.supabase.co";

function urlMonClubHouseValide(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname === "monclubhouse.ffr.fr" && u.pathname.includes("/competitions/");
  } catch {
    return false;
  }
}

export async function enregistrerSourceFfr(formData: FormData) {
  const categorie = str(formData, "categorie");
  const url = str(formData, "url");
  const equipe = str(formData, "equipe_ffr");
  if (!MATCH_CATEGORIES.includes(categorie as (typeof MATCH_CATEGORIES)[number])) {
    redirect(`${PAGE}?error=${encodeURIComponent("Catégorie inconnue.")}`);
  }
  if (!urlMonClubHouseValide(url)) {
    redirect(
      `${PAGE}?error=${encodeURIComponent(
        "L'adresse doit être une page de compétition de monclubhouse.ffr.fr (…/competitions/…)."
      )}`
    );
  }
  if (!equipe) {
    redirect(`${PAGE}?error=${encodeURIComponent("Indique le nom de notre équipe sur le site de la FFR.")}`);
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("ffr_sources").upsert(
    {
      categorie,
      url,
      equipe_ffr: equipe,
      actif: formData.get("actif") === "on",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "categorie" }
  );
  if (error) redirect(`${PAGE}?error=${encodeURIComponent(error.message)}`);
  redirect(`${PAGE}?success=${encodeURIComponent("Réglage enregistré.")}`);
}

export async function supprimerSourceFfr(categorie: string) {
  const supabase = await createServerSupabaseClient();
  await supabase.from("ffr_sources").delete().eq("categorie", categorie);
  redirect(PAGE);
}

// Lance tout de suite la synchronisation (sans attendre le passage
// automatique), avec la session de l'admin connecté.
export async function synchroniserMaintenant() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/admin/login");
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect("/admin/login");

  let message: string;
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/ffr-sync`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: "{}",
      cache: "no-store",
    });
    const body = (await res.json().catch(() => ({}))) as {
      bilans?: { categorie: string; erreurs: string[] }[];
      error?: string;
    };
    if (!res.ok) throw new Error(body.error || `Erreur ${res.status}`);
    const enErreur = (body.bilans ?? []).filter((b) => b.erreurs.length > 0);
    message = enErreur.length
      ? `Synchronisation faite, avec des erreurs pour : ${enErreur.map((b) => b.categorie).join(", ")}.`
      : "Synchronisation faite : scores, classements et feuilles de match sont à jour.";
  } catch (e) {
    redirect(
      `${PAGE}?error=${encodeURIComponent(
        `La synchronisation a échoué : ${e instanceof Error ? e.message : "erreur inconnue"}`
      )}`
    );
  }
  redirect(`${PAGE}?success=${encodeURIComponent(message)}`);
}
