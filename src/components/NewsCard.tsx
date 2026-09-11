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
      className="block rounded-lg border border-black/10 p-5 transition-shadow hover:shadow-md"
    >
      <p className="text-xs text-club-gold font-semibold uppercase tracking-wide">
        {formatDate(actualite.publie_le)}
      </p>
      <h3 className="mt-2 text-lg font-bold">{actualite.titre}</h3>
      {actualite.extrait && (
        <p className="mt-2 text-sm text-foreground/70">{actualite.extrait}</p>
      )}
    </Link>
  );
}
