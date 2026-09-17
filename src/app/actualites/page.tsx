import type { Metadata } from "next";
import { getActualites } from "@/lib/queries";
import NewsCard from "@/components/NewsCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Actualités",
  description:
    "Toute l'actualité du club de rugby US Baumoise à Baume-les-Dames (Doubs) : matchs, événements, vie du club.",
};

export default async function ActualitesPage() {
  const actualites = await getActualites();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-extrabold">Actualités</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actualites.map((actu) => (
          <NewsCard key={actu.id} actualite={actu} />
        ))}
        {actualites.length === 0 && (
          <p className="text-foreground/60">Aucune actualité pour le moment.</p>
        )}
      </div>
    </div>
  );
}
