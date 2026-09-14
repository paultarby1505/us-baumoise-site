import { supabase } from "./supabase";
import type {
  Actualite,
  ActualitePhoto,
  CategoriePage,
  GalleryPhoto,
  Joueur,
  Match,
  SiteSettings,
} from "./types";

export async function getActualites(): Promise<Actualite[]> {
  const { data, error } = await supabase
    .from("actualites")
    .select("*")
    .order("publie_le", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getActualite(slug: string): Promise<Actualite | null> {
  const { data, error } = await supabase
    .from("actualites")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getJoueurs(): Promise<Joueur[]> {
  const { data, error } = await supabase
    .from("joueurs")
    .select("*")
    .order("numero", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getMatchs(): Promise<Match[]> {
  const { data, error } = await supabase
    .from("matchs")
    .select("*")
    .order("date_match", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getActualitePhotos(actualiteId: string): Promise<ActualitePhoto[]> {
  const { data, error } = await supabase
    .from("actualite_photos")
    .select("*")
    .eq("actualite_id", actualiteId)
    .order("position", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  const { data, error } = await supabase
    .from("actualite_photos")
    .select("*, actualite:actualites(titre, slug)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as GalleryPhoto[];
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getCategoriePage(categorie: string): Promise<CategoriePage | null> {
  const { data, error } = await supabase
    .from("categorie_pages")
    .select("*")
    .eq("categorie", categorie)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getCategoriePages(): Promise<CategoriePage[]> {
  const { data, error } = await supabase.from("categorie_pages").select("*");
  if (error) throw error;
  return data ?? [];
}

export function getProchainsMatchs(matchs: Match[]): Match[] {
  const now = Date.now();
  return matchs.filter((m) => new Date(m.date_match).getTime() >= now);
}

export function getMatchsPasses(matchs: Match[]): Match[] {
  const now = Date.now();
  return matchs
    .filter((m) => new Date(m.date_match).getTime() < now)
    .sort(
      (a, b) => new Date(b.date_match).getTime() - new Date(a.date_match).getTime()
    );
}
