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

async function uploadImageIfProvided(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  formData: FormData,
  fieldName: string,
  bucket: string,
  basePath: string
): Promise<string | undefined> {
  const file = formData.get(fieldName);
  if (!(file instanceof File) || file.size === 0) return undefined;

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${basePath}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

async function removeStoredImages(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  bucket: string,
  id: string
) {
  const { data: files } = await supabase.storage.from(bucket).list("", { search: id });
  if (files && files.length > 0) {
    await supabase.storage.from(bucket).remove(files.map((f) => f.name));
  }
}

const GALLERY_BUCKET = "actualites-photos";
const GALLERY_PUBLIC_MARKER = `/public/${GALLERY_BUCKET}/`;

async function uploadGalleryPhotos(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  formData: FormData,
  fieldName: string,
  actualiteId: string,
  startPosition: number
): Promise<{ actualite_id: string; url: string; position: number }[]> {
  const files = formData
    .getAll(fieldName)
    .filter((f): f is File => f instanceof File && f.size > 0);

  const rows: { actualite_id: string; url: string; position: number }[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `gallery/${actualiteId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(GALLERY_BUCKET)
      .upload(path, file, { contentType: file.type });
    if (error) throw error;
    const { data } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(path);
    rows.push({ actualite_id: actualiteId, url: data.publicUrl, position: startPosition + i });
  }
  return rows;
}

async function removeGalleryFolder(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  actualiteId: string
) {
  const { data: files } = await supabase.storage
    .from(GALLERY_BUCKET)
    .list(`gallery/${actualiteId}`);
  if (files && files.length > 0) {
    await supabase.storage
      .from(GALLERY_BUCKET)
      .remove(files.map((f) => `gallery/${actualiteId}/${f.name}`));
  }
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
  const id = crypto.randomUUID();

  let imageUrl: string | undefined;
  try {
    imageUrl = await uploadImageIfProvided(supabase, formData, "image", "actualites-photos", id);
  } catch (e) {
    redirect(
      `/admin/actualites/new?error=${encodeURIComponent(
        e instanceof Error ? e.message : "Échec de l'envoi de la photo"
      )}`
    );
  }

  const { error } = await supabase.from("actualites").insert({
    id,
    titre,
    slug,
    extrait: strOrNull(formData, "extrait"),
    contenu: str(formData, "contenu"),
    image_url: imageUrl ?? null,
  });
  if (error) redirect(`/admin/actualites/new?error=${encodeURIComponent(error.message)}`);

  try {
    const galleryRows = await uploadGalleryPhotos(supabase, formData, "photos", id, 0);
    if (galleryRows.length > 0) {
      await supabase.from("actualite_photos").insert(galleryRows);
    }
  } catch (e) {
    redirect(
      `/admin/actualites/${id}?error=${encodeURIComponent(
        e instanceof Error ? e.message : "Échec de l'envoi des photos"
      )}`
    );
  }

  redirect("/admin/actualites");
}

export async function updateActualite(id: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();

  let imageUrl: string | undefined;
  try {
    imageUrl = await uploadImageIfProvided(supabase, formData, "image", "actualites-photos", id);
  } catch (e) {
    redirect(
      `/admin/actualites/${id}?error=${encodeURIComponent(
        e instanceof Error ? e.message : "Échec de l'envoi de la photo"
      )}`
    );
  }

  const updateData: Record<string, unknown> = {
    titre: str(formData, "titre"),
    extrait: strOrNull(formData, "extrait"),
    contenu: str(formData, "contenu"),
  };
  if (imageUrl) updateData.image_url = imageUrl;

  const { error } = await supabase.from("actualites").update(updateData).eq("id", id);
  if (error) redirect(`/admin/actualites/${id}?error=${encodeURIComponent(error.message)}`);

  try {
    const { count } = await supabase
      .from("actualite_photos")
      .select("id", { count: "exact", head: true })
      .eq("actualite_id", id);
    const galleryRows = await uploadGalleryPhotos(supabase, formData, "photos", id, count ?? 0);
    if (galleryRows.length > 0) {
      await supabase.from("actualite_photos").insert(galleryRows);
    }
  } catch (e) {
    redirect(
      `/admin/actualites/${id}?error=${encodeURIComponent(
        e instanceof Error ? e.message : "Échec de l'envoi des photos"
      )}`
    );
  }

  redirect("/admin/actualites");
}

export async function deleteActualitePhoto(photoId: string, actualiteId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: photo } = await supabase
    .from("actualite_photos")
    .select("url")
    .eq("id", photoId)
    .maybeSingle();

  await supabase.from("actualite_photos").delete().eq("id", photoId);

  if (photo?.url) {
    const idx = photo.url.indexOf(GALLERY_PUBLIC_MARKER);
    if (idx !== -1) {
      const path = photo.url.slice(idx + GALLERY_PUBLIC_MARKER.length);
      await supabase.storage.from(GALLERY_BUCKET).remove([path]);
    }
  }

  redirect(`/admin/actualites/${actualiteId}`);
}

export async function deleteActualite(id: string) {
  const supabase = await createServerSupabaseClient();
  await supabase.from("actualites").delete().eq("id", id);
  await removeStoredImages(supabase, "actualites-photos", id);
  await removeGalleryFolder(supabase, id);
  redirect("/admin/actualites");
}

// --- Effectif (joueurs) ---

export async function createJoueur(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const id = crypto.randomUUID();

  let photoUrl: string | undefined;
  try {
    photoUrl = await uploadImageIfProvided(supabase, formData, "photo", "joueurs-photos", id);
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
    photoUrl = await uploadImageIfProvided(supabase, formData, "photo", "joueurs-photos", id);
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
  await removeStoredImages(supabase, "joueurs-photos", id);
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

// --- Apparence du site ---

export async function updateHeroImage(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  let imageUrl: string | undefined;
  try {
    imageUrl = await uploadImageIfProvided(supabase, formData, "image", "site-images", "hero");
  } catch (e) {
    redirect(
      `/admin/apparence?error=${encodeURIComponent(
        e instanceof Error ? e.message : "Échec de l'envoi de la photo"
      )}`
    );
  }

  if (!imageUrl) {
    redirect(`/admin/apparence?error=${encodeURIComponent("Choisis une image.")}`);
  }

  const { error } = await supabase
    .from("site_settings")
    .update({ hero_image_url: imageUrl, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) redirect(`/admin/apparence?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/apparence?success=1");
}

export async function removeHeroImage() {
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("site_settings")
    .update({ hero_image_url: null, updated_at: new Date().toISOString() })
    .eq("id", 1);
  redirect("/admin/apparence");
}
