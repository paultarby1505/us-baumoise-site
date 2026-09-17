import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPartenaire } from "@/lib/queries";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const partenaire = await getPartenaire(slug);
  if (!partenaire) return {};
  return {
    title: partenaire.nom,
    description: partenaire.resume ?? undefined,
  };
}

export default async function PartenairePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const partenaire = await getPartenaire(slug);
  if (!partenaire) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/partenaires"
        className="text-xs font-semibold uppercase tracking-wide text-club-gold hover:underline"
      >
        ← Tous les partenaires
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-6">
        {partenaire.logo_url && (
          <div className="relative h-24 w-40 shrink-0">
            <Image
              src={partenaire.logo_url}
              alt={`Logo ${partenaire.nom}`}
              fill
              className="object-contain object-left"
              sizes="160px"
            />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">{partenaire.nom}</h1>
          {partenaire.resume && (
            <p className="mt-1 text-foreground/70">{partenaire.resume}</p>
          )}
        </div>
      </div>

      {partenaire.description && (
        <div className="mt-8 whitespace-pre-line leading-relaxed text-foreground/80">
          {partenaire.description}
        </div>
      )}

      {partenaire.site_url && (
        <a
          href={partenaire.site_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block rounded bg-club-gold px-4 py-2 font-semibold text-black hover:bg-club-gold-light"
        >
          Visiter le site →
        </a>
      )}
    </article>
  );
}
