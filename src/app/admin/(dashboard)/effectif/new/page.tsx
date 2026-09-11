import { createJoueur } from "@/app/admin/actions";
import { CATEGORIES, POSTES } from "@/lib/rugby";

export default async function NewJoueurPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Nouveau joueur</h1>
      {error && (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      <form action={createJoueur} className="mt-6 max-w-md space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm font-medium">
            Prénom
            <input
              type="text"
              name="prenom"
              required
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Nom
            <input
              type="text"
              name="nom"
              required
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm font-medium">
            Numéro (optionnel)
            <input
              type="number"
              name="numero"
              min={0}
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
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
        </div>
        <label className="block text-sm font-medium">
          Poste (optionnel)
          <select
            name="poste"
            defaultValue=""
            className="mt-1 w-full rounded border border-black/20 bg-white px-3 py-2"
          >
            <option value="">— Non renseigné —</option>
            {POSTES.map((poste) => (
              <option key={poste} value={poste}>
                {poste}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Photo (optionnelle)
          <input
            type="file"
            name="photo"
            accept="image/*"
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
          <span className="mt-1 block text-xs text-foreground/50">
            Si aucune photo n&apos;est fournie, une silhouette par défaut sera affichée.
          </span>
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
