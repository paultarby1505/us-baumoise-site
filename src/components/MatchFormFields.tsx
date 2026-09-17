"use client";

import { useState } from "react";
import { MATCH_CATEGORIES } from "@/lib/rugby";
import ImagePickerField from "@/components/ImagePickerField";

type Mode = "classique" | "tournoi" | "u14";

function modeForCategorie(categorie: string): Mode {
  if (categorie === "EDR") return "tournoi";
  if (categorie === "U14") return "u14";
  return "classique";
}

export type MatchFormInitial = {
  categorie: string;
  adversaire: string;
  domicile: boolean;
  date_match: string;
  lieu: string;
  competition: string;
  nom_tournoi: string;
  adversaire2: string;
  score_us: number | "";
  score_adverse: number | "";
  score_us2: number | "";
  score_adverse2: number | "";
  adversaire_logo_url: string | null;
  adversaire2_logo_url: string | null;
  affiche_url: string | null;
};

const DEFAULT_INITIAL: MatchFormInitial = {
  categorie: "Seniors",
  adversaire: "",
  domicile: true,
  date_match: "",
  lieu: "",
  competition: "",
  nom_tournoi: "",
  adversaire2: "",
  score_us: "",
  score_adverse: "",
  score_us2: "",
  score_adverse2: "",
  adversaire_logo_url: null,
  adversaire2_logo_url: null,
  affiche_url: null,
};

export default function MatchFormFields({ initial }: { initial?: Partial<MatchFormInitial> }) {
  const values = { ...DEFAULT_INITIAL, ...initial };
  const [categorie, setCategorie] = useState(values.categorie);
  const [showSecondAdversaire, setShowSecondAdversaire] = useState(
    Boolean(values.adversaire2)
  );

  const mode = modeForCategorie(categorie);

  return (
    <>
      <label className="block text-sm font-medium">
        Catégorie
        <select
          name="categorie"
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
          required
          className="mt-1 w-full rounded border border-black/20 bg-white px-3 py-2"
        >
          {MATCH_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </label>

      {mode === "tournoi" && (
        <label className="block text-sm font-medium">
          Nom du tournoi / plateau (optionnel)
          <input
            type="text"
            name="nom_tournoi"
            defaultValue={values.nom_tournoi}
            placeholder="Ex : Plateau de Besançon"
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
          <span className="mt-1 block text-xs text-foreground/50">
            Un plateau EDR regroupe plusieurs adversaires : pas besoin de renseigner un
            adversaire précis.
          </span>
        </label>
      )}

      {mode === "u14" && (
        <label className="block text-sm font-medium">
          Nom du tournoi (optionnel)
          <input
            type="text"
            name="nom_tournoi"
            defaultValue={values.nom_tournoi}
            placeholder="Ex : Triangulaire de Baume-les-Dames"
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
      )}

      {mode !== "tournoi" && (
        <label className="block text-sm font-medium">
          {mode === "u14" ? "Adversaire (optionnel)" : "Adversaire"}
          <input
            type="text"
            name="adversaire"
            defaultValue={values.adversaire}
            required={mode === "classique"}
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
      )}
      <ImagePickerField
        name="adversaire_logo"
        label={
          mode === "tournoi"
            ? "Logo / photo du tournoi (optionnel)"
            : values.adversaire_logo_url
              ? "Remplacer le logo de l'adversaire"
              : "Logo de l'adversaire (optionnel)"
        }
        aspect={1}
      />

      {mode === "u14" && !showSecondAdversaire && (
        <button
          type="button"
          onClick={() => setShowSecondAdversaire(true)}
          className="text-sm font-semibold text-club-gold hover:underline"
        >
          + Ajouter un 2e adversaire (triangulaire)
        </button>
      )}

      {mode === "u14" && showSecondAdversaire && (
        <div className="space-y-4 rounded border border-black/10 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">2e adversaire (triangulaire)</p>
            <button
              type="button"
              onClick={() => setShowSecondAdversaire(false)}
              className="text-xs text-red-600 hover:underline"
            >
              Retirer
            </button>
          </div>
          <label className="block text-sm font-medium">
            Adversaire 2
            <input
              type="text"
              name="adversaire2"
              defaultValue={values.adversaire2}
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
          </label>
          <ImagePickerField
            name="adversaire2_logo"
            label={
              values.adversaire2_logo_url
                ? "Remplacer le logo du 2e adversaire"
                : "Logo du 2e adversaire (optionnel)"
            }
            aspect={1}
          />
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-medium">
              Score US Baumoise
              <input
                type="number"
                name="score_us2"
                min={0}
                defaultValue={values.score_us2}
                className="mt-1 w-full rounded border border-black/20 px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium">
              Score adversaire 2
              <input
                type="number"
                name="score_adverse2"
                min={0}
                defaultValue={values.score_adverse2}
                className="mt-1 w-full rounded border border-black/20 px-3 py-2"
              />
            </label>
          </div>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="domicile" defaultChecked={values.domicile} />À domicile
      </label>

      <label className="block text-sm font-medium">
        Date et heure
        <input
          type="datetime-local"
          name="date_match"
          defaultValue={values.date_match}
          required
          className="mt-1 w-full rounded border border-black/20 px-3 py-2"
        />
      </label>

      <label className="block text-sm font-medium">
        Lieu (optionnel)
        <input
          type="text"
          name="lieu"
          defaultValue={values.lieu}
          className="mt-1 w-full rounded border border-black/20 px-3 py-2"
        />
      </label>

      <label className="block text-sm font-medium">
        Compétition (optionnel)
        <input
          type="text"
          name="competition"
          defaultValue={values.competition}
          className="mt-1 w-full rounded border border-black/20 px-3 py-2"
        />
      </label>

      <ImagePickerField
        name="affiche"
        label={values.affiche_url ? "Remplacer l'affiche du match" : "Affiche du match (optionnelle)"}
      />

      {mode !== "tournoi" && (
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm font-medium">
            Score US Baumoise
            <input
              type="number"
              name="score_us"
              min={0}
              defaultValue={values.score_us}
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Score adverse
            <input
              type="number"
              name="score_adverse"
              min={0}
              defaultValue={values.score_adverse}
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
          </label>
        </div>
      )}

      <p className="text-xs text-foreground/50">
        Laisse les scores vides pour un match pas encore joué. La composition se règle après
        création, sur la page du match.
      </p>
    </>
  );
}
