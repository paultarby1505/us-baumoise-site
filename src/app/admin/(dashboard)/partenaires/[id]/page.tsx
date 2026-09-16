import Image from "next/image";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { updatePartenaire, deletePartenaire } from "@/app/admin/actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import ImagePickerField from "@/components/ImagePickerField";

export default async function EditPartenairePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data: partenaire } = await supabase
    .from("partenaires")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!partenaire) notFound();

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Modifier le partenaire</h1>
      {error && (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {partenaire.logo_url && (
        <div className="relative mt-4 h-20 w-20 overflow-hidden rounded border border-black/10 bg-white">
          <Image src={partenaire.logo_url} alt="" fill className="object-contain p-1" sizes="80px" />
        </div>
      )}

      <form action={updatePartenaire.bind(null, id)} className="mt-6 max-w-md space-y-4">
        <label className="block text-sm font-medium">
          Nom
          <input
            type="text"
            name="nom"
            defaultValue={partenaire.nom}
            required
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <ImagePickerField
          name="logo"
          label={partenaire.logo_url ? "Remplacer le logo" : "Logo (optionnel)"}
          helpText="Cadrage libre : garde la forme naturelle du logo (large, carré, haut...)."
        />
        <label className="block text-sm font-medium">
          Résumé (une phrase, affichée sur la liste)
          <input
            type="text"
            name="resume"
            defaultValue={partenaire.resume ?? ""}
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Description (affichée sur la fiche du partenaire)
          <textarea
            name="description"
            rows={6}
            defaultValue={partenaire.description ?? ""}
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Site web (optionnel)
          <input
            type="url"
            name="site_url"
            defaultValue={partenaire.site_url ?? ""}
            placeholder="https://…"
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Ordre d&apos;affichage (les plus petits nombres en premier)
          <input
            type="number"
            name="ordre"
            defaultValue={partenaire.ordre}
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded bg-club-gold px-4 py-2 font-semibold text-black hover:bg-club-gold-light"
        >
          Enregistrer
        </button>
      </form>
      <form action={deletePartenaire.bind(null, id)} className="mt-4 max-w-md">
        <ConfirmSubmitButton
          confirmMessage={`Supprimer ${partenaire.nom} ?`}
          className="text-sm text-red-600 hover:underline"
        >
          Supprimer ce partenaire
        </ConfirmSubmitButton>
      </form>
    </div>
  );
}
