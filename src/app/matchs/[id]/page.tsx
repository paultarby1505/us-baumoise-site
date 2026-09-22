import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMatch, getMatchComposition } from "@/lib/queries";
import { siteConfig } from "@/lib/config";
import { HouseIcon, BusIcon } from "@/components/MatchTypeIcons";
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
    alternates: { canonical: `/matchs/${match.id}` },
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
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-xs font-semibold uppercase tracking-wide text-club-gold">
          <span>
            {match.categorie}
            {match.competition ? ` · ${match.competition}` : ""}
          </span>
          <span className="whitespace-nowrap text-center text-sm">
            {formatDate(match.date_match)}
          </span>
          <span className="flex items-center justify-end gap-1 normal-case text-club-gold">
            {match.domicile ? <HouseIcon /> : <BusIcon />}
            {match.domicile ? "Domicile" : "Extérieur"}
          </span>
        </div>

        {isTournoi ? (
          <div className="mt-6 flex flex-col items-center gap-3 text-center">
            {match.adversaire_logos.length > 0 && (
              <div className="flex items-center gap-2">
                {match.adversaire_logos.map((url) => (
                  <Image
                    key={url}
                    src={url}
                    alt={match.nom_tournoi ? `Logo ${match.nom_tournoi}` : "Logo du tournoi"}
                    width={64}
                    height={64}
                    className="h-14 w-14 object-contain sm:h-16 sm:w-16"
                  />
                ))}
              </div>
            )}
            <p className="text-xl font-extrabold">{match.nom_tournoi || "Plateau / tournoi"}</p>
          </div>
        ) : isTriangulaire ? (
          <div className="mt-6 space-y-4">
            {match.nom_tournoi && (
              <p className="text-center text-sm font-semibold text-club-gold">
                {match.nom_tournoi}
              </p>
            )}
            <div className="grid grid-cols-3 items-center gap-2 text-center sm:gap-4">
              <span className="flex flex-col items-center gap-2 font-semibold">
                <Image
                  src="/logo.png"
                  alt={`Logo ${siteConfig.shortName}`}
                  width={64}
                  height={64}
                  className="h-12 w-12 object-contain sm:h-16 sm:w-16"
                />
                {siteConfig.shortName}
              </span>
              <span className="flex justify-center">
                <ScoreDuel scoreGauche={match.score_us} scoreDroite={match.score_adverse} />
              </span>
              <span className="flex flex-col items-center gap-2 font-semibold">
                {match.adversaire_logos.length > 0 && (
                  <span className="flex items-center gap-1">
                    {match.adversaire_logos.map((url) => (
                      <Image
                        key={url}
                        src={url}
                        alt={`Logo ${match.adversaire}`}
                        width={64}
                        height={64}
                        className="h-12 w-12 object-contain sm:h-16 sm:w-16"
                      />
                    ))}
                  </span>
                )}
                {match.adversaire}
              </span>
            </div>
            <div className="grid grid-cols-3 items-center gap-2 text-center sm:gap-4">
              <span className="flex flex-col items-center gap-2 font-semibold">
                <Image
                  src="/logo.png"
                  alt={`Logo ${siteConfig.shortName}`}
                  width={64}
                  height={64}
                  className="h-12 w-12 object-contain sm:h-16 sm:w-16"
                />
                {siteConfig.shortName}
              </span>
              <span className="flex justify-center">
                <ScoreDuel scoreGauche={match.score_us2} scoreDroite={match.score_adverse2} />
              </span>
              <span className="flex flex-col items-center gap-2 font-semibold">
                {match.adversaire2_logos.length > 0 && (
                  <span className="flex items-center gap-1">
                    {match.adversaire2_logos.map((url) => (
                      <Image
                        key={url}
                        src={url}
                        alt={`Logo ${match.adversaire2}`}
                        width={64}
                        height={64}
                        className="h-12 w-12 object-contain sm:h-16 sm:w-16"
                      />
                    ))}
                  </span>
                )}
                {match.adversaire2}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-3 items-center gap-2 text-center sm:gap-4">
            <div className="flex flex-col items-center gap-2">
              {domicileLogos.length > 0 && (
                <span className="flex items-center gap-1">
                  {domicileLogos.map((url) => (
                    <Image
                      key={url}
                      src={url}
                      alt={`Logo ${domicileNom}`}
                      width={64}
                      height={64}
                      className="h-12 w-12 object-contain sm:h-16 sm:w-16"
                    />
                  ))}
                </span>
              )}
              <span className="font-semibold">{domicileNom}</span>
            </div>
            <div className="flex justify-center">
              <ScoreDuel
                scoreGauche={match.domicile ? match.score_us : match.score_adverse}
                scoreDroite={match.domicile ? match.score_adverse : match.score_us}
              />
            </div>
            <div className="flex flex-col items-center gap-2">
              {exterieurLogos.length > 0 && (
                <span className="flex items-center gap-1">
                  {exterieurLogos.map((url) => (
                    <Image
                      key={url}
                      src={url}
                      alt={`Logo ${exterieurNom}`}
                      width={64}
                      height={64}
                      className="h-12 w-12 object-contain sm:h-16 sm:w-16"
                    />
                  ))}
                </span>
              )}
              <span className="font-semibold">{exterieurNom}</span>
            </div>
          </div>
        )}

        {match.lieu && (
          <p className="mt-6 text-center text-sm font-semibold text-club-gold">{match.lieu}</p>
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
