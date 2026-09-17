import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { deleteMatch } from "@/app/admin/actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import type { Match } from "@/lib/types";
import { formatParis } from "@/lib/date-fr";

export default async function AdminMatchsPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("matchs")
    .select("*")
    .order("date_match", { ascending: false });
  const matchs = (data ?? []) as Match[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Matchs</h1>
        <Link
          href="/admin/matchs/new"
          className="rounded bg-club-gold px-4 py-2 text-sm font-semibold text-black hover:bg-club-gold-light"
        >
          + Nouveau match
        </Link>
      </div>

      <div className="mt-6 divide-y divide-black/10 rounded-lg border border-black/10 bg-white">
        {matchs.map((match) => (
          <div key={match.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-semibold">
                {match.nom_tournoi
                  ? match.nom_tournoi
                  : match.adversaire
                    ? `${match.domicile ? "US Baumoise" : match.adversaire} vs ${
                        match.domicile ? match.adversaire : "US Baumoise"
                      }${
                        match.score_us !== null && match.score_adverse !== null
                          ? ` — ${match.domicile ? match.score_us : match.score_adverse}-${
                              match.domicile ? match.score_adverse : match.score_us
                            }`
                          : ""
                      }`
                    : "Plateau / tournoi"}
                {match.adversaire2 ? ` + ${match.adversaire2}` : ""}
              </p>
              <p className="text-xs text-foreground/50">
                {match.categorie} ·{" "}
                {formatParis(match.date_match, {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {match.competition ? ` · ${match.competition}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 gap-3 text-sm">
              <Link href={`/admin/matchs/${match.id}`} className="text-club-gold hover:underline">
                Modifier
              </Link>
              <form action={deleteMatch.bind(null, match.id)}>
                <ConfirmSubmitButton
                  confirmMessage="Supprimer ce match ?"
                  className="text-red-600 hover:underline"
                >
                  Supprimer
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
        {matchs.length === 0 && (
          <p className="p-4 text-sm text-foreground/60">Aucun match.</p>
        )}
      </div>
    </div>
  );
}
