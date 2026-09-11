import Link from "next/link";
import { getActualites, getMatchs, getProchainsMatchs } from "@/lib/queries";
import NewsCard from "@/components/NewsCard";
import MatchCard from "@/components/MatchCard";
import { siteConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [actualites, matchs] = await Promise.all([getActualites(), getMatchs()]);
  const prochainMatch = getProchainsMatchs(matchs)[0];
  const dernieresActus = actualites.slice(0, 3);

  return (
    <div>
      <section className="bg-club-green-dark text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl">{siteConfig.name}</h1>
          <p className="mt-3 text-white/80">{siteConfig.description}</p>
        </div>
      </section>

      {prochainMatch && (
        <section className="mx-auto max-w-5xl px-4 py-10">
          <h2 className="text-xl font-bold">Prochain match</h2>
          <div className="mt-4">
            <MatchCard match={prochainMatch} />
          </div>
        </section>
      )}

      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Dernières actualités</h2>
          <Link href="/actualites" className="text-sm font-semibold text-club-green">
            Toutes les actualités →
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dernieresActus.map((actu) => (
            <NewsCard key={actu.id} actualite={actu} />
          ))}
        </div>
      </section>
    </div>
  );
}
