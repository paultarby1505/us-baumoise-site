import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMatch, getMatchComposition } from "@/lib/queries";
import { siteConfig } from "@/lib/config";
import MatchLogos from "@/components/MatchLogos";
import MatchMeta from "@/components/MatchMeta";
import CompositionPitch from "@/components/CompositionPitch";
import MatchTabs from "@/components/MatchTabs";
import { formatParis } from "@/lib/date-fr";
import ScoreDuel from "@/components/ScoreDuel";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return formatParis(iso, {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const match = await getMatch(id);
  if (!match) return {};
  const titre = match.adversaire
    ? `${siteConfig.shortName} vs ${match.adversaire}`
    : match.nom_tournoi || `${siteConfig.shortName} — ${match.categorie}`;
  return {
    title: titre,
    description: `Match ${match.categorie} du ${formatDate(match.date_match)}${
      match.lieu ? ` à ${match.lieu}` : ""
    }.`,
  };
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await getMatch(id);
  if (!match) notFound();

  const composition = await getMatchComposition(id);

  const isTournoi = !match.adversaire;
  const isTriangulaire = Boolean(match.adversaire && match.adversaire2);

  const domicileNom = match.domicile ? siteConfig.shortName : match.adversaire;
  const exterieurNom = match.domicile ? match.adversaire : siteConfig.shortName;
  const domicileLogos = match.domicile ? ["/logo.png"] : match.adversaire_logos;
  const exterieurLogos = match.domicile ? match.adversaire_logos : ["/logo.png"];

  const infoTab = (
    <div>
      {match.affiche_url ? (
        <div className="overflow-hidden rounded-lg border border-black/10">
          <Image
            src={match.affiche_url}
            alt="Affiche du match"
            width={1000}
            height={1400}
            className="h-auto w-full"
          />
        </div>
      ) : (
        <p className="text-foreground/60">Pas d&apos;affiche pour ce match.</p>
      )}
    </div>
  );

  const compositionTab =
    composition.length > 0 ? (
      <CompositionPitch composition={composition} />
    ) : (
      <p className="text-foreground/60">
        Composition à venir, reste à l&apos;affût !
      </p>
    );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/matchs"
        className="text-xs font-semibold uppercase tracking-wide text-club-gold hover:underline"
      >
        ← Calendrier des matchs
      </Link>

      <div className="mt-4 rounded-lg border-2 border-black p-6">
        <MatchMeta match={match} />

        {isTournoi ? (
          <div className="mt-6 flex flex-col items-center gap-3 text-center">
            <MatchLogos
              logos={match.adversaire_logos}
              alt={match.nom_tournoi ? `Logo ${match.nom_tournoi}` : "Logo du tournoi"}
              className="gap-2"
            />
            <p className="break-words text-xl font-extrabold">
              {match.nom_tournoi || "Plateau / tournoi"}
            </p>
          </div>
        ) : isTriangulaire ? (
          <div className="mt-6 space-y-4">
            {match.nom_tournoi && (
              <p className="text-center text-sm font-semibold text-club-gold">
                {match.nom_tournoi}
              </p>
            )}
            <div className="grid grid-cols-3 items-center gap-2 text-center sm:gap-4">
              <span className="flex min-w-0 flex-col items-center gap-2 text-sm font-semibold sm:text-base">
                <MatchLogos logos={["/logo.png"]} alt={`Logo ${siteConfig.shortName}`} />
                <span className="w-full break-words hyphens-auto">{siteConfig.shortName}</span>
              </span>
              <span className="flex justify-center">
                <ScoreDuel scoreGauche={match.score_us} scoreDroite={match.score_adverse} />
              </span>
              <span className="flex min-w-0 flex-col items-center gap-2 text-sm font-semibold sm:text-base">
                <MatchLogos
                  logos={match.adversaire_logos}
                  alt={`Logo ${match.adversaire}`}
                />
                <span className="w-full break-words hyphens-auto">{match.adversaire}</span>
              </span>
            </div>
            <div className="grid grid-cols-3 items-center gap-2 text-center sm:gap-4">
              <span className="flex min-w-0 flex-col items-center gap-2 text-sm font-semibold sm:text-base">
                <MatchLogos logos={["/logo.png"]} alt={`Logo ${siteConfig.shortName}`} />
                <span className="w-full break-words hyphens-auto">{siteConfig.shortName}</span>
              </span>
              <span className="flex justify-center">
                <ScoreDuel scoreGauche={match.score_us2} scoreDroite={match.score_adverse2} />
              </span>
              <span className="flex min-w-0 flex-col items-center gap-2 text-sm font-semibold sm:text-base">
                <MatchLogos
                  logos={match.adversaire2_logos}
                  alt={`Logo ${match.adversaire2}`}
                />
                <span className="w-full break-words hyphens-auto">{match.adversaire2}</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-3 items-center gap-2 text-center sm:gap-4">
            <div className="flex min-w-0 flex-col items-center gap-2 text-sm sm:text-base">
              <MatchLogos logos={domicileLogos} alt={`Logo ${domicileNom}`} />
              <span className="w-full break-words hyphens-auto font-semibold">{domicileNom}</span>
            </div>
            <div className="flex justify-center">
              <ScoreDuel
                scoreGauche={match.domicile ? match.score_us : match.score_adverse}
                scoreDroite={match.domicile ? match.score_adverse : match.score_us}
              />
            </div>
            <div className="flex min-w-0 flex-col items-center gap-2 text-sm sm:text-base">
              <MatchLogos logos={exterieurLogos} alt={`Logo ${exterieurNom}`} />
              <span className="w-full break-words hyphens-auto font-semibold">{exterieurNom}</span>
            </div>
          </div>
        )}

        {match.lieu && (
          <p className="mt-6 break-words text-center text-sm font-semibold text-club-gold">
            {match.lieu}
          </p>
        )}
      </div>

      <MatchTabs
        defaultTab={composition.length > 0 ? "composition" : "infos"}
        infoTab={infoTab}
        compositionTab={compositionTab}
      />
    </div>
  );
}
