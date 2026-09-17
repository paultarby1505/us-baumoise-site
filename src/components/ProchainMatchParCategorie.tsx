"use client";

import { useMemo, useState } from "react";
import MatchCard from "@/components/MatchCard";
import { MATCH_CATEGORIES } from "@/lib/rugby";
import type { Match } from "@/lib/types";

export default function ProchainMatchParCategorie({
  matchs,
  now,
}: {
  matchs: Match[];
  now: number;
}) {
  const [selected, setSelected] = useState<string>(MATCH_CATEGORIES[0]);

  const prochainMatch = useMemo(() => {
    const candidats = matchs
      .filter((m) => m.categorie === selected && new Date(m.date_match).getTime() >= now)
      .sort((a, b) => new Date(a.date_match).getTime() - new Date(b.date_match).getTime());
    return candidats[0] ?? null;
  }, [matchs, selected, now]);

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
        {prochainMatch ? (
          <MatchCard match={prochainMatch} />
        ) : (
          <p className="text-foreground/60">Aucun match à venir pour cette catégorie.</p>
        )}
      </div>
    </div>
  );
}
