import type { Metadata } from "next";
import Link from "next/link";
import { getJoueurs } from "@/lib/queries";
import { CATEGORIES, categorySlug } from "@/lib/rugby";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Effectif",
  description: "L'effectif du club US Baumoise Rugby, par catégorie.",
};

export default async function EffectifPage() {
  const joueurs = await getJoueurs();
  const counts = new Map<string, number>();
  for (const joueur of joueurs) {
    counts.set(joueur.categorie, (counts.get(joueur.categorie) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-extrabold">Effectif</h1>
      <p className="mt-2 text-foreground/60">Choisis une catégorie pour voir les joueurs.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => {
          const count = counts.get(cat) ?? 0;
          return (
            <Link
              key={cat}
              href={`/effectif/${categorySlug(cat)}`}
              className="rounded-lg border border-black/10 bg-white p-5 transition-shadow hover:shadow-md"
            >
              <h2 className="text-lg font-bold text-club-gold">{cat}</h2>
              <p className="mt-2 text-sm text-foreground/70">
                {count} joueur{count > 1 ? "s" : ""}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
