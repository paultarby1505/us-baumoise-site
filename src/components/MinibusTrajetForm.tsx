"use client";

import { useState, useTransition } from "react";
import { calculerDistanceMinibus } from "@/app/admin/actions";
import { MINIBUS_IDS, MINIBUS_LABELS, computeTrajet, formatEuros, formatKm } from "@/lib/minibus";
import type { MinibusId, MinibusTrajet, MinibusVehicule } from "@/lib/types";

const inputClass = "mt-1 w-full rounded border border-black/20 bg-white px-3 py-2";

export default function MinibusTrajetForm({
  action,
  vehicules,
  trajet,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  vehicules: MinibusVehicule[];
  trajet?: MinibusTrajet;
  submitLabel: string;
}) {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Paris" });

  const [minibus, setMinibus] = useState<MinibusId>(trajet?.minibus ?? "recent");
  const [depart, setDepart] = useState(trajet?.depart ?? "");
  const [arrivee, setArrivee] = useState(trajet?.arrivee ?? "");
  const [allerRetour, setAllerRetour] = useState(trajet?.aller_retour ?? true);
  const [kmAller, setKmAller] = useState(trajet ? String(trajet.km_aller) : "");
  const [calcMessage, setCalcMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  // Un trajet déjà saisi garde le tarif appliqué à l'époque tant qu'on ne
  // change pas de minibus ; sinon on prend le tarif actuel.
  const currentRate = Number(vehicules.find((v) => v.id === minibus)?.cout_km ?? 0);
  const rate = trajet && trajet.minibus === minibus ? Number(trajet.cout_km) : currentRate;

  const km = Number(kmAller.replace(",", "."));
  const preview = Number.isFinite(km) && km > 0 ? computeTrajet(km, allerRetour, rate) : null;

  function calculer() {
    setCalcMessage(null);
    startTransition(async () => {
      const res = await calculerDistanceMinibus(depart, arrivee);
      if (res.ok) {
        setKmAller(String(res.km));
        setCalcMessage({
          ok: true,
          text: `${formatKm(res.km)} (aller) : ${res.departLabel} → ${res.arriveeLabel}`,
        });
      } else {
        setCalcMessage({ ok: false, text: res.error });
      }
    });
  }

  return (
    <form action={action} className="mt-6 max-w-md space-y-4">
      <fieldset>
        <legend className="text-sm font-medium">Minibus utilisé</legend>
        <div className="mt-1 grid grid-cols-2 gap-3">
          {MINIBUS_IDS.map((id) => {
            const v = vehicules.find((x) => x.id === id);
            const checked = minibus === id;
            return (
              <label
                key={id}
                className={`cursor-pointer rounded-lg border p-3 text-sm transition-colors ${
                  checked
                    ? "border-club-gold bg-club-gold/10"
                    : "border-black/20 bg-white hover:border-club-gold"
                }`}
              >
                <input
                  type="radio"
                  name="minibus"
                  value={id}
                  checked={checked}
                  onChange={() => setMinibus(id)}
                  className="sr-only"
                />
                <span className="block font-semibold">{MINIBUS_LABELS[id]}</span>
                <span className="block text-xs text-foreground/60">
                  {v ? `${formatEuros(Number(v.cout_km))} / km` : "Tarif non défini"}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <label className="block text-sm font-medium">
        Date du trajet
        <input
          type="date"
          name="date_trajet"
          required
          defaultValue={trajet?.date_trajet ?? today}
          className={inputClass}
        />
      </label>

      <label className="block text-sm font-medium">
        Départ
        <input
          type="text"
          name="depart"
          required
          value={depart}
          onChange={(e) => setDepart(e.target.value)}
          placeholder="Ex. Stade, Baume-les-Dames"
          className={inputClass}
        />
      </label>

      <label className="block text-sm font-medium">
        Arrivée
        <input
          type="text"
          name="arrivee"
          required
          value={arrivee}
          onChange={(e) => setArrivee(e.target.value)}
          placeholder="Ex. Besançon"
          className={inputClass}
        />
      </label>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="aller_retour"
          checked={allerRetour}
          onChange={(e) => setAllerRetour(e.target.checked)}
        />
        Aller-retour
      </label>

      <div>
        <div className="flex items-end gap-2">
          <label className="block flex-1 text-sm font-medium">
            Kilomètres (aller simple)
            <input
              type="text"
              inputMode="decimal"
              name="km_aller"
              required
              value={kmAller}
              onChange={(e) => setKmAller(e.target.value)}
              placeholder="Calcul auto ou saisie"
              className={inputClass}
            />
          </label>
          <button
            type="button"
            onClick={calculer}
            disabled={pending || !depart.trim() || !arrivee.trim()}
            className="rounded border border-club-gold px-3 py-2 text-sm font-semibold text-club-gold hover:bg-club-gold/10 disabled:opacity-50"
          >
            {pending ? "Calcul…" : "Calculer"}
          </button>
        </div>
        {calcMessage && (
          <p
            className={`mt-1 text-xs ${calcMessage.ok ? "text-foreground/60" : "text-red-600"}`}
          >
            {calcMessage.text}
          </p>
        )}
        <p className="mt-1 text-xs text-foreground/50">
          Distance routière calculée automatiquement, modifiable à la main si besoin.
        </p>
      </div>

      <div className="rounded-lg border border-black/10 bg-white p-4 text-sm">
        <div className="flex justify-between">
          <span>Distance totale</span>
          <span className="font-semibold">{preview ? formatKm(preview.km_total) : "—"}</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span>Coût ({formatEuros(rate)} / km)</span>
          <span className="text-lg font-bold text-club-gold">
            {preview ? formatEuros(preview.cout_total) : "—"}
          </span>
        </div>
      </div>

      <label className="block text-sm font-medium">
        Motif (optionnel)
        <input
          type="text"
          name="motif"
          defaultValue={trajet?.motif ?? ""}
          placeholder="Ex. Match Seniors à Besançon"
          className={inputClass}
        />
      </label>

      <label className="block text-sm font-medium">
        Conducteur (optionnel)
        <input
          type="text"
          name="conducteur"
          defaultValue={trajet?.conducteur ?? ""}
          className={inputClass}
        />
      </label>

      <button
        type="submit"
        className="rounded bg-club-gold px-4 py-2 font-semibold text-black hover:bg-club-gold-light"
      >
        {submitLabel}
      </button>
    </form>
  );
}
