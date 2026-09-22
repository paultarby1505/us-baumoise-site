import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoriePage, getJoueurs } from "@/lib/queries";
import { categoryFromSlug, categorySlug, posteRank } from "@/lib/rugby";
import PlayerCard from "@/components/PlayerCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorie: string }>;
}): Promise<Metadata> {
  const { categorie: slug } = await params;
  const categorie = categoryFromSlug(slug);
  if (!categorie) return {};
  return {
    title: `Effectif ${categorie}`,
    description: `Les joueurs de la catégorie ${categorie} du club de rugby US Baumoise à Baume-les-Dames (Doubs).`,
    alternates: { canonical: `/effectif/${categorySlug(categorie)}` },
  };
}

export default async function CategorieEffectifPage({
  params,
}: {
  params: Promise<{ categorie: string }>;
}) {
  const { categorie: slug } = await params;
  const categorie = categoryFromSlug(slug);
  if (!categorie) notFound();

  const [joueurs, page] = await Promise.all([getJoueurs(), getCategoriePage(categorie)]);
  const membres = joueurs
    .filter((j) => j.categorie === categorie)
    .sort((a, b) => posteRank(a.poste) - posteRank(b.poste));

  return (
    <div>
      <section className="relative overflow-hidden bg-club-black text-white">
        {page?.header_image_url && (
          <>
            <Image
              src={page.header_image_url}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-club-black/60" />
          </>
        )}
        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 py-14 text-center">
          <Link
            href="/effectif"
            className="mb-3 text-xs font-semibold uppercase tracking-wide text-club-gold-light hover:underline"
          >
            ← Toutes les catégories
          </Link>
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            {page?.header_titre || categorie}
          </h1>
          {page?.header_texte && (
            <p className="mt-3 max-w-2xl text-white/80">{page.header_texte}</p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {membres.map((joueur) => (
            <PlayerCard key={joueur.id} joueur={joueur} />
          ))}
        </div>
        {membres.length === 0 && (
          <p className="text-foreground/60">Aucun joueur dans cette catégorie pour le moment.</p>
        )}
      </div>
    </div>
  );
}
