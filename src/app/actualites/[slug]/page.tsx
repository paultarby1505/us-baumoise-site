import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getActualite } from "@/lib/queries";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const actualite = await getActualite(slug);
  if (!actualite) return {};
  return {
    title: actualite.titre,
    description: actualite.extrait ?? undefined,
    openGraph: {
      title: actualite.titre,
      description: actualite.extrait ?? undefined,
      images: actualite.image_url ? [actualite.image_url] : undefined,
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ActualitePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const actualite = await getActualite(slug);
  if (!actualite) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-club-green">
        {formatDate(actualite.publie_le)}
      </p>
      <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
        {actualite.titre}
      </h1>
      <div className="mt-6 whitespace-pre-line text-foreground/80 leading-relaxed">
        {actualite.contenu}
      </div>
    </article>
  );
}
