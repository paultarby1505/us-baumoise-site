"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { MATCH_CATEGORIES } from "@/lib/rugby";
import type { ClassementLigne } from "@/lib/types";

export default function ClassementTable({ lignes }: { lignes: ClassementLigne[] }) {
  const [selected, setSelected] = useState<string>(MATCH_CATEGORIES[0]);

  const rows = useMemo(
    () => lignes.filter((l) => l.categorie === selected),
    [lignes, selected]
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {MATCH_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelected(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              selected === cat
                ? "bg-club-gold text-black"
                : "bg-black/5 text-foreground/70 hover:bg-black/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {rows.length === 0 ? (
          <p className="text-foreground/60">
            Aucun classement publié pour cette catégorie pour le moment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-foreground/50">
                  <th className="py-2 pr-2">#</th>
                  <th className="py-2 pr-2">Équipe</th>
                  <th className="px-2 py-2 text-center">J</th>
                  <th className="px-2 py-2 text-center">G</th>
                  <th className="px-2 py-2 text-center">N</th>
                  <th className="px-2 py-2 text-center">P</th>
                  <th className="px-2 py-2 text-center">Pour</th>
                  <th className="px-2 py-2 text-center">Contre</th>
                  <th className="px-2 py-2 text-center">Diff</th>
                  <th className="py-2 pl-2 text-center">Pts</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((ligne, i) => (
                  <tr
                    key={ligne.id}
                    className={`border-b border-black/5 ${
                      ligne.notre_club ? "bg-club-gold/10 font-semibold" : ""
                    }`}
                  >
                    <td className="py-2 pr-2">{i + 1}</td>
                    <td className="py-2 pr-2">
                      <div className="flex items-center gap-2">
                        <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full border border-black/10 bg-white">
                          {ligne.logo_url && (
                            <Image
                              src={ligne.logo_url}
                              alt={`Logo ${ligne.equipe}`}
                              fill
                              className="object-contain p-0.5"
                              sizes="24px"
                            />
                          )}
                        </div>
                        <span>{ligne.equipe}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center">{ligne.joues}</td>
                    <td className="px-2 py-2 text-center">{ligne.gagnes}</td>
                    <td className="px-2 py-2 text-center">{ligne.nuls}</td>
                    <td className="px-2 py-2 text-center">{ligne.perdus}</td>
                    <td className="px-2 py-2 text-center">{ligne.points_marques}</td>
                    <td className="px-2 py-2 text-center">{ligne.points_encaisses}</td>
                    <td className="px-2 py-2 text-center">
                      {ligne.points_marques - ligne.points_encaisses}
                    </td>
                    <td className="py-2 pl-2 text-center">{ligne.points_classement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
