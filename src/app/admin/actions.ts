"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createEphemeralSupabaseClient } from "@/lib/supabase-ephemeral";
import { getCurrentProfile } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function strOrNull(formData: FormData, key: string): string | null {
  const value = str(formData, key);
  return value === "" ? null : value;
}

function intOrNull(formData: FormData, key: string): number | null {
  const value = str(formData, key);
  if (value === "") return null;
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? null : n;
}

async function uploadPhotoIfProvided(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  formData: FormData,
  joueurId: string
): Promise<string | undefined> {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return undefined;

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${joueurId}.${ext}`;

  const { error } = await supabase.storage
    .from("joueurs-photos")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;

  const { data } = supabase.storage.from("joueurs-photos").getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

// --- Auth ---

export async function login(formData: FormData) {
  const email = str(formData, "email");
  const password = str(formData, "password");
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/admin");
}

export async function logout() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// --- Équipe (rôles) ---

export async function addTeamMember(formData: FormData) {
  const email = str(formData, "email");
  const password = str(formData, "password");

  const owner = await getCurrentProfile();
  if (owner?.role !== "owner") {
    redirect(`/admin?error=${encodeURIComponent("Réservé au propriétaire du site.")}`);
  }

  // Client "jetable" : ne touche pas aux cookies, donc ne déconnecte pas
  // le propriétaire actuellement connecté en créant ce nouveau compte.
  const anon = createEphemeralSupabaseClient();
  const { data: signUpData, error: signUpError } = await anon.auth.signUp({
    email,
    password,
  });
  if (signUpError || !signUpData.user) {
    redirect(
      `/admin/equipe?error=${encodeURIComponent(
        signUpError?.message ?? "Erreur lors de la création du compte"
      )}`
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error: profileError } = await supabase.from("profiles").insert({
    id: signUpData.user.id,
    email,
    role: "editor",
  });
  if (profileError) {
    redirect(`/admin/equipe?error=${encodeURIComponent(profileError.message)}`);
  }
  redirect("/admin/equipe?success=1");
}

export async function removeTeamMember(id: string) {
  const owner = await getCurrentProfile();
  if (owner?.role !== "owner") {
    redirect(`/admin?error=${encodeURIComponent("Réservé au propriétaire du site.")}`);
  }

  const supabase = await createServerSupabaseClient();
  const { data: target } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", id)
    .maybeSingle();

  if (target?.role === "owner") {
    redirect(
      `/admin/equipe?error=${encodeURIComponent(
        "Impossible de retirer le propriétaire du site."
      )}`
    );
  }

  await supabase.from("profiles").delete().eq("id", id);
  redirect("/admin/equipe");
}

// --- Actualités ---

async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  base: string
) {
  const baseSlug = slugify(base) || "actualite";
  let candidate = baseSlug;
  let i = 2;
  for (;;) {
    const { data } = await supabase
      .from("actualites")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    candidate = `${baseSlug}-${i++}`;
  }
}

export async function createActualite(formData: FormData) {
  const titre = str(formData, "titre");
  const supabase = await createServerSupabaseClient();
  const slug = await uniqueSlug(supabase, titre);

  const { error } = await supabase.from("actualites").insert({
    titre,
    slug,
    extrait: strOrNull(formData, "extrait"),
    contenu: str(formData, "contenu"),
  });
  if (error) redirect(`/admin/actualites/new?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/actualites");
}

export async function updateActualite(id: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("actualites")
    .update({
      titre: str(formData, "titre"),
      extrait: strOrNull(formData, "extrait"),
      contenu: str(formData, "contenu"),
    })
    .eq("id", id);
  if (error) redirect(`/admin/actualites/${id}?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/actualites");
}

export async function deleteActualite(id: string) {
  const supabase = await createServerSupabaseClient();
  await supabase.from("actualites").delete().eq("id", id);
  redirect("/admin/actualites");
}

// --- Effectif (joueurs) ---

export async function createJoueur(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const id = crypto.randomUUID();

  let photoUrl: string | undefined;
  try {
    photoUrl = await uploadPhotoIfProvided(supabase, formData, id);
  } catch (e) {
    redirect(
      `/admin/effectif/new?error=${encodeURIComponent(
        e instanceof Error ? e.message : "Échec de l'envoi de la photo"
      )}`
    );
  }

  const { error } = await supabase.from("joueurs").insert({
    id,
    prenom: str(formData, "prenom"),
    nom: str(formData, "nom"),
    numero: intOrNull(formData, "numero"),
    poste: strOrNull(formData, "poste"),
    categorie: str(formData, "categorie") || "Seniors",
    photo_url: photoUrl ?? null,
  });
  if (error) redirect(`/admin/effectif/new?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/effectif");
}

export async function updateJoueur(id: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();

  let photoUrl: string | undefined;
  try {
    photoUrl = await uploadPhotoIfProvided(supabase, formData, id);
  } catch (e) {
    redirect(
      `/admin/effectif/${id}?error=${encodeURIComponent(
        e instanceof Error ? e.message : "Échec de l'envoi de la photo"
      )}`
    );
  }

  const updateData: Record<string, unknown> = {
    prenom: str(formData, "prenom"),
    nom: str(formData, "nom"),
    numero: intOrNull(formData, "numero"),
    poste: strOrNull(formData, "poste"),
    categorie: str(formData, "categorie") || "Seniors",
  };
  if (photoUrl) updateData.photo_url = photoUrl;

  const { error } = await supabase.from("joueurs").update(updateData).eq("id", id);
  if (error) redirect(`/admin/effectif/${id}?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/effectif");
}

export async function deleteJoueur(id: string) {
  const supabase = await createServerSupabaseClient();
  await supabase.from("joueurs").delete().eq("id", id);
  const { data: files } = await supabase.storage.from("joueurs-photos").list("", {
    search: id,
  });
  if (files && files.length > 0) {
    await supabase.storage
      .from("joueurs-photos")
      .remove(files.map((f) => f.name));
  }
  redirect("/admin/effectif");
}

// --- Matchs ---

function dateMatchToIso(formData: FormData): string | null {
  const value = str(formData, "date_match");
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function createMatch(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const dateMatch = dateMatchToIso(formData);
  if (!dateMatch) {
    redirect(`/admin/matchs/new?error=${encodeURIComponent("Date de match invalide")}`);
  }
  const { error } = await supabase.from("matchs").insert({
    adversaire: str(formData, "adversaire"),
    domicile: formData.get("domicile") === "on",
    date_match: dateMatch,
    lieu: strOrNull(formData, "lieu"),
    competition: strOrNull(formData, "competition"),
    score_us: intOrNull(formData, "score_us"),
    score_adverse: intOrNull(formData, "score_adverse"),
  });
  if (error) redirect(`/admin/matchs/new?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/matchs");
}

export async function updateMatch(id: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const dateMatch = dateMatchToIso(formData);
  if (!dateMatch) {
    redirect(`/admin/matchs/${id}?error=${encodeURIComponent("Date de match invalide")}`);
  }
  const { error } = await supabase
    .from("matchs")
    .update({
      adversaire: str(formData, "adversaire"),
      domicile: formData.get("domicile") === "on",
      date_match: dateMatch,
      lieu: strOrNull(formData, "lieu"),
      competition: strOrNull(formData, "competition"),
      score_us: intOrNull(formData, "score_us"),
      score_adverse: intOrNull(formData, "score_adverse"),
    })
    .eq("id", id);
  if (error) redirect(`/admin/matchs/${id}?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/matchs");
}

export async function deleteMatch(id: string) {
  const supabase = await createServerSupabaseClient();
  await supabase.from("matchs").delete().eq("id", id);
  redirect("/admin/matchs");
}
