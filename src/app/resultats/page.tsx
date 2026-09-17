import type { Metadata } from "next";
import { getMatchs, getResultats } from "@/lib/queries";
import MatchListByCategorie from "@/components/MatchListByCategorie";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Résultats",
  description:
    "Résultats des matchs du club de rugby US Baumoise à Baume-les-Dames (Doubs), par catégorie.",
};

export default async function ResultatsPage() {
  const matchs = await getMatchs();
  const resultats = getResultats(matchs);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-extrabold">Résultats</h1>
      <p className="mt-2 text-foreground/60">Choisis une catégorie pour voir ses derniers résultats.</p>

      <div className="mt-6">
        <MatchListByCategorie
          matchs={resultats}
          emptyText="Aucun résultat pour cette catégorie pour le moment."
          tri="desc"
        />
      </div>
    </div>
  );
}
