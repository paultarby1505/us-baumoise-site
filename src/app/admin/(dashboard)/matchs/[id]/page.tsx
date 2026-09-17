import Image from "next/image";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getJoueurs, getMatchComposition } from "@/lib/queries";
import { updateMatch, deleteMatch } from "@/app/admin/actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import CompositionBuilder from "@/components/CompositionBuilder";
import MatchFormFields from "@/components/MatchFormFields";
import { categoryRank } from "@/lib/rugby";
import type { Match } from "@/lib/types";

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
  const { data } = await supabase.from("matchs").select("*").eq("id", id).maybeSingle();
  const match = data as Match | null;

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

      {(match.adversaire_logo_url || match.adversaire2_logo_url) && (
        <div className="mt-4 flex gap-4">
          {match.adversaire_logo_url && (
            <div className="relative h-16 w-16 overflow-hidden rounded-full border border-black/10">
              <Image src={match.adversaire_logo_url} alt="" fill className="object-cover" sizes="64px" />
            </div>
          )}
          {match.adversaire2_logo_url && (
            <div className="relative h-16 w-16 overflow-hidden rounded-full border border-black/10">
              <Image src={match.adversaire2_logo_url} alt="" fill className="object-cover" sizes="64px" />
            </div>
          )}
        </div>
      )}

      <form action={updateMatch.bind(null, id)} className="mt-6 max-w-md space-y-4">
        <MatchFormFields
          initial={{
            categorie: match.categorie,
            adversaire: match.adversaire ?? "",
            domicile: match.domicile,
            date_match: toDatetimeLocal(match.date_match),
            lieu: match.lieu ?? "",
            competition: match.competition ?? "",
            nom_tournoi: match.nom_tournoi ?? "",
            adversaire2: match.adversaire2 ?? "",
            score_us: match.score_us ?? "",
            score_adverse: match.score_adverse ?? "",
            score_us2: match.score_us2 ?? "",
            score_adverse2: match.score_adverse2 ?? "",
            adversaire_logo_url: match.adversaire_logo_url,
            adversaire2_logo_url: match.adversaire2_logo_url,
            affiche_url: match.affiche_url,
          }}
        />
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
