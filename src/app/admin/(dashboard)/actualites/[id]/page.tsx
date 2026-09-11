import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { updateActualite, deleteActualite } from "@/app/admin/actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";

export default async function EditActualitePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data: actualite } = await supabase
    .from("actualites")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!actualite) notFound();

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Modifier l&apos;actualité</h1>
      {error && (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      <form action={updateActualite.bind(null, id)} className="mt-6 max-w-xl space-y-4">
        <label className="block text-sm font-medium">
          Titre
          <input
            type="text"
            name="titre"
            defaultValue={actualite.titre}
            required
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Extrait (résumé court, optionnel)
          <textarea
            name="extrait"
            rows={2}
            defaultValue={actualite.extrait ?? ""}
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Contenu
          <textarea
            name="contenu"
            required
            rows={10}
            defaultValue={actualite.contenu}
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="rounded bg-club-gold px-4 py-2 font-semibold text-black hover:bg-club-gold-light"
          >
            Enregistrer
          </button>
        </div>
      </form>
      <form action={deleteActualite.bind(null, id)} className="mt-4 max-w-xl">
        <ConfirmSubmitButton
          confirmMessage={`Supprimer l'actualité "${actualite.titre}" ?`}
          className="text-sm text-red-600 hover:underline"
        >
          Supprimer cette actualité
        </ConfirmSubmitButton>
      </form>
    </div>
  );
}
