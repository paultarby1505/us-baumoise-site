"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import { MATCH_CATEGORIES } from "@/lib/rugby";
import { formatParis } from "@/lib/date-fr";
import type { Match } from "@/lib/types";

const TOUTES = "Toutes";

function pillClass(active: boolean) {
  return `rounded-full border-2 border-black px-4 py-1.5 text-sm font-semibold transition-colors ${
    active ? "bg-club-gold text-black" : "bg-black/5 text-foreground/70 hover:bg-black/10"
  }`;
}

export default function AdminMatchList({
  matchs,
  deleteMatch,
}: {
  matchs: Match[];
  deleteMatch: (id: string, formData: FormData) => void | Promise<void>;
}) {
  const [selected, setSelected] = useState<string>(TOUTES);

  const filtres = useMemo(
    () => (selected === TOUTES ? matchs : matchs.filter((m) => m.categorie === selected)),
    [matchs, selected]
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelected(TOUTES)}
          className={pillClass(selected === TOUTES)}
        >
          {TOUTES}
        </button>
        {MATCH_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelected(cat)}
            className={pillClass(selected === cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-4 divide-y divide-black/10 rounded-lg border border-black/10 bg-white">
        {filtres.map((match) => (
          <div key={match.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-semibold">
                {match.nom_tournoi
                  ? match.nom_tournoi
                  : match.adversaire
                    ? `${match.domicile ? "US Baumoise" : match.adversaire} vs ${
                        match.domicile ? match.adversaire : "US Baumoise"
                      }${
                        match.score_us !== null && match.score_adverse !== null
                          ? ` — ${match.domicile ? match.score_us : match.score_adverse}-${
                              match.domicile ? match.score_adverse : match.score_us
                            }`
                          : ""
                      }`
                    : "Plateau / tournoi"}
                {match.adversaire2 ? ` + ${match.adversaire2}` : ""}
              </p>
              <p className="text-xs text-foreground/50">
                {match.categorie} ·{" "}
                {formatParis(match.date_match, {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {match.competition ? ` · ${match.competition}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 gap-3 text-sm">
              <Link href={`/admin/matchs/${match.id}`} className="text-club-gold hover:underline">
                Modifier
              </Link>
              <form action={deleteMatch.bind(null, match.id)}>
                <ConfirmSubmitButton
                  confirmMessage="Supprimer ce match ?"
                  className="text-red-600 hover:underline"
                >
                  Supprimer
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
        {filtres.length === 0 && (
          <p className="p-4 text-sm text-foreground/60">Aucun match pour cette catégorie.</p>
        )}
      </div>
    </div>
  );
}
