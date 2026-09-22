import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCategoriePages } from "@/lib/queries";
import { CATEGORIES, categorySlug } from "@/lib/rugby";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Effectif",
  description:
    "L'effectif du club de rugby US Baumoise à Baume-les-Dames (Doubs), du Baby rugby aux Seniors, par catégorie.",
  alternates: { canonical: "/effectif" },
};

export default async function EffectifPage() {
  // La photo d'en-tête de chaque catégorie sert aussi de visuel à sa case
  // dans ce menu, pour que le choix se fasse à l'image plutôt qu'au texte.
  const pages = await getCategoriePages();
  const images = new Map(pages.map((page) => [page.categorie, page.header_image_url]));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-extrabold uppercase tracking-wide">Effectif</h1>
      <div className="mt-2 h-1 w-14 rounded-full bg-club-gold" />
      <p className="mt-3 text-foreground/60">Choisis une catégorie pour voir les joueurs.</p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {CATEGORIES.map((cat) => {
          const image = images.get(cat) ?? null;
          return (
            <Link
              key={cat}
              href={`/effectif/${categorySlug(cat)}`}
              className="group relative block overflow-hidden rounded-2xl bg-club-black shadow-sm ring-1 ring-black/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-club-gold/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-club-gold"
            >
              <div className="relative aspect-[4/5] w-full sm:aspect-[16/10]">
                {image ? (
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  // Sans photo, la case garde la même silhouette grâce à un
                  // dégradé aux couleurs du club et au blason en filigrane.
                  <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-club-black-soft via-club-black to-club-black-soft pb-16">
                    <Image
                      src="/logo.png"
                      alt=""
                      width={224}
                      height={140}
                      className="h-24 w-auto opacity-15"
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-club-black via-club-black/55 to-club-black/10" />

                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <div className="h-1 w-8 rounded-full bg-club-gold transition-all duration-300 group-hover:w-16" />
                  <h2 className="mt-2 text-lg font-extrabold uppercase tracking-wide text-white sm:mt-3 sm:text-xl">
                    {cat}
                  </h2>
                  <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-club-gold-light sm:text-sm">
                    Voir l&apos;effectif
                    <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
