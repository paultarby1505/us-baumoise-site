import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getSiteSettings } from "@/lib/queries";
import { sendManualNotification, updateNotificationSettings } from "@/app/admin/actions";

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const settings = await getSiteSettings();

  const supabase = await createServerSupabaseClient();
  const { count } = await supabase
    .from("push_subscriptions")
    .select("id", { count: "exact", head: true });

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Notifications</h1>
      <p className="mt-2 max-w-xl text-sm text-foreground/60">
        {count ?? 0} personne{(count ?? 0) > 1 ? "s ont" : " a"} activé les notifications sur le
        site (bouton cloche en haut du site, une fois installé sur l&apos;écran d&apos;accueil).
      </p>

      {error && <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      {success && (
        <p className="mt-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>
      )}

      <section className="mt-8 max-w-xl">
        <h2 className="text-lg font-bold text-club-gold">Envoyer une notification maintenant</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Envoyée immédiatement à tout le monde (convocation, information, actualité importante…).
        </p>
        <form action={sendManualNotification} className="mt-4 space-y-4">
          <label className="block text-sm font-medium">
            Titre
            <input
              type="text"
              name="titre"
              required
              maxLength={60}
              placeholder="Ex. Entraînement annulé"
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
            <span className="mt-1 block text-xs font-normal text-foreground/50">
              Inutile de remettre le nom du club, le téléphone l&apos;affiche déjà tout seul.
            </span>
          </label>
          <label className="block text-sm font-medium">
            Message
            <textarea
              name="message"
              required
              rows={3}
              maxLength={180}
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="rounded bg-club-gold px-4 py-2 font-semibold text-black hover:bg-club-gold-light"
          >
            Envoyer
          </button>
        </form>
      </section>

      <section className="mt-10 max-w-xl border-t border-black/10 pt-8">
        <h2 className="text-lg font-bold text-club-gold">Notifications automatiques</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Envoyées toutes seules quand tu publies une actu ou que tu rentres un résultat de match
          (la première fois seulement). <code>{"{titre}"}</code>,{" "}
          <code>{"{adversaire}"}</code>, <code>{"{score_us}"}</code> et{" "}
          <code>{"{score_adverse}"}</code> sont remplacés automatiquement.
        </p>
        <form action={updateNotificationSettings} className="mt-4 space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                name="notif_actualite_active"
                defaultChecked={settings?.notif_actualite_active ?? true}
              />
              Notifier à chaque nouvelle actualité publiée
            </label>
            <input
              type="text"
              name="notif_actualite_texte"
              defaultValue={settings?.notif_actualite_texte}
              className="w-full rounded border border-black/20 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                name="notif_resultat_active"
                defaultChecked={settings?.notif_resultat_active ?? true}
              />
              Notifier à chaque résultat de match rentré
            </label>
            <input
              type="text"
              name="notif_resultat_texte"
              defaultValue={settings?.notif_resultat_texte}
              className="w-full rounded border border-black/20 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded bg-club-gold px-4 py-2 font-semibold text-black hover:bg-club-gold-light"
          >
            Enregistrer les réglages
          </button>
        </form>
      </section>
    </div>
  );
}
