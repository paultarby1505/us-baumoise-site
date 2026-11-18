import { supabase } from "./supabase";
import type {
  Actualite,
  ActualitePhoto,
  CategoriePage,
  ClassementLigne,
  EquipeFfr,
  GalleryPhoto,
  Joueur,
  Match,
  MatchEvenement,
  Partenaire,
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

export async function getMatch(id: string): Promise<Match | null> {
  const { data, error } = await supabase
    .from("matchs")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export type CompositionSlot = { slot: number; joueur: Joueur };

export async function getMatchComposition(matchId: string): Promise<CompositionSlot[]> {
  const { data, error } = await supabase
    .from("match_compositions")
    .select("slot, joueur:joueurs(*)")
    .eq("match_id", matchId)
    .order("slot", { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as unknown as { slot: number; joueur: Joueur | null }[];
  return rows.filter((r): r is CompositionSlot => r.joueur !== null);
}

export async function getMatchEvenements(matchId: string): Promise<MatchEvenement[]> {
  const { data, error } = await supabase
    .from("match_evenements")
    .select("*")
    .eq("match_id", matchId)
    .order("position", { ascending: true });
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

export async function getPartenaires(): Promise<Partenaire[]> {
  const { data, error } = await supabase
    .from("partenaires")
    .select("*")
    .order("ordre", { ascending: true })
    .order("nom", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getPartenaire(slug: string): Promise<Partenaire | null> {
  const { data, error } = await supabase
    .from("partenaires")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Classement calculé automatiquement : points puis différence puis points
// marqués, comme au rugby. Pas de tri manuel à maintenir.
function compareClassement(a: ClassementLigne, b: ClassementLigne): number {
  if (a.points_classement !== b.points_classement) {
    return b.points_classement - a.points_classement;
  }
  const diffA = a.points_marques - a.points_encaisses;
  const diffB = b.points_marques - b.points_encaisses;
  if (diffA !== diffB) return diffB - diffA;
  if (a.points_marques !== b.points_marques) return b.points_marques - a.points_marques;
  return a.equipe.localeCompare(b.equipe);
}

// Logo à afficher pour chaque ligne : celui mis à la main dans l'admin s'il
// existe, sinon celui de la base des logos FFR (repéré par l'identifiant FFR
// de l'équipe), sinon rien (le tableau affiche alors les initiales).
async function avecLogos(lignes: ClassementLigne[]): Promise<ClassementLigne[]> {
  const identifiants = [
    ...new Set(lignes.map((l) => l.ffr_identifiant).filter((v): v is string => !!v)),
  ];
  const parIdentifiant = new Map<string, string[]>();
  if (identifiants.length > 0) {
    // Sans la base des logos (table absente, erreur réseau), le classement
    // s'affiche quand même.
    const { data } = await supabase
      .from("equipes_ffr")
      .select("identifiant, logos")
      .in("identifiant", identifiants);
    for (const e of (data ?? []) as Pick<EquipeFfr, "identifiant" | "logos">[]) {
      parIdentifiant.set(e.identifiant, e.logos ?? []);
    }
  }
  return lignes.map((l) => {
    const ffr = (l.ffr_identifiant && parIdentifiant.get(l.ffr_identifiant)) || [];
    // Notre équipe : notre logo, suivi de celui des clubs avec qui on est en
    // entente (OL Besançon pour l'UBB), sans l'ancien logo FFR de l'US Baumoise.
    if (l.notre_club) {
      return { ...l, logos: ["/logo.png", ...ffr.filter((u) => !u.includes(LOGO_FFR_US_BAUMOISE))] };
    }
    // Une entente (plusieurs clubs à la FFR) montre le logo de chaque club,
    // même si un logo unique a été mis à la main.
    if (ffr.length >= 2) return { ...l, logos: ffr };
    return { ...l, logos: l.logo_url ? [l.logo_url] : ffr };
  });
}

// Identifiant de l'image du logo de l'US Baumoise sur Mon Club House : notre
// propre logo (/logo.png) le remplace partout sur le site.
const LOGO_FFR_US_BAUMOISE = "b2558d2f-93d9-4a9d-a152-0a985eaf04e5";

export async function getClassements(): Promise<ClassementLigne[]> {
  const { data, error } = await supabase.from("classements").select("*");
  if (error) throw error;
  return (await avecLogos(data ?? []))
    .sort(compareClassement)
    .sort((a, b) => a.categorie.localeCompare(b.categorie));
}

export async function getClassement(categorie: string): Promise<ClassementLigne[]> {
  const { data, error } = await supabase
    .from("classements")
    .select("*")
    .eq("categorie", categorie);
  if (error) throw error;
  return (await avecLogos(data ?? [])).sort(compareClassement);
}

// Un match ne bascule en résultat que 5h après son coup d'envoi (le temps du
// match, du retour et de la saisie du score par un bénévole) : avant ça, il
// reste affiché comme "à venir" même si l'heure de coup d'envoi est passée.
const DELAI_RESULTAT_MS = 5 * 60 * 60 * 1000;

export function getMatchsAvenir(matchs: Match[]): Match[] {
  const now = Date.now();
  return matchs.filter((m) => new Date(m.date_match).getTime() + DELAI_RESULTAT_MS > now);
}

export function getResultats(matchs: Match[]): Match[] {
  const now = Date.now();
  return matchs
    .filter((m) => new Date(m.date_match).getTime() + DELAI_RESULTAT_MS <= now)
    .sort(
      (a, b) => new Date(b.date_match).getTime() - new Date(a.date_match).getTime()
    );
}
