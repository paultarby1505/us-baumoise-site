import Image from "next/image";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { updateJoueur, deleteJoueur } from "@/app/admin/actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import { CATEGORIES, POSTES } from "@/lib/rugby";

export default async function EditJoueurPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data: joueur } = await supabase
    .from("joueurs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!joueur) notFound();

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Modifier le joueur</h1>
      {error && (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {joueur.photo_url && (
        <div className="relative mt-4 h-32 w-32 overflow-hidden rounded-lg border border-black/10">
          <Image
            src={joueur.photo_url}
            alt=""
            fill
            className="object-cover"
            sizes="128px"
          />
        </div>
      )}

      <form action={updateJoueur.bind(null, id)} className="mt-6 max-w-md space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm font-medium">
            Prénom
            <input
              type="text"
              name="prenom"
              defaultValue={joueur.prenom}
              required
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Nom
            <input
              type="text"
              name="nom"
              defaultValue={joueur.nom}
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
              defaultValue={joueur.numero ?? ""}
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Catégorie
            <select
              name="categorie"
              defaultValue={joueur.categorie}
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
            defaultValue={joueur.poste ?? ""}
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
          {joueur.photo_url ? "Remplacer la photo" : "Photo (optionnelle)"}
          <input
            type="file"
            name="photo"
            accept="image/*"
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
      <form action={deleteJoueur.bind(null, id)} className="mt-4 max-w-md">
        <ConfirmSubmitButton
          confirmMessage={`Supprimer ${joueur.prenom} ${joueur.nom} ?`}
          className="text-sm text-red-600 hover:underline"
        >
          Supprimer ce joueur
        </ConfirmSubmitButton>
      </form>
    </div>
  );
}
