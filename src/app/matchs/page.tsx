import type { Metadata } from "next";
import { getMatchs, getMatchsAvenir } from "@/lib/queries";
import MatchListByCategorie from "@/components/MatchListByCategorie";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Calendrier des matchs",
  description:
    "Calendrier et lieux des prochains matchs du club de rugby US Baumoise à Baume-les-Dames (Doubs), par catégorie.",
};

export default async function MatchsPage() {
  const matchs = await getMatchs();
  const avenir = getMatchsAvenir(matchs);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-extrabold">Calendrier des matchs</h1>
      <p className="mt-2 text-foreground/60">Choisis une catégorie pour voir ses prochains matchs.</p>

      <div className="mt-6">
        <MatchListByCategorie
          matchs={avenir}
          emptyText="Aucun match à venir pour cette catégorie."
          tri="asc"
        />
      </div>
    </div>
  );
}
