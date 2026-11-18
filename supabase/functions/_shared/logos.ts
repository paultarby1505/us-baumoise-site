// Base des logos des équipes (table equipes_ffr) : on recopie dans notre
// stockage les logos publiés par Mon Club House, pour ne pas dépendre de
// leurs adresses et ne pas charger leurs serveurs à chaque visite du site.

import type { LigneClassementFfr } from "./monclubhouse.ts";

// deno-lint-ignore no-explicit-any
type Supabase = any;

const BUCKET = "classements-logos";
const TAILLE_MAX = 2 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

type EquipeLocale = { identifiant: string; nom: string; logos: string[]; logos_source: string[] };

// Les logos FFR ont une adresse unique par image (…/assets/<uuid>) : une
// image déjà copiée n'a jamais besoin de l'être à nouveau.
async function copierLogo(supabase: Supabase, source: string): Promise<string> {
  const cle = source.split("/").pop()!.replace(/[^a-zA-Z0-9-]/g, "");
  const res = await fetch(source);
  if (!res.ok) throw new Error(`logo ${source} : ${res.status}`);
  const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
  const ext = EXTENSIONS[type];
  if (!ext) throw new Error(`logo ${source} : format ${type} non géré`);
  const contenu = new Uint8Array(await res.arrayBuffer());
  if (contenu.byteLength > TAILLE_MAX) throw new Error(`logo ${source} trop lourd`);
  const chemin = `ffr/${cle}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(chemin, contenu, { contentType: type, upsert: true, cacheControl: "31536000" });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(chemin).data.publicUrl;
}

// Met à jour la base pour les équipes du classement et renvoie, pour chaque
// identifiant FFR, les logos à afficher (vide si la FFR n'en a pas).
export async function enregistrerLogos(
  supabase: Supabase,
  lignes: LigneClassementFfr[],
  erreurs: string[]
): Promise<Map<string, string[]>> {
  const resultat = new Map<string, string[]>();
  if (lignes.length === 0) return resultat;
  const { data, error } = await supabase
    .from("equipes_ffr")
    .select("identifiant, nom, logos, logos_source")
    .in("identifiant", lignes.map((l) => l.identifiant));
  if (error) {
    erreurs.push(`Logos : ${error.message}`);
    return resultat;
  }
  const connues = new Map(((data ?? []) as EquipeLocale[]).map((e) => [e.identifiant, e]));

  for (const ligne of lignes) {
    const connue = connues.get(ligne.identifiant);
    const inchange =
      connue &&
      connue.nom === ligne.equipe &&
      connue.logos_source.join("|") === ligne.logos.join("|") &&
      connue.logos.length === ligne.logos.length;
    if (inchange) {
      resultat.set(ligne.identifiant, connue.logos);
      continue;
    }
    try {
      const logos: string[] = [];
      for (const source of ligne.logos) {
        const deja = connue?.logos_source.indexOf(source) ?? -1;
        logos.push(
          deja >= 0 && connue!.logos[deja] ? connue!.logos[deja] : await copierLogo(supabase, source)
        );
      }
      const { error: e } = await supabase.from("equipes_ffr").upsert({
        identifiant: ligne.identifiant,
        nom: ligne.equipe,
        logos,
        logos_source: ligne.logos,
        updated_at: new Date().toISOString(),
      });
      if (e) throw e;
      resultat.set(ligne.identifiant, logos);
    } catch (e) {
      erreurs.push(`Logo de ${ligne.equipe} : ${e instanceof Error ? e.message : String(e)}`);
      if (connue) resultat.set(ligne.identifiant, connue.logos);
    }
  }
  return resultat;
}
