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

function OpposantRow({
  nom,
  logo,
  scoreUs,
  scoreAdverse,
}: {
  nom: string;
  logo: string | null;
  scoreUs: number | null;
  scoreAdverse: number | null;
}) {
  const joue = scoreUs !== null && scoreAdverse !== null;
  return (
    <div className="mt-1 flex items-center justify-between gap-2">
      <span className="font-semibold">{siteConfig.shortName}</span>
      {joue ? (
        <span className="font-bold text-club-gold">
          {scoreUs} - {scoreAdverse}
        </span>
      ) : (
        <span className="text-sm text-foreground/50">vs</span>
      )}
      <span className="flex items-center gap-2 font-semibold">
        {logo && (
          <Image
            src={logo}
            alt={`Logo ${nom}`}
            width={24}
            height={24}
            className="h-6 w-6 shrink-0 rounded-full object-cover"
          />
        )}
        {nom}
      </span>
    </div>
  );
}

export default function MatchCard({ match }: { match: Match }) {
  const joue = match.score_us !== null && match.score_adverse !== null;
  const isTriangulaire = Boolean(match.adversaire && match.adversaire2);
  const isTournoi = !match.adversaire;

  return (
    <Link
      href={`/matchs/${match.id}`}
      className="block rounded-lg border border-black/10 p-5 transition-shadow hover:shadow-md"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-wide text-club-gold">
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

      {isTournoi ? (
        <p className="mt-2 font-semibold">{match.nom_tournoi || "Plateau / tournoi"}</p>
      ) : isTriangulaire ? (
        <div className="mt-2">
          {match.nom_tournoi && (
            <p className="text-xs font-semibold text-foreground/50">{match.nom_tournoi}</p>
          )}
          <OpposantRow
            nom={match.adversaire!}
            logo={match.adversaire_logo_url}
            scoreUs={match.score_us}
            scoreAdverse={match.score_adverse}
          />
          <OpposantRow
            nom={match.adversaire2!}
            logo={match.adversaire2_logo_url}
            scoreUs={match.score_us2}
            scoreAdverse={match.score_adverse2}
          />
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="flex items-center gap-2 font-semibold">
            {!match.domicile && match.adversaire_logo_url && (
              <Image
                src={match.adversaire_logo_url}
                alt={`Logo ${match.adversaire}`}
                width={24}
                height={24}
                className="h-6 w-6 shrink-0 rounded-full object-cover"
              />
            )}
            {match.domicile ? siteConfig.shortName : match.adversaire}
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
            {match.domicile ? match.adversaire : siteConfig.shortName}
            {match.domicile && match.adversaire_logo_url && (
              <Image
                src={match.adversaire_logo_url}
                alt={`Logo ${match.adversaire}`}
                width={24}
                height={24}
                className="h-6 w-6 shrink-0 rounded-full object-cover"
              />
            )}
          </span>
        </div>
      )}

      {match.lieu && (
        <p className="mt-2 text-sm text-foreground/60">{match.lieu}</p>
      )}
    </Link>
  );
}
