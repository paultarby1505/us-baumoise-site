import type { Metadata } from "next";
import { getMatchs, getMatchsPasses, getProchainsMatchs } from "@/lib/queries";
import MatchCard from "@/components/MatchCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Calendrier des matchs",
  description: "Calendrier et résultats du club US Baumoise Rugby.",
};

export default async function MatchsPage() {
  const matchs = await getMatchs();
  const prochains = getProchainsMatchs(matchs);
  const passes = getMatchsPasses(matchs);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-extrabold">Calendrier des matchs</h1>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-club-green">À venir</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {prochains.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
          {prochains.length === 0 && (
            <p className="text-foreground/60">Aucun match à venir programmé.</p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-club-green">Résultats</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {passes.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
          {passes.length === 0 && (
            <p className="text-foreground/60">Aucun résultat pour le moment.</p>
          )}
        </div>
      </section>
    </div>
  );
}
