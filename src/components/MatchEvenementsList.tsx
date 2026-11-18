import { evenementInfo, nomAffiche } from "@/lib/match-evenements";
import type { Joueur, MatchEvenement } from "@/lib/types";

const SECTIONS: { titre: string; types: MatchEvenement["type"][] }[] = [
  { titre: "Points marqués", types: ["essai", "essai_penalite", "transformation", "penalite", "drop"] },
  { titre: "Cartons", types: ["carton_jaune", "carton_rouge"] },
  { titre: "Changements", types: ["remplacement"] },
];

function minute(m: number | null) {
  return m != null ? `${m}e` : "";
}

export default function MatchEvenementsList({
  evenements,
  joueurs,
}: {
  evenements: MatchEvenement[];
  joueurs: Joueur[];
}) {
  const parId = new Map(joueurs.map((j) => [j.id, j]));
  const avecOB = evenements.some(
    (e) => (!e.joueur_id && e.joueur_nom) || (e.type === "remplacement" && !e.joueur_sortant_id && e.joueur_sortant_nom)
  );

  return (
    <div className="space-y-6">
      {SECTIONS.map((section) => {
        const liste = evenements
          .filter((e) => section.types.includes(e.type))
          .sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999) || a.position - b.position);
        if (liste.length === 0) return null;
        return (
          <div key={section.titre}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
              {section.titre}
            </h3>
            <ul className="mt-2 divide-y divide-black/5 rounded-lg border border-black/10 bg-white">
              {liste.map((e) => {
                const info = evenementInfo(e.type);
                const joueur = nomAffiche(e.joueur_id, e.joueur_nom, parId);
                const sortant = nomAffiche(e.joueur_sortant_id, e.joueur_sortant_nom, parId);
                return (
                  <li key={e.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                    <span className="w-8 shrink-0 text-right text-xs font-semibold text-foreground/50">
                      {minute(e.minute)}
                    </span>
                    <span aria-hidden="true">{info.icone}</span>
                    <span className="min-w-0 flex-1 break-words">
                      {e.type === "remplacement" ? (
                        <>
                          <span className="font-semibold">{joueur ?? "?"}</span>
                          <span className="text-foreground/60"> remplace {sortant ?? "?"}</span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold">{joueur ?? info.label}</span>
                          {joueur && <span className="text-foreground/60"> · {info.label}</span>}
                        </>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      {avecOB && (
        <p className="text-xs text-foreground/50">(OB) : joueur non enregistré dans l&apos;effectif du site.</p>
      )}
    </div>
  );
}
