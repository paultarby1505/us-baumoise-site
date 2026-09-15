import { createPartenaire } from "@/app/admin/actions";
import ImagePickerField from "@/components/ImagePickerField";

export default async function NewPartenairePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Nouveau partenaire</h1>
      {error && (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      <form action={createPartenaire} className="mt-6 max-w-md space-y-4">
        <label className="block text-sm font-medium">
          Nom
          <input
            type="text"
            name="nom"
            required
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <ImagePickerField name="logo" label="Logo (optionnel)" aspect={1} />
        <label className="block text-sm font-medium">
          Résumé (une phrase, affichée sur la liste)
          <input
            type="text"
            name="resume"
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Description (affichée sur la fiche du partenaire)
          <textarea
            name="description"
            rows={6}
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Site web (optionnel)
          <input
            type="url"
            name="site_url"
            placeholder="https://…"
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Ordre d&apos;affichage (les plus petits nombres en premier)
          <input
            type="number"
            name="ordre"
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
