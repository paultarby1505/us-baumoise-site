import webpush from "web-push";
import { createServerSupabaseClient } from "./supabase-server";
import type { PushSubscriptionRow } from "./types";

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const contact = process.env.VAPID_CONTACT_EMAIL;
  if (!publicKey || !privateKey || !contact) return false;

  webpush.setVapidDetails(contact, publicKey, privateKey);
  return true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

/**
 * Envoie une notification push à tous les abonnés, et nettoie les
 * abonnements qui ne sont plus valides (désinstallation, expiration).
 * N'échoue jamais bruyamment : une notification ratée ne doit jamais
 * casser la publication d'une actu ou d'un résultat de match.
 */
export async function sendPushToAll(payload: PushPayload): Promise<{ sent: number; removed: number }> {
  if (!configureWebPush()) {
    console.error("Notifications push non configurées (clés VAPID manquantes).");
    return { sent: 0, removed: 0 };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("push_subscriptions").select("*");
  if (error || !data) {
    console.error("Impossible de lister les abonnements push", error);
    return { sent: 0, removed: 0 };
  }

  const subscriptions = data as PushSubscriptionRow[];
  const staleIds: string[] = [];
  let sent = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify({ title: payload.title, body: payload.body, url: payload.url ?? "/" })
        );
        sent += 1;
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        // 404/410 : l'abonnement n'existe plus côté navigateur, on l'efface.
        if (statusCode === 404 || statusCode === 410) {
          staleIds.push(sub.id);
        } else {
          console.error("Échec d'envoi d'une notification push", err);
        }
      }
    })
  );

  if (staleIds.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", staleIds);
  }

  return { sent, removed: staleIds.length };
}

function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => vars[key] ?? match);
}

/**
 * Envoie la notification automatique associée à un événement (nouvel
 * article, résultat de match), seulement si elle est activée dans les
 * réglages du site. Silencieuse si les réglages sont introuvables ou si
 * l'événement est désactivé.
 */
export async function sendAutoNotification(
  kind: "actualite" | "resultat",
  vars: Record<string, string>
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("notif_actualite_active, notif_actualite_texte, notif_resultat_active, notif_resultat_texte")
    .eq("id", 1)
    .maybeSingle();
  if (!settings) return;

  const active = kind === "actualite" ? settings.notif_actualite_active : settings.notif_resultat_active;
  const template = kind === "actualite" ? settings.notif_actualite_texte : settings.notif_resultat_texte;
  if (!active || !template) return;

  await sendPushToAll({
    title: "US Baumoise Rugby",
    body: renderTemplate(template, vars),
  });
}
