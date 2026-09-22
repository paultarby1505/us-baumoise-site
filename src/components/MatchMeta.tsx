import { HouseIcon, BusIcon } from "@/components/MatchTypeIcons";
import { formatParis } from "@/lib/date-fr";
import type { Match } from "@/lib/types";

function formatDate(iso: string) {
  return formatParis(iso, {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Bandeau « catégorie · compétition — date — domicile/extérieur » affiché en
 * haut d'une carte de match comme de la fiche d'un match.
 *
 * La date écrite en toutes lettres est trop longue pour tenir sur la même
 * ligne que le reste sur un téléphone : elle débordait de l'écran. Sur mobile
 * les trois blocs sont donc en `flex-wrap`, la date passant sur sa propre
 * ligne ; la grille en trois colonnes ne reprend qu'à partir de `sm`.
 */
export default function MatchMeta({ match }: { match: Match }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-wide text-club-gold sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
      <span className="min-w-0 break-words">
        {match.categorie}
        {match.competition ? ` · ${match.competition}` : ""}
      </span>
      <span className="order-last w-full text-center text-sm sm:order-none sm:w-auto sm:whitespace-nowrap">
        {formatDate(match.date_match)}
      </span>
      <span className="flex shrink-0 items-center gap-1 normal-case sm:justify-end">
        {match.domicile ? <HouseIcon /> : <BusIcon />}
        {match.domicile ? "Domicile" : "Extérieur"}
      </span>
    </div>
  );
}
