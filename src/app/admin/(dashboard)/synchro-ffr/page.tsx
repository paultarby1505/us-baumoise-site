import { createServerSupabaseClient } from "@/lib/supabase-server";
import { MATCH_CATEGORIES } from "@/lib/rugby";
import { formatParis } from "@/lib/date-fr";
import {
  enregistrerSourceFfr,
  supprimerSourceFfr,
  synchroniserMaintenant,
} from "@/app/admin/ffr-actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import type { FfrSource } from "@/lib/types";

export const dynamic = "force-dynamic";

function SourceForm({ source, categorie }: { source?: FfrSource; categorie?: string }) {
  return (
    <form action={enregistrerSourceFfr} className="space-y-3">
      {source ? (
        <input type="hidden" name="categorie" value={source.categorie} />
      ) : (
        <div>
          <label className="block text-xs font-semibold">Catégorie</label>
          <select
            name="categorie"
            defaultValue={categorie}
            className="mt-1 rounded border border-black/20 px-3 py-2 text-sm"
          >
            {MATCH_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold">
          Page de la compétition sur Mon Club House
        </label>
        <input
          type="url"
          name="url"
          required
          defaultValue={source?.url}
          placeholder="https://monclubhouse.ffr.fr/clubs/u-s-baumoise/competitions/…"
          className="mt-1 w-full rounded border border-black/20 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-semibold">Nom de notre équipe à la FFR</label>
          <input
            type="text"
            name="equipe_ffr"
            required
            defaultValue={source?.equipe_ffr}
            placeholder="Us Baumoise Ob"
            className="mt-1 rounded border border-black/20 px-3 py-2 text-sm"
          />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input type="checkbox" name="actif" defaultChecked={source?.actif ?? true} />
          Synchronisation active
        </label>
        <button
          type="submit"
          className="rounded bg-club-gold px-4 py-2 text-sm font-semibold text-black hover:bg-club-gold-light"
        >
          Enregistrer
        </button>
      </div>
    </form>
  );
}

export default async function SynchroFfrPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("ffr_sources").select("*").order("categorie");
  const sources = (data ?? []) as FfrSource[];
  const manquantes = MATCH_CATEGORIES.filter((c) => !sources.some((s) => s.categorie === c));

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold">Synchro FFR (Mon Club House)</h1>
      <p className="mt-2 text-sm text-foreground/60">
        Le site lit tout seul les pages publiques de Mon Club House : toutes les 30 minutes le
        samedi et le dimanche après-midi, et chaque matin. Pour chaque catégorie réglée ici, il
        reprend le <strong>classement officiel</strong>, les <strong>dates et scores</strong>{" "}
        des matchs (et ajoute ceux qui manquent au calendrier), et le{" "}
        <strong>détail des matchs</strong> : marqueurs, cartons et remplacements. Un joueur qui
        n&apos;est pas dans l&apos;effectif du site est affiché avec « (OB) ».
      </p>
      <p className="mt-2 text-xs text-foreground/50">
        Quand la phase change (brassage, qualification, phases finales), colle ici la nouvelle
        page de la compétition. Si la FFR modifie son site, la synchronisation peut s&apos;arrêter
        : le statut ci-dessous l&apos;indique, et la feuille de match reste remplissable à la
        main.
      </p>

      {error && <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      {success && (
        <p className="mt-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>
      )}

      <form action={synchroniserMaintenant} className="mt-6">
        <button
          type="submit"
          className="rounded bg-club-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          🔄 Synchroniser maintenant
        </button>
      </form>

      <div className="mt-8 space-y-6">
        {sources.map((s) => (
          <section key={s.categorie} className="rounded-lg border border-black/10 bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-club-gold">{s.categorie}</h2>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-club-gold hover:underline"
              >
                Voir sur Mon Club House ↗
              </a>
            </div>
            <p className="mt-1 text-xs text-foreground/60">
              {s.derniere_synchro
                ? `Dernière synchro : ${formatParis(s.derniere_synchro, {
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "Pas encore synchronisée."}
            </p>
            {s.dernier_statut && (
              <p
                className={`mt-1 rounded px-2 py-1 text-xs ${
                  s.dernier_statut.startsWith("OK")
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {s.dernier_statut}
              </p>
            )}
            <div className="mt-4">
              <SourceForm source={s} />
            </div>
            <form action={supprimerSourceFfr.bind(null, s.categorie)} className="mt-3">
              <ConfirmSubmitButton
                confirmMessage={`Arrêter la synchro FFR pour ${s.categorie} ?`}
                className="text-xs text-red-600 hover:underline"
              >
                Retirer cette catégorie
              </ConfirmSubmitButton>
            </form>
          </section>
        ))}
      </div>

      {manquantes.length > 0 && (
        <section className="mt-8 rounded-lg border border-dashed border-black/20 p-4">
          <h2 className="font-bold">Ajouter une catégorie</h2>
          <p className="mt-1 text-xs text-foreground/50">
            Sur Mon Club House, ouvre la page de notre équipe dans la compétition (onglet
            « Général ») et copie son adresse.
          </p>
          <div className="mt-3">
            <SourceForm categorie={manquantes[0]} />
          </div>
        </section>
      )}
    </div>
  );
}
