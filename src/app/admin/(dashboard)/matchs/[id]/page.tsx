import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { updateMatch, deleteMatch } from "@/app/admin/actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";

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
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data: match } = await supabase
    .from("matchs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!match) notFound();

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Modifier le match</h1>
      {error && (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
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
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="domicile" defaultChecked={match.domicile} />À domicile
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
          Laisse les scores vides pour un match pas encore joué.
        </p>
        <button
          type="submit"
          className="rounded bg-club-gold px-4 py-2 font-semibold text-black hover:bg-club-gold-light"
        >
          Enregistrer
        </button>
      </form>
      <form action={deleteMatch.bind(null, id)} className="mt-4 max-w-md">
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
