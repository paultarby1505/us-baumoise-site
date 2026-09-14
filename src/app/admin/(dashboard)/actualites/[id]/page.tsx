import Image from "next/image";
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

      {actualite.image_url && (
        <div className="relative mt-4 h-40 w-full max-w-md overflow-hidden rounded-lg border border-black/10">
          <Image
            src={actualite.image_url}
            alt=""
            fill
            className="object-cover"
            sizes="400px"
          />
        </div>
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
        <label className="block text-sm font-medium">
          {actualite.image_url ? "Remplacer la photo" : "Photo (optionnelle)"}
          <input
            type="file"
            name="image"
            accept="image/*"
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
