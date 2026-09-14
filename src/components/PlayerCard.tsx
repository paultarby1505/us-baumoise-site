import Image from "next/image";
import type { Joueur } from "@/lib/types";

export default function PlayerCard({ joueur }: { joueur: Joueur }) {
  return (
    <div className="overflow-hidden rounded-lg border border-black/10 bg-white">
      <div className="relative aspect-[3/4] w-full bg-club-black-soft">
        {joueur.photo_url ? (
          <Image
            src={joueur.photo_url}
            alt={`${joueur.prenom} ${joueur.nom}`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-16 w-16 text-white/25"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8v1H4v-1z" />
            </svg>
          </div>
        )}
        {joueur.numero !== null && (
          <span className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-club-gold text-sm font-bold text-black">
            {joueur.numero}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold">
          {joueur.prenom} {joueur.nom}
        </p>
        {joueur.poste && <p className="text-sm text-foreground/60">{joueur.poste}</p>}
      </div>
    </div>
  );
}
