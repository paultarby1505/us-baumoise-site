import Image from "next/image";
import { getSiteSettings } from "@/lib/queries";
import { updateHeroImage, removeHeroImage } from "@/app/admin/actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import ImagePickerField from "@/components/ImagePickerField";

export default async function ApparencePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Apparence</h1>
      <p className="mt-2 max-w-xl text-sm text-foreground/60">
        Photo affichée en fond de la bannière noire, sur la page d&apos;accueil.
      </p>

      {error && (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      {success && (
        <p className="mt-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Image mise à jour.
        </p>
      )}

      {settings?.hero_image_url && (
        <div className="relative mt-6 h-48 w-full max-w-xl overflow-hidden rounded-lg border border-black/10">
          <Image
            src={settings.hero_image_url}
            alt=""
            fill
            className="object-cover"
            sizes="600px"
          />
        </div>
      )}

      <form action={updateHeroImage} className="mt-6 max-w-md space-y-4">
        <ImagePickerField
          name="image"
          label={settings?.hero_image_url ? "Remplacer la photo" : "Choisir une photo"}
          required
          helpText="Une image large et pas trop chargée fonctionne mieux (le texte du site s'affiche par-dessus, avec un fond assombri automatique)."
        />
        <button
          type="submit"
          className="rounded bg-club-gold px-4 py-2 font-semibold text-black hover:bg-club-gold-light"
        >
          Enregistrer
        </button>
      </form>

      {settings?.hero_image_url && (
        <form action={removeHeroImage} className="mt-4 max-w-md">
          <ConfirmSubmitButton
            confirmMessage="Retirer la photo de fond et revenir au fond noir uni ?"
            className="text-sm text-red-600 hover:underline"
          >
            Retirer la photo (revenir au fond noir uni)
          </ConfirmSubmitButton>
        </form>
      )}
    </div>
  );
}
