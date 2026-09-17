"use client";

import { useMemo, useState } from "react";
import MatchCard from "@/components/MatchCard";
import { MATCH_CATEGORIES } from "@/lib/rugby";
import type { Match } from "@/lib/types";

export default function MatchListByCategorie({
  matchs,
  emptyText,
  tri,
}: {
  matchs: Match[];
  emptyText: string;
  tri: "asc" | "desc";
}) {
  const [selected, setSelected] = useState<string>(MATCH_CATEGORIES[0]);

  const filtres = useMemo(() => {
    const base = matchs.filter((m) => m.categorie === selected);
    return [...base].sort((a, b) => {
      const diff = new Date(a.date_match).getTime() - new Date(b.date_match).getTime();
      return tri === "asc" ? diff : -diff;
    });
  }, [matchs, selected, tri]);

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
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {filtres.length > 0 ? (
          filtres.map((match) => <MatchCard key={match.id} match={match} />)
        ) : (
          <p className="text-foreground/60">{emptyText}</p>
        )}
      </div>
    </div>
  );
}
