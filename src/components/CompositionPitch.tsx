import Image from "next/image";
import { COMPOSITION_ROWS, slotLabel } from "@/lib/rugby";
import type { CompositionSlot } from "@/lib/queries";

export default function CompositionPitch({ composition }: { composition: CompositionSlot[] }) {
  const bySlot = new Map(composition.map((c) => [c.slot, c.joueur]));

  return (
    <div className="space-y-4 rounded-lg bg-club-black p-4 sm:p-6">
      {COMPOSITION_ROWS.map((row, i) => (
        <div key={i} className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {row.map((slot) => {
            const joueur = bySlot.get(slot);
            return (
              <div key={slot} className="flex w-20 flex-col items-center text-center sm:w-24">
                <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-club-gold bg-club-black-soft sm:h-16 sm:w-16">
                  {joueur?.photo_url ? (
                    <Image
                      src={joueur.photo_url}
                      alt={`${joueur.prenom} ${joueur.nom}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-full w-full p-3 text-white/25"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8v1H4v-1z" />
                    </svg>
                  )}
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-club-gold text-[10px] font-bold text-black">
                    {slot}
                  </span>
                </div>
                <p className="mt-1 w-full truncate text-xs font-semibold text-white">
                  {joueur ? `${joueur.prenom} ${joueur.nom}` : "—"}
                </p>
                <p className="text-[10px] text-white/50">{slotLabel(slot)}</p>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
