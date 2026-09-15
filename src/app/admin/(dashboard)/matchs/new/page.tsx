import { createMatch } from "@/app/admin/actions";
import { CATEGORIES } from "@/lib/rugby";
import ImagePickerField from "@/components/ImagePickerField";

export default async function NewMatchPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Nouveau match</h1>
      {error && (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      <form action={createMatch} className="mt-6 max-w-md space-y-4">
        <label className="block text-sm font-medium">
          Adversaire
          <input
            type="text"
            name="adversaire"
            required
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <ImagePickerField
          name="adversaire_logo"
          label="Logo de l'adversaire (optionnel)"
          aspect={1}
        />
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="domicile" defaultChecked />À domicile
        </label>
        <label className="block text-sm font-medium">
          Catégorie
          <select
            name="categorie"
            defaultValue="Seniors"
            required
            className="mt-1 w-full rounded border border-black/20 bg-white px-3 py-2"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Date et heure
          <input
            type="datetime-local"
            name="date_match"
            required
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Lieu (optionnel)
          <input
            type="text"
            name="lieu"
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Compétition (optionnel)
          <input
            type="text"
            name="competition"
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <ImagePickerField name="affiche" label="Affiche du match (optionnelle)" />
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm font-medium">
            Score US Baumoise
            <input
              type="number"
              name="score_us"
              min={0}
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Score adverse
            <input
              type="number"
              name="score_adverse"
              min={0}
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
          </label>
        </div>
        <p className="text-xs text-foreground/50">
          Laisse les scores vides pour un match pas encore joué. La composition se règle
          après création, sur la page du match.
        </p>
        <button
          type="submit"
          className="rounded bg-club-gold px-4 py-2 font-semibold text-black hover:bg-club-gold-light"
        >
          Ajouter
        </button>
      </form>
    </div>
  );
}
