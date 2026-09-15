"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createEphemeralSupabaseClient } from "@/lib/supabase-ephemeral";
import { getCurrentProfile } from "@/lib/auth";
import { slugify } from "@/lib/slugify";
import { CATEGORIES, MATCH_CATEGORIES, categorySlug } from "@/lib/rugby";
import { str, strOrNull, intOrNull } from "@/lib/form-data";

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
  table: string,
  base: string,
  fallback: string
) {
  const baseSlug = slugify(base) || fallback;
  let candidate = baseSlug;
  let i = 2;
  for (;;) {
    const { data } = await supabase
      .from(table)
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
  const slug = await uniqueSlug(supabase, "actualites", titre, "actualite");
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
  const id = crypto.randomUUID();

  let logoUrl: string | undefined;
  let afficheUrl: string | undefined;
  try {
    logoUrl = await uploadImageIfProvided(
      supabase,
      formData,
      "adversaire_logo",
      "matchs-photos",
      `${id}-logo`
    );
    afficheUrl = await uploadImageIfProvided(
      supabase,
      formData,
      "affiche",
      "matchs-photos",
      `${id}-affiche`
    );
  } catch (e) {
    redirect(
      `/admin/matchs/new?error=${encodeURIComponent(
        e instanceof Error ? e.message : "Échec de l'envoi d'une photo"
      )}`
    );
  }

  const { error } = await supabase.from("matchs").insert({
    id,
    adversaire: str(formData, "adversaire"),
    adversaire_logo_url: logoUrl ?? null,
    domicile: formData.get("domicile") === "on",
    date_match: dateMatch,
    lieu: strOrNull(formData, "lieu"),
    competition: strOrNull(formData, "competition"),
    categorie: str(formData, "categorie") || "Seniors",
    affiche_url: afficheUrl ?? null,
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

  let logoUrl: string | undefined;
  let afficheUrl: string | undefined;
  try {
    logoUrl = await uploadImageIfProvided(
      supabase,
      formData,
      "adversaire_logo",
      "matchs-photos",
      `${id}-logo`
    );
    afficheUrl = await uploadImageIfProvided(
      supabase,
      formData,
      "affiche",
      "matchs-photos",
      `${id}-affiche`
    );
  } catch (e) {
    redirect(
      `/admin/matchs/${id}?error=${encodeURIComponent(
        e instanceof Error ? e.message : "Échec de l'envoi d'une photo"
      )}`
    );
  }

  const updateData: Record<string, unknown> = {
    adversaire: str(formData, "adversaire"),
    domicile: formData.get("domicile") === "on",
    date_match: dateMatch,
    lieu: strOrNull(formData, "lieu"),
    competition: strOrNull(formData, "competition"),
    categorie: str(formData, "categorie") || "Seniors",
    score_us: intOrNull(formData, "score_us"),
    score_adverse: intOrNull(formData, "score_adverse"),
  };
  if (logoUrl) updateData.adversaire_logo_url = logoUrl;
  if (afficheUrl) updateData.affiche_url = afficheUrl;

  const { error } = await supabase.from("matchs").update(updateData).eq("id", id);
  if (error) redirect(`/admin/matchs/${id}?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/matchs");
}

export async function deleteMatch(id: string) {
  const supabase = await createServerSupabaseClient();
  await supabase.from("matchs").delete().eq("id", id);
  await removeStoredImages(supabase, "matchs-photos", id);
  redirect("/admin/matchs");
}

export async function updateMatchComposition(matchId: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const raw = str(formData, "composition");

  let entries: { slot: number; joueur_id: string }[] = [];
  try {
    entries = raw ? JSON.parse(raw) : [];
  } catch {
    redirect(`/admin/matchs/${matchId}?error=${encodeURIComponent("Composition invalide")}`);
  }

  const valid = entries.filter(
    (e) =>
      e &&
      Number.isInteger(e.slot) &&
      e.slot >= 1 &&
      e.slot <= 15 &&
      typeof e.joueur_id === "string" &&
      e.joueur_id.length > 0
  );

  await supabase.from("match_compositions").delete().eq("match_id", matchId);
  if (valid.length > 0) {
    const rows = valid.map((e) => ({ match_id: matchId, slot: e.slot, joueur_id: e.joueur_id }));
    const { error } = await supabase.from("match_compositions").insert(rows);
    if (error) {
      redirect(`/admin/matchs/${matchId}?error=${encodeURIComponent(error.message)}`);
    }
  }
  redirect(`/admin/matchs/${matchId}?success=composition`);
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

// --- En-têtes des pages de catégorie (effectif) ---

export async function updateCategorieHeader(categorie: string, formData: FormData) {
  if (!CATEGORIES.includes(categorie as (typeof CATEGORIES)[number])) {
    redirect(`/admin/effectif/categories?error=${encodeURIComponent("Catégorie inconnue.")}`);
  }
  const supabase = await createServerSupabaseClient();
  const slug = categorySlug(categorie);

  let imageUrl: string | undefined;
  try {
    imageUrl = await uploadImageIfProvided(
      supabase,
      formData,
      "image",
      "site-images",
      `categorie-${slug}`
    );
  } catch (e) {
    redirect(
      `/admin/effectif/categories/${slug}?error=${encodeURIComponent(
        e instanceof Error ? e.message : "Échec de l'envoi de la photo"
      )}`
    );
  }

  const upsertData: Record<string, unknown> = {
    categorie,
    header_titre: strOrNull(formData, "header_titre"),
    header_texte: strOrNull(formData, "header_texte"),
    updated_at: new Date().toISOString(),
  };
  if (imageUrl) upsertData.header_image_url = imageUrl;

  const { error } = await supabase
    .from("categorie_pages")
    .upsert(upsertData, { onConflict: "categorie" });
  if (error) {
    redirect(`/admin/effectif/categories/${slug}?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/admin/effectif/categories/${slug}?success=1`);
}

export async function removeCategorieHeaderImage(categorie: string) {
  const supabase = await createServerSupabaseClient();
  const slug = categorySlug(categorie);
  await supabase
    .from("categorie_pages")
    .update({ header_image_url: null, updated_at: new Date().toISOString() })
    .eq("categorie", categorie);
  redirect(`/admin/effectif/categories/${slug}`);
}

// --- Partenaires ---

export async function createPartenaire(formData: FormData) {
  const nom = str(formData, "nom");
  const supabase = await createServerSupabaseClient();
  const slug = await uniqueSlug(supabase, "partenaires", nom, "partenaire");
  const id = crypto.randomUUID();

  let logoUrl: string | undefined;
  try {
    logoUrl = await uploadImageIfProvided(supabase, formData, "logo", "partenaires-photos", id);
  } catch (e) {
    redirect(
      `/admin/partenaires/new?error=${encodeURIComponent(
        e instanceof Error ? e.message : "Échec de l'envoi du logo"
      )}`
    );
  }

  const { error } = await supabase.from("partenaires").insert({
    id,
    nom,
    slug,
    logo_url: logoUrl ?? null,
    resume: strOrNull(formData, "resume"),
    description: strOrNull(formData, "description"),
    site_url: strOrNull(formData, "site_url"),
    ordre: intOrNull(formData, "ordre") ?? 0,
  });
  if (error) redirect(`/admin/partenaires/new?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/partenaires");
}

export async function updatePartenaire(id: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();

  let logoUrl: string | undefined;
  try {
    logoUrl = await uploadImageIfProvided(supabase, formData, "logo", "partenaires-photos", id);
  } catch (e) {
    redirect(
      `/admin/partenaires/${id}?error=${encodeURIComponent(
        e instanceof Error ? e.message : "Échec de l'envoi du logo"
      )}`
    );
  }

  const updateData: Record<string, unknown> = {
    nom: str(formData, "nom"),
    resume: strOrNull(formData, "resume"),
    description: strOrNull(formData, "description"),
    site_url: strOrNull(formData, "site_url"),
    ordre: intOrNull(formData, "ordre") ?? 0,
  };
  if (logoUrl) updateData.logo_url = logoUrl;

  const { error } = await supabase.from("partenaires").update(updateData).eq("id", id);
  if (error) redirect(`/admin/partenaires/${id}?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/partenaires");
}

export async function deletePartenaire(id: string) {
  const supabase = await createServerSupabaseClient();
  await supabase.from("partenaires").delete().eq("id", id);
  await removeStoredImages(supabase, "partenaires-photos", id);
  redirect("/admin/partenaires");
}

// --- Classements ---

function classementData(formData: FormData) {
  const categorie = str(formData, "categorie");
  return {
    categorie: MATCH_CATEGORIES.includes(categorie as (typeof MATCH_CATEGORIES)[number])
      ? categorie
      : MATCH_CATEGORIES[0],
    equipe: str(formData, "equipe"),
    notre_club: formData.get("notre_club") === "on",
    joues: intOrNull(formData, "joues") ?? 0,
    gagnes: intOrNull(formData, "gagnes") ?? 0,
    nuls: intOrNull(formData, "nuls") ?? 0,
    perdus: intOrNull(formData, "perdus") ?? 0,
    points_marques: intOrNull(formData, "points_marques") ?? 0,
    points_encaisses: intOrNull(formData, "points_encaisses") ?? 0,
    points_classement: intOrNull(formData, "points_classement") ?? 0,
  };
}

export async function createClassement(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const id = crypto.randomUUID();

  let logoUrl: string | undefined;
  try {
    logoUrl = await uploadImageIfProvided(supabase, formData, "logo", "classements-logos", id);
  } catch (e) {
    redirect(
      `/admin/classements/new?error=${encodeURIComponent(
        e instanceof Error ? e.message : "Échec de l'envoi du logo"
      )}`
    );
  }

  const { error } = await supabase
    .from("classements")
    .insert({ id, ...classementData(formData), logo_url: logoUrl ?? null });
  if (error) redirect(`/admin/classements/new?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/classements");
}

export async function updateClassement(id: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();

  let logoUrl: string | undefined;
  try {
    logoUrl = await uploadImageIfProvided(supabase, formData, "logo", "classements-logos", id);
  } catch (e) {
    redirect(
      `/admin/classements/${id}?error=${encodeURIComponent(
        e instanceof Error ? e.message : "Échec de l'envoi du logo"
      )}`
    );
  }

  const updateData: Record<string, unknown> = classementData(formData);
  if (logoUrl) updateData.logo_url = logoUrl;

  const { error } = await supabase.from("classements").update(updateData).eq("id", id);
  if (error) redirect(`/admin/classements/${id}?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/classements");
}

export async function deleteClassement(id: string) {
  const supabase = await createServerSupabaseClient();
  await supabase.from("classements").delete().eq("id", id);
  await removeStoredImages(supabase, "classements-logos", id);
  redirect("/admin/classements");
}

// --- Contacts (messages reçus) ---

export async function markContactLu(id: string, lu: boolean) {
  const supabase = await createServerSupabaseClient();
  await supabase.from("contacts").update({ lu }).eq("id", id);
  redirect("/admin/contacts");
}

export async function deleteContact(id: string) {
  const supabase = await createServerSupabaseClient();
  await supabase.from("contacts").delete().eq("id", id);
  redirect("/admin/contacts");
}
