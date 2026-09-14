import type { Metadata } from "next";
import { getJoueurs } from "@/lib/queries";
import PlayerCard from "@/components/PlayerCard";
import { categoryRank, categorySlug, posteRank } from "@/lib/rugby";
import type { Joueur } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Effectif",
  description: "L'effectif du club US Baumoise Rugby, par catégorie.",
};

function groupByCategorie(joueurs: Joueur[]) {
  const groupes = new Map<string, Joueur[]>();
  for (const joueur of joueurs) {
    const liste = groupes.get(joueur.categorie) ?? [];
    liste.push(joueur);
    groupes.set(joueur.categorie, liste);
  }
  for (const membres of groupes.values()) {
    membres.sort((a, b) => posteRank(a.poste) - posteRank(b.poste));
  }
  return [...groupes.entries()].sort(
    ([a], [b]) => categoryRank(a) - categoryRank(b)
  );
}

export default async function EffectifPage() {
  const joueurs = await getJoueurs();
  const groupes = groupByCategorie(joueurs);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-extrabold">Effectif</h1>
      {groupes.map(([categorie, membres]) => (
        <section key={categorie} id={categorySlug(categorie)} className="mt-8 scroll-mt-6">
          <h2 className="text-lg font-bold text-club-gold">{categorie}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {membres.map((joueur) => (
              <PlayerCard key={joueur.id} joueur={joueur} />
            ))}
          </div>
        </section>
      ))}
      {joueurs.length === 0 && (
        <p className="mt-6 text-foreground/60">Effectif à venir.</p>
      )}
    </div>
  );
}
