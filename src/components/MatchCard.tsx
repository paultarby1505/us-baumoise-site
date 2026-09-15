import Image from "next/image";
import Link from "next/link";
import type { Match } from "@/lib/types";
import { siteConfig } from "@/lib/config";
import { HouseIcon, BusIcon } from "@/components/MatchTypeIcons";

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
  const adversaireLogo = match.adversaire_logo_url;
  const joue = match.score_us !== null && match.score_adverse !== null;

  return (
    <Link
      href={`/matchs/${match.id}`}
      className="block rounded-lg border border-black/10 p-5 transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-club-gold">
        <span>
          {match.categorie}
          {match.competition ? ` · ${match.competition}` : ""}
        </span>
        <span className="flex items-center gap-1 normal-case text-foreground/50">
          {match.domicile ? <HouseIcon /> : <BusIcon />}
          {match.domicile ? "Domicile" : "Extérieur"}
        </span>
      </div>
      <p className="mt-1 text-xs text-foreground/50">{formatDate(match.date_match)}</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-semibold">
          {!match.domicile && adversaireLogo && (
            <Image
              src={adversaireLogo}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 rounded-full object-cover"
            />
          )}
          {domicileLabel}
        </span>
        {joue ? (
          <span className="font-bold text-club-gold">
            {match.domicile ? match.score_us : match.score_adverse} -{" "}
            {match.domicile ? match.score_adverse : match.score_us}
          </span>
        ) : (
          <span className="text-sm text-foreground/50">vs</span>
        )}
        <span className="flex items-center gap-2 font-semibold">
          {exterieurLabel}
          {match.domicile && adversaireLogo && (
            <Image
              src={adversaireLogo}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 rounded-full object-cover"
            />
          )}
        </span>
      </div>
      {match.lieu && (
        <p className="mt-2 text-sm text-foreground/60">{match.lieu}</p>
      )}
    </Link>
  );
}
