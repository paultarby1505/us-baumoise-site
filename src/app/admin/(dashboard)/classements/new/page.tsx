import { createClassement } from "@/app/admin/actions";
import ImagePickerField from "@/components/ImagePickerField";
import { MATCH_CATEGORIES } from "@/lib/rugby";

export default async function NewClassementPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Nouvelle ligne de classement</h1>
      {error && (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      <form action={createClassement} className="mt-6 max-w-md space-y-4">
        <label className="block text-sm font-medium">
          Catégorie
          <select
            name="categorie"
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
        <label className="block text-sm font-medium">
          Équipe
          <input
            type="text"
            name="equipe"
            required
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="notre_club" />
          C&apos;est notre club
        </label>
        <ImagePickerField name="logo" label="Logo (optionnel)" aspect={1} />
        <p className="text-xs text-foreground/50">
          Pas besoin de définir un ordre : le classement se trie automatiquement (points, puis
          différence, puis points marqués) à chaque enregistrement.
        </p>
        <div className="grid grid-cols-4 gap-4">
          <label className="block text-sm font-medium">
            J
            <input
              type="number"
              name="joues"
              min={0}
              defaultValue={0}
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            G
            <input
              type="number"
              name="gagnes"
              min={0}
              defaultValue={0}
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            N
            <input
              type="number"
              name="nuls"
              min={0}
              defaultValue={0}
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            P
            <input
              type="number"
              name="perdus"
              min={0}
              defaultValue={0}
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm font-medium">
            Points marqués
            <input
              type="number"
              name="points_marques"
              min={0}
              defaultValue={0}
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Points encaissés
            <input
              type="number"
              name="points_encaisses"
              min={0}
              defaultValue={0}
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
          </label>
        </div>
        <label className="block text-sm font-medium">
          Points au classement
          <input
            type="number"
            name="points_classement"
            min={0}
            defaultValue={0}
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
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
