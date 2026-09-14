import Image from "next/image";
import { notFound } from "next/navigation";
import { getCategoriePage } from "@/lib/queries";
import { updateCategorieHeader, removeCategorieHeaderImage } from "@/app/admin/actions";
import { categoryFromSlug } from "@/lib/rugby";
import ImagePickerField from "@/components/ImagePickerField";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";

export default async function AdminCategorieHeaderPage({
  params,
  searchParams,
}: {
  params: Promise<{ categorie: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { categorie: slug } = await params;
  const categorie = categoryFromSlug(slug);
  if (!categorie) notFound();

  const { error, success } = await searchParams;
  const page = await getCategoriePage(categorie);

  return (
    <div>
      <h1 className="text-2xl font-extrabold">En-tête — {categorie}</h1>
      {error && (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      {success && (
        <p className="mt-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          En-tête mis à jour.
        </p>
      )}

      {page?.header_image_url && (
        <div className="relative mt-6 h-40 w-full max-w-xl overflow-hidden rounded-lg border border-black/10">
          <Image
            src={page.header_image_url}
            alt=""
            fill
            className="object-cover"
            sizes="600px"
          />
        </div>
      )}

      <form action={updateCategorieHeader.bind(null, categorie)} className="mt-6 max-w-md space-y-4">
        <label className="block text-sm font-medium">
          Titre affiché (optionnel)
          <input
            type="text"
            name="header_titre"
            defaultValue={page?.header_titre ?? ""}
            placeholder={categorie}
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Texte affiché (optionnel)
          <textarea
            name="header_texte"
            defaultValue={page?.header_texte ?? ""}
            rows={3}
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <ImagePickerField
          name="image"
          label={page?.header_image_url ? "Remplacer la photo" : "Photo d'en-tête (optionnelle)"}
          helpText="Sans photo, la catégorie garde le bandeau noir classique."
        />
        <button
          type="submit"
          className="rounded bg-club-gold px-4 py-2 font-semibold text-black hover:bg-club-gold-light"
        >
          Enregistrer
        </button>
      </form>

      {page?.header_image_url && (
        <form action={removeCategorieHeaderImage.bind(null, categorie)} className="mt-4 max-w-md">
          <ConfirmSubmitButton
            confirmMessage="Retirer la photo d'en-tête et revenir au bandeau noir ?"
            className="text-sm text-red-600 hover:underline"
          >
            Retirer la photo (revenir au bandeau noir)
          </ConfirmSubmitButton>
        </form>
      )}
    </div>
  );
}
