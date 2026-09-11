import type { Match } from "@/lib/types";
import { siteConfig } from "@/lib/config";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MatchCard({ match }: { match: Match }) {
  const domicileLabel = match.domicile ? siteConfig.shortName : match.adversaire;
  const exterieurLabel = match.domicile ? match.adversaire : siteConfig.shortName;
  const joue = match.score_us !== null && match.score_adverse !== null;

  return (
    <div className="rounded-lg border border-black/10 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-club-green">
        {match.competition ?? "Match"} — {formatDate(match.date_match)}
      </p>
      <div className="mt-2 flex items-center justify-between gap-4">
        <span className="font-semibold">{domicileLabel}</span>
        {joue ? (
          <span className="font-bold text-club-green">
            {match.domicile ? match.score_us : match.score_adverse} -{" "}
            {match.domicile ? match.score_adverse : match.score_us}
          </span>
        ) : (
          <span className="text-sm text-foreground/50">vs</span>
        )}
        <span className="font-semibold">{exterieurLabel}</span>
      </div>
      {match.lieu && (
        <p className="mt-2 text-sm text-foreground/60">{match.lieu}</p>
      )}
    </div>
  );
}
