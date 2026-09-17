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
  const domicileLogo = match.domicile ? "/logo.png" : match.adversaire_logo_url;
  const exterieurLogo = match.domicile ? match.adversaire_logo_url : "/logo.png";
  const joue = match.score_us !== null && match.score_adverse !== null;
  const joue2 = match.score_us2 !== null && match.score_adverse2 !== null;

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

      <div className="mt-4 rounded-lg border border-black/10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-club-gold">
          <span>
            {match.categorie}
            {match.competition ? ` · ${match.competition}` : ""}
          </span>
          <span className="flex items-center gap-1 normal-case text-foreground/60">
            {match.domicile ? <HouseIcon /> : <BusIcon />}
            {match.domicile ? "Domicile" : "Extérieur"}
          </span>
        </div>

        <p className="mt-1 text-sm text-foreground/60">{formatDate(match.date_match)}</p>

        {isTournoi ? (
          <div className="mt-6 flex flex-col items-center gap-3 text-center">
            {match.adversaire_logo_url && (
              <Image
                src={match.adversaire_logo_url}
                alt={match.nom_tournoi ? `Logo ${match.nom_tournoi}` : "Logo du tournoi"}
                width={64}
                height={64}
                className="h-14 w-14 object-contain sm:h-16 sm:w-16"
              />
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
              <span className="font-semibold">{siteConfig.shortName}</span>
              <span>
                {joue ? (
                  <span className="text-xl font-extrabold text-club-gold sm:text-2xl">
                    {match.score_us} - {match.score_adverse}
                  </span>
                ) : (
                  <span className="text-sm text-foreground/50">vs</span>
                )}
              </span>
              <span className="flex flex-col items-center gap-2 font-semibold">
                {match.adversaire_logo_url && (
                  <Image
                    src={match.adversaire_logo_url}
                    alt={`Logo ${match.adversaire}`}
                    width={64}
                    height={64}
                    className="h-12 w-12 object-contain sm:h-16 sm:w-16"
                  />
                )}
                {match.adversaire}
              </span>
            </div>
            <div className="grid grid-cols-3 items-center gap-2 text-center sm:gap-4">
              <span className="font-semibold">{siteConfig.shortName}</span>
              <span>
                {joue2 ? (
                  <span className="text-xl font-extrabold text-club-gold sm:text-2xl">
                    {match.score_us2} - {match.score_adverse2}
                  </span>
                ) : (
                  <span className="text-sm text-foreground/50">vs</span>
                )}
              </span>
              <span className="flex flex-col items-center gap-2 font-semibold">
                {match.adversaire2_logo_url && (
                  <Image
                    src={match.adversaire2_logo_url}
                    alt={`Logo ${match.adversaire2}`}
                    width={64}
                    height={64}
                    className="h-12 w-12 object-contain sm:h-16 sm:w-16"
                  />
                )}
                {match.adversaire2}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-3 items-center gap-2 text-center sm:gap-4">
            <div className="flex flex-col items-center gap-2">
              {domicileLogo && (
                <Image
                  src={domicileLogo}
                  alt={`Logo ${domicileNom}`}
                  width={64}
                  height={64}
                  className="h-12 w-12 object-contain sm:h-16 sm:w-16"
                />
              )}
              <span className="font-semibold">{domicileNom}</span>
            </div>
            <div>
              {joue ? (
                <span className="text-xl font-extrabold text-club-gold sm:text-2xl">
                  {match.domicile ? match.score_us : match.score_adverse} -{" "}
                  {match.domicile ? match.score_adverse : match.score_us}
                </span>
              ) : (
                <span className="text-sm text-foreground/50">vs</span>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              {exterieurLogo && (
                <Image
                  src={exterieurLogo}
                  alt={`Logo ${exterieurNom}`}
                  width={64}
                  height={64}
                  className="h-12 w-12 object-contain sm:h-16 sm:w-16"
                />
              )}
              <span className="font-semibold">{exterieurNom}</span>
            </div>
          </div>
        )}

        {match.lieu && (
          <p className="mt-6 text-center text-sm text-foreground/60">{match.lieu}</p>
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
