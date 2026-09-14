import { createActualite } from "@/app/admin/actions";
import ImagePickerField from "@/components/ImagePickerField";

export default async function NewActualitePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Nouvelle actualité</h1>
      {error && (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      <form action={createActualite} className="mt-6 max-w-xl space-y-4">
        <label className="block text-sm font-medium">
          Titre
          <input
            type="text"
            name="titre"
            required
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Extrait (résumé court, optionnel)
          <textarea
            name="extrait"
            rows={2}
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Contenu
          <textarea
            name="contenu"
            required
            rows={10}
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <ImagePickerField name="image" label="Photo (optionnelle)" />
        <button
          type="submit"
          className="rounded bg-club-gold px-4 py-2 font-semibold text-black hover:bg-club-gold-light"
        >
          Publier
        </button>
      </form>
    </div>
  );
}
