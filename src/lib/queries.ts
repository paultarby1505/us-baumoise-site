import { supabase } from "./supabase";
import type { Actualite, Joueur, Match } from "./types";

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
    .order("categorie", { ascending: true })
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
