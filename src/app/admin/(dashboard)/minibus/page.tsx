import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { deleteMinibusTrajet, updateMinibusTarifs } from "@/app/admin/actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import { MINIBUS_IDS, MINIBUS_LABELS, formatEuros, formatKm } from "@/lib/minibus";
import type { MinibusTrajet, MinibusVehicule } from "@/lib/types";

function formatDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatMois(mois: string) {
  const [y, m] = mois.split("-").map(Number);
  const label = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default async function AdminMinibusPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; mois?: string }>;
}) {
  const { error, success, mois } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const [trajetsRes, vehiculesRes] = await Promise.all([
    supabase
      .from("minibus_trajets")
      .select("*")
      .order("date_trajet", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("minibus_vehicules").select("*"),
  ]);

  if (trajetsRes.error || vehiculesRes.error) {
    return (
      <div>
        <h1 className="text-2xl font-extrabold">Minibus</h1>
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">
          Les tables du minibus ne sont pas encore créées dans Supabase. Exécute le fichier{" "}
          <code>supabase/minibus.sql</code> dans le SQL Editor de Supabase.
        </p>
      </div>
    );
  }

  const tous = (trajetsRes.data ?? []) as MinibusTrajet[];
  const vehicules = (vehiculesRes.data ?? []) as MinibusVehicule[];

  const moisDisponibles = [...new Set(tous.map((t) => t.date_trajet.slice(0, 7)))];
  const moisActif = mois && moisDisponibles.includes(mois) ? mois : "";
  const trajets = moisActif ? tous.filter((t) => t.date_trajet.startsWith(moisActif)) : tous;

  const totaux = MINIBUS_IDS.map((id) => {
    const rows = trajets.filter((t) => t.minibus === id);
    return {
      id,
      nb: rows.length,
      km: rows.reduce((s, t) => s + Number(t.km_total), 0),
      cout: rows.reduce((s, t) => s + Number(t.cout_total), 0),
    };
  });
  const totalKm = totaux.reduce((s, t) => s + t.km, 0);
  const totalCout = totaux.reduce((s, t) => s + t.cout, 0);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold">Minibus</h1>
        <Link
          href="/admin/minibus/new"
          className="shrink-0 rounded bg-club-gold px-4 py-2 text-sm font-semibold text-black hover:bg-club-gold-light"
        >
          + Nouveau trajet
        </Link>
      </div>
      {error && (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      {success && (
        <p className="mt-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Tarifs enregistrés.
        </p>
      )}

      {moisDisponibles.length > 0 && (
        <form className="mt-6 flex items-center gap-2 text-sm">
          <label htmlFor="mois" className="font-medium">
            Période
          </label>
          <select
            id="mois"
            name="mois"
            defaultValue={moisActif}
            className="rounded border border-black/20 bg-white px-3 py-1.5"
          >
            <option value="">Tous les trajets</option>
            {moisDisponibles.map((m) => (
              <option key={m} value={m}>
                {formatMois(m)}
              </option>
            ))}
          </select>
          <button type="submit" className="text-club-gold hover:underline">
            Afficher
          </button>
        </form>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {totaux.map((t) => (
          <div key={t.id} className="rounded-lg border border-black/10 bg-white p-4">
            <p className="text-sm font-bold text-club-gold">Minibus {MINIBUS_LABELS[t.id].toLowerCase()}</p>
            <p className="mt-1 text-xl font-extrabold">{formatEuros(t.cout)}</p>
            <p className="text-xs text-foreground/60">
              {t.nb} trajet{t.nb > 1 ? "s" : ""} · {formatKm(t.km)}
            </p>
          </div>
        ))}
        <div className="rounded-lg border border-club-gold bg-club-gold/10 p-4">
          <p className="text-sm font-bold">Total</p>
          <p className="mt-1 text-xl font-extrabold">{formatEuros(totalCout)}</p>
          <p className="text-xs text-foreground/60">
            {trajets.length} trajet{trajets.length > 1 ? "s" : ""} · {formatKm(totalKm)}
          </p>
        </div>
      </div>

      {trajets.length === 0 ? (
        <p className="mt-6 text-sm text-foreground/60">Aucun trajet enregistré pour le moment.</p>
      ) : (
        <div className="mt-6 divide-y divide-black/10 rounded-lg border border-black/10 bg-white">
          {trajets.map((t) => (
            <div key={t.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-semibold">
                  {t.depart} {t.aller_retour ? "⇄" : "→"} {t.arrivee}
                </p>
                <p className="text-xs text-foreground/60">
                  {formatDate(t.date_trajet)} · Minibus {MINIBUS_LABELS[t.minibus].toLowerCase()}
                  {t.aller_retour ? " · aller-retour" : " · aller simple"}
                </p>
                {(t.motif || t.conducteur) && (
                  <p className="text-xs text-foreground/50">
                    {[t.motif, t.conducteur && `Conducteur : ${t.conducteur}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <p className="font-bold">{formatEuros(Number(t.cout_total))}</p>
                <p className="text-xs text-foreground/60">
                  {formatKm(Number(t.km_total))} × {formatEuros(Number(t.cout_km))}
                </p>
                <div className="flex gap-3 text-sm">
                  <Link href={`/admin/minibus/${t.id}`} className="text-club-gold hover:underline">
                    Modifier
                  </Link>
                  <form action={deleteMinibusTrajet.bind(null, t.id)}>
                    <ConfirmSubmitButton
                      confirmMessage="Supprimer ce trajet ?"
                      className="text-red-600 hover:underline"
                    >
                      Supprimer
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-lg font-bold text-club-gold">Tarif au kilomètre</h2>
        <p className="mt-1 text-xs text-foreground/50">
          Utilisé pour calculer le coût des nouveaux trajets. Les trajets déjà enregistrés gardent
          le tarif appliqué au moment de leur saisie.
        </p>
        <form action={updateMinibusTarifs} className="mt-3 flex flex-wrap items-end gap-4">
          {MINIBUS_IDS.map((id) => {
            const v = vehicules.find((x) => x.id === id);
            return (
              <label key={id} className="block text-sm font-medium">
                Minibus {MINIBUS_LABELS[id].toLowerCase()} (€ / km)
                <input
                  type="number"
                  name={`cout_km_${id}`}
                  min={0}
                  step={0.001}
                  required
                  defaultValue={v ? Number(v.cout_km) : 0}
                  className="mt-1 w-40 rounded border border-black/20 bg-white px-3 py-2"
                />
              </label>
            );
          })}
          <button
            type="submit"
            className="rounded bg-club-gold px-4 py-2 text-sm font-semibold text-black hover:bg-club-gold-light"
          >
            Enregistrer les tarifs
          </button>
        </form>
      </div>
    </div>
  );
}
