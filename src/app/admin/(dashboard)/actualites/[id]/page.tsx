import Image from "next/image";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getActualitePhotos } from "@/lib/queries";
import {
  updateActualite,
  deleteActualite,
  deleteActualitePhoto,
} from "@/app/admin/actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import ImagePickerField from "@/components/ImagePickerField";
import MultiImagePickerField from "@/components/MultiImagePickerField";

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

  const photos = await getActualitePhotos(id);

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
        <ImagePickerField
          name="image"
          label={actualite.image_url ? "Remplacer la photo de couverture" : "Photo de couverture (optionnelle)"}
          aspect={16 / 9}
        />
        <MultiImagePickerField
          name="photos"
          label="Ajouter des photos à la galerie de cet article"
          helpText="Elles s'ajoutent à celles déjà présentes ci-dessous."
          aspect={1}
        />
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="rounded bg-club-gold px-4 py-2 font-semibold text-black hover:bg-club-gold-light"
          >
            Enregistrer
          </button>
        </div>
      </form>

      {photos.length > 0 && (
        <div className="mt-8 max-w-xl">
          <h2 className="text-sm font-semibold">Photos de la galerie ({photos.length})</h2>
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative aspect-square overflow-hidden rounded border border-black/10">
                <Image src={photo.url} alt="" fill className="object-cover" sizes="150px" />
                <form
                  action={deleteActualitePhoto.bind(null, photo.id, id)}
                  className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/50 group-hover:opacity-100"
                >
                  <ConfirmSubmitButton
                    confirmMessage="Retirer cette photo de la galerie ?"
                    className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white"
                  >
                    Retirer
                  </ConfirmSubmitButton>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      <form action={deleteActualite.bind(null, id)} className="mt-8 max-w-xl">
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
