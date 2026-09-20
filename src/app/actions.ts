"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { str, strOrNull } from "@/lib/form-data";

export async function createContact(formData: FormData) {
  // Piège à robots : champ caché, invisible et non rempli par un humain.
  if (str(formData, "site") !== "") {
    redirect("/contact?success=1");
  }

  const nom = str(formData, "nom");
  const prenom = str(formData, "prenom");
  const email = strOrNull(formData, "email");
  const telephone = strOrNull(formData, "telephone");
  const objet = str(formData, "objet");
  const message = str(formData, "message");

  if (!nom || !prenom || !objet || !message) {
    redirect(`/contact?error=${encodeURIComponent("Merci de remplir tous les champs obligatoires.")}`);
  }
  if (!email && !telephone) {
    redirect(
      `/contact?error=${encodeURIComponent("Renseigne au moins un email ou un téléphone pour qu'on puisse te répondre.")}`
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("contacts").insert({
    nom,
    prenom,
    email,
    telephone,
    objet,
    message,
  });
  if (error) {
    redirect(`/contact?error=${encodeURIComponent("Erreur lors de l'envoi, réessaie plus tard.")}`);
  }

  redirect("/contact?success=1");
}

// --- Abonnement aux notifications push (appelé directement depuis le
// composant client, pas via un <form>) ---

type PushSubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function subscribePush(
  sub: PushSubscriptionInput
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();

  // Pas de .upsert() : côté anonyme, la résolution ON CONFLICT DO UPDATE
  // exige une visibilité SELECT que la policy (réservée à l'équipe) ne
  // donne pas, et échoue avec une erreur RLS même si l'UPDATE seul est
  // autorisé. On tente donc une insertion, et on bascule sur une mise à
  // jour classique si l'endpoint existe déjà (ex. ré-abonnement iOS, qui
  // réutilise le même endpoint après un désabonnement).
  const { error: insertError } = await supabase.from("push_subscriptions").insert({
    endpoint: sub.endpoint,
    p256dh: sub.keys.p256dh,
    auth: sub.keys.auth,
  });
  if (!insertError) return { ok: true };
  if (insertError.code !== "23505") {
    console.error("Échec de l'enregistrement de l'abonnement push", insertError);
    return { ok: false, error: insertError.message };
  }

  const { error: updateError } = await supabase
    .from("push_subscriptions")
    .update({ p256dh: sub.keys.p256dh, auth: sub.keys.auth })
    .eq("endpoint", sub.endpoint);
  if (updateError) console.error("Échec de la mise à jour de l'abonnement push", updateError);
  return { ok: !updateError, error: updateError?.message };
}

export async function unsubscribePush(endpoint: string): Promise<{ ok: boolean }> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  return { ok: !error };
}
