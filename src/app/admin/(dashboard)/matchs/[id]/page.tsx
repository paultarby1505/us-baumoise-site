import Image from "next/image";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getJoueurs, getMatchComposition } from "@/lib/queries";
import { updateMatch, deleteMatch } from "@/app/admin/actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import ImagePickerField from "@/components/ImagePickerField";
import CompositionBuilder from "@/components/CompositionBuilder";
import { CATEGORIES, categoryRank } from "@/lib/rugby";

function toDatetimeLocal(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export default async function EditMatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { id } = await params;
  const { error, success } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data: match } = await supabase
    .from("matchs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!match) notFound();

  const [allJoueurs, composition] = await Promise.all([getJoueurs(), getMatchComposition(id)]);
  const joueurs = [...allJoueurs].sort((a, b) => {
    const memeCategorie =
      (a.categorie === match.categorie ? 0 : 1) - (b.categorie === match.categorie ? 0 : 1);
    if (memeCategorie !== 0) return memeCategorie;
    return categoryRank(a.categorie) - categoryRank(b.categorie);
  });
  const initialComposition = composition.map((c) => ({ slot: c.slot, joueur_id: c.joueur.id }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Modifier le match</h1>
        <a href="#composition" className="text-sm text-club-gold hover:underline">
          Aller à la composition →
        </a>
      </div>
      {error && (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      {success === "composition" && (
        <p className="mt-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Composition enregistrée.
        </p>
      )}

      {match.adversaire_logo_url && (
        <div className="relative mt-4 h-16 w-16 overflow-hidden rounded-full border border-black/10">
          <Image src={match.adversaire_logo_url} alt="" fill className="object-cover" sizes="64px" />
        </div>
      )}

      <form action={updateMatch.bind(null, id)} className="mt-6 max-w-md space-y-4">
        <label className="block text-sm font-medium">
          Adversaire
          <input
            type="text"
            name="adversaire"
            defaultValue={match.adversaire}
            required
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <ImagePickerField
          name="adversaire_logo"
          label={match.adversaire_logo_url ? "Remplacer le logo de l'adversaire" : "Logo de l'adversaire (optionnel)"}
          aspect={1}
        />
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="domicile" defaultChecked={match.domicile} />À domicile
        </label>
        <label className="block text-sm font-medium">
          Catégorie
          <select
            name="categorie"
            defaultValue={match.categorie}
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
        <label className="block text-sm font-medium">
          Date et heure
          <input
            type="datetime-local"
            name="date_match"
            defaultValue={toDatetimeLocal(match.date_match)}
            required
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Lieu (optionnel)
          <input
            type="text"
            name="lieu"
            defaultValue={match.lieu ?? ""}
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Compétition (optionnel)
          <input
            type="text"
            name="competition"
            defaultValue={match.competition ?? ""}
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <ImagePickerField
          name="affiche"
          label={match.affiche_url ? "Remplacer l'affiche du match" : "Affiche du match (optionnelle)"}
        />
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm font-medium">
            Score US Baumoise
            <input
              type="number"
              name="score_us"
              min={0}
              defaultValue={match.score_us ?? ""}
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Score adverse
            <input
              type="number"
              name="score_adverse"
              min={0}
              defaultValue={match.score_adverse ?? ""}
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
          </label>
        </div>
        <p className="text-xs text-foreground/50">
          Laisse les scores vides pour un match pas encore joué. Renseigne-les une fois le
          match terminé pour afficher le résultat.
        </p>
        <button
          type="submit"
          className="rounded bg-club-gold px-4 py-2 font-semibold text-black hover:bg-club-gold-light"
        >
          Enregistrer
        </button>
      </form>

      <div id="composition" className="mt-10 scroll-mt-6">
        <h2 className="text-lg font-bold">Composition</h2>
        <p className="mt-1 text-xs text-foreground/50">
          Tant qu&apos;aucun joueur n&apos;est placé, le site public affiche « Composition à
          venir ».
        </p>
        {joueurs.length > 0 ? (
          <div className="mt-4">
            <CompositionBuilder matchId={id} joueurs={joueurs} initial={initialComposition} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-foreground/60">
            Aucun joueur dans l&apos;effectif pour composer une équipe.
          </p>
        )}
      </div>

      <form action={deleteMatch.bind(null, id)} className="mt-8 max-w-md">
        <ConfirmSubmitButton
          confirmMessage="Supprimer ce match ?"
          className="text-sm text-red-600 hover:underline"
        >
          Supprimer ce match
        </ConfirmSubmitButton>
      </form>
    </div>
  );
}
