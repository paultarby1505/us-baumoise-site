import type { Joueur } from "@/lib/types";

export default function PlayerCard({ joueur }: { joueur: Joueur }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-black/10 p-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-club-green text-lg font-bold text-white">
        {joueur.numero ?? "-"}
      </div>
      <div>
        <p className="font-semibold">
          {joueur.prenom} {joueur.nom}
        </p>
        {joueur.poste && (
          <p className="text-sm text-foreground/60">{joueur.poste}</p>
        )}
      </div>
    </div>
  );
}
