import Link from "next/link";
import Image from "next/image";
import { getActualites, getMatchs, getSiteSettings } from "@/lib/queries";
import NewsCard from "@/components/NewsCard";
import ProchainMatchParCategorie from "@/components/ProchainMatchParCategorie";
import { siteConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

function currentTimestamp(): number {
  return Date.now();
}

export default async function HomePage() {
  const [actualites, matchs, settings] = await Promise.all([
    getActualites(),
    getMatchs(),
    getSiteSettings(),
  ]);
  const dernieresActus = actualites.slice(0, 3);
  const heroImage = settings?.hero_image_url;

  return (
    <div>
      <section className="relative overflow-hidden bg-club-black text-white">
        {heroImage && (
          <>
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-club-black/70" />
          </>
        )}
        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 py-16 text-center">
          <Image src="/logo.png" alt={siteConfig.name} width={224} height={140} className="h-36 w-auto" priority />
          <h1 className="mt-6 text-3xl font-extrabold sm:text-4xl">{siteConfig.name}</h1>
          <p className="mt-3 max-w-2xl text-white/80">{siteConfig.description}</p>
        </div>
      </section>

      {matchs.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-10">
          <h2 className="text-xl font-bold">Prochain match</h2>
          <div className="mt-4">
            <ProchainMatchParCategorie matchs={matchs} now={currentTimestamp()} />
          </div>
        </section>
      )}

      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Dernières actualités</h2>
          <Link href="/actualites" className="text-sm font-semibold text-club-gold">
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
