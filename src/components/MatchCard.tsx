import Image from "next/image";
import Link from "next/link";
import type { Match } from "@/lib/types";
import { siteConfig } from "@/lib/config";
import MatchMeta from "@/components/MatchMeta";
import ScoreDuel from "@/components/ScoreDuel";

function LogoCluster({ logos, alt }: { logos: string[]; alt: string }) {
  if (logos.length === 0) return null;
  return (
    <span className="flex max-w-full flex-wrap items-center justify-center gap-1">
      {logos.map((url) => (
        <Image
          key={url}
          src={url}
          alt={alt}
          width={24}
          height={24}
          className="h-6 w-6 shrink-0 rounded-full object-cover"
        />
      ))}
    </span>
  );
}

function EquipeColonne({ nom, logos }: { nom: string; logos: string[] }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1 text-center text-sm font-semibold sm:text-base">
      <LogoCluster logos={logos} alt={`Logo ${nom}`} />
      <span className="min-w-0 break-words hyphens-auto">{nom}</span>
    </div>
  );
}

function OpposantRow({
  nom,
  logos,
  scoreUs,
  scoreAdverse,
}: {
  nom: string;
  logos: string[];
  scoreUs: number | null;
  scoreAdverse: number | null;
}) {
  return (
    <div className="mt-1 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2">
      <EquipeColonne nom={siteConfig.shortName} logos={["/logo.png"]} />
      <div className="pt-1">
        <ScoreDuel scoreGauche={scoreUs} scoreDroite={scoreAdverse} />
      </div>
      <EquipeColonne nom={nom} logos={logos} />
    </div>
  );
}

export default function MatchCard({ match }: { match: Match }) {
  const isTriangulaire = Boolean(match.adversaire && match.adversaire2);
  const isTournoi = !match.adversaire;

  const domicileNom = match.domicile ? siteConfig.shortName : match.adversaire!;
  const exterieurNom = match.domicile ? match.adversaire! : siteConfig.shortName;
  const domicileLogos = match.domicile ? ["/logo.png"] : match.adversaire_logos;
  const exterieurLogos = match.domicile ? match.adversaire_logos : ["/logo.png"];

  return (
    <Link
      href={`/matchs/${match.id}`}
      className="block rounded-lg border-2 border-black p-5 transition-shadow hover:shadow-md"
    >
      <MatchMeta match={match} />

      {isTournoi ? (
        <div className="mt-2 flex flex-col items-center gap-2 text-center">
          {match.adversaire_logos.length > 0 && (
            <span className="flex items-center gap-1">
              {match.adversaire_logos.map((url) => (
                <Image
                  key={url}
                  src={url}
                  alt={match.nom_tournoi ? `Logo ${match.nom_tournoi}` : "Logo du tournoi"}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ))}
            </span>
          )}
          <p className="font-semibold">{match.nom_tournoi || "Plateau / tournoi"}</p>
        </div>
      ) : isTriangulaire ? (
        <div className="mt-2">
          {match.nom_tournoi && (
            <p className="text-xs font-semibold text-foreground/50">{match.nom_tournoi}</p>
          )}
          <OpposantRow
            nom={match.adversaire!}
            logos={match.adversaire_logos}
            scoreUs={match.score_us}
            scoreAdverse={match.score_adverse}
          />
          <OpposantRow
            nom={match.adversaire2!}
            logos={match.adversaire2_logos}
            scoreUs={match.score_us2}
            scoreAdverse={match.score_adverse2}
          />
        </div>
      ) : (
        <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2">
          <EquipeColonne nom={domicileNom} logos={domicileLogos} />
          <div className="pt-1">
            <ScoreDuel
              scoreGauche={match.domicile ? match.score_us : match.score_adverse}
              scoreDroite={match.domicile ? match.score_adverse : match.score_us}
            />
          </div>
          <EquipeColonne nom={exterieurNom} logos={exterieurLogos} />
        </div>
      )}

      {match.lieu && (
        <p className="mt-2 break-words text-center text-sm font-semibold text-club-gold">
          {match.lieu}
        </p>
      )}
    </Link>
  );
}
