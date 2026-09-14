import Image from "next/image";
import Link from "next/link";
import type { Actualite } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function NewsCard({ actualite }: { actualite: Actualite }) {
  return (
    <Link
      href={`/actualites/${actualite.slug}`}
      className="block overflow-hidden rounded-lg border border-black/10 transition-shadow hover:shadow-md"
    >
      {actualite.image_url && (
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={actualite.image_url}
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        </div>
      )}
      <div className="p-5">
        <p className="text-xs text-club-gold font-semibold uppercase tracking-wide">
          {formatDate(actualite.publie_le)}
        </p>
        <h3 className="mt-2 text-lg font-bold">{actualite.titre}</h3>
        {actualite.extrait && (
          <p className="mt-2 text-sm text-foreground/70">{actualite.extrait}</p>
        )}
      </div>
    </Link>
  );
}
