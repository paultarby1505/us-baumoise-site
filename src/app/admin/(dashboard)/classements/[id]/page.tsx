import Image from "next/image";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { updateClassement, deleteClassement } from "@/app/admin/actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import ImagePickerField from "@/components/ImagePickerField";
import { MATCH_CATEGORIES } from "@/lib/rugby";

export default async function EditClassementPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data: ligne } = await supabase
    .from("classements")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!ligne) notFound();

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Modifier la ligne de classement</h1>
      {error && (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {ligne.logo_url && (
        <div className="relative mt-4 h-20 w-20 overflow-hidden rounded border border-black/10 bg-white">
          <Image src={ligne.logo_url} alt="" fill className="object-contain p-1" sizes="80px" />
        </div>
      )}

      <form action={updateClassement.bind(null, id)} className="mt-6 max-w-md space-y-4">
        <label className="block text-sm font-medium">
          Catégorie
          <select
            name="categorie"
            defaultValue={ligne.categorie}
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
            defaultValue={ligne.equipe}
            required
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="notre_club" defaultChecked={ligne.notre_club} />
          C&apos;est notre club
        </label>
        <ImagePickerField
          name="logo"
          label={ligne.logo_url ? "Remplacer le logo" : "Logo (optionnel)"}
          aspect={1}
        />
        <p className="text-xs text-foreground/50">
          Pas besoin de définir un ordre : le classement se trie automatiquement (points, puis
          différence, puis points marqués) à chaque enregistrement.
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <label className="block text-sm font-medium">
            J
            <input
              type="number"
              name="joues"
              min={0}
              defaultValue={ligne.joues}
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            G
            <input
              type="number"
              name="gagnes"
              min={0}
              defaultValue={ligne.gagnes}
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            N
            <input
              type="number"
              name="nuls"
              min={0}
              defaultValue={ligne.nuls}
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            P
            <input
              type="number"
              name="perdus"
              min={0}
              defaultValue={ligne.perdus}
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
              defaultValue={ligne.points_marques}
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Points encaissés
            <input
              type="number"
              name="points_encaisses"
              min={0}
              defaultValue={ligne.points_encaisses}
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
            defaultValue={ligne.points_classement}
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
      <form action={deleteClassement.bind(null, id)} className="mt-4 max-w-md">
        <ConfirmSubmitButton
          confirmMessage={`Supprimer ${ligne.equipe} ?`}
          className="text-sm text-red-600 hover:underline"
        >
          Supprimer cette ligne
        </ConfirmSubmitButton>
      </form>
    </div>
  );
}
