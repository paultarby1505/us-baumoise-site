"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { updateMatchComposition } from "@/app/admin/actions";
import { COMPOSITION_ROWS, REMPLACANTS_ROWS, slotLabel } from "@/lib/rugby";
import type { Joueur } from "@/lib/types";

function SilhouetteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full p-2 text-white/25" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8v1H4v-1z" />
    </svg>
  );
}

function PlayerAvatar({ joueur, size = 44 }: { joueur: Joueur; size?: number }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border border-black/10 bg-club-black-soft"
      style={{ width: size, height: size }}
    >
      {joueur.photo_url ? (
        <Image src={joueur.photo_url} alt="" fill className="object-cover" sizes={`${size}px`} />
      ) : (
        <SilhouetteIcon />
      )}
    </div>
  );
}

export default function CompositionBuilder({
  matchId,
  joueurs,
  initial,
}: {
  matchId: string;
  joueurs: Joueur[];
  initial: { slot: number; joueur_id: string }[];
}) {
  const [slots, setSlots] = useState<Record<number, string | null>>(() => {
    const base: Record<number, string | null> = {};
    for (let s = 1; s <= 23; s++) base[s] = null;
    for (const entry of initial) base[entry.slot] = entry.joueur_id;
    return base;
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const joueursById = useMemo(() => new Map(joueurs.map((j) => [j.id, j])), [joueurs]);

  const assignedIds = useMemo(
    () => new Set(Object.values(slots).filter((v): v is string => v !== null)),
    [slots]
  );

  const pool = useMemo(() => {
    const q = query.trim().toLowerCase();
    return joueurs.filter((j) => {
      if (assignedIds.has(j.id)) return false;
      if (!q) return true;
      return `${j.prenom} ${j.nom}`.toLowerCase().includes(q);
    });
  }, [joueurs, assignedIds, query]);

  function assign(joueurId: string, targetSlot: number) {
    setSlots((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        const s = Number(key);
        if (next[s] === joueurId) next[s] = null;
      }
      next[targetSlot] = joueurId;
      return next;
    });
    setSelected(null);
  }

  function unassign(slot: number) {
    setSlots((prev) => ({ ...prev, [slot]: null }));
  }

  function returnToPool(joueurId: string) {
    setSlots((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        const s = Number(key);
        if (next[s] === joueurId) next[s] = null;
      }
      return next;
    });
  }

  function clickPoolCard(joueurId: string) {
    setSelected((prev) => (prev === joueurId ? null : joueurId));
  }

  function clickSlot(slot: number) {
    if (selected) {
      assign(selected, slot);
      return;
    }
    const occupant = slots[slot];
    if (occupant) {
      unassign(slot);
      setSelected(occupant);
    }
  }

  function handleClear() {
    setSlots(() => {
      const base: Record<number, string | null> = {};
      for (let s = 1; s <= 23; s++) base[s] = null;
      return base;
    });
    setSelected(null);
  }

  function renderSlot(slot: number) {
    const joueur = slots[slot] ? joueursById.get(slots[slot]!) : undefined;
    return (
      <button
        key={slot}
        type="button"
        onClick={() => clickSlot(slot)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const id = e.dataTransfer.getData("text/plain");
          if (id) assign(id, slot);
        }}
        draggable={Boolean(joueur)}
        onDragStart={(e) => {
          if (joueur) e.dataTransfer.setData("text/plain", joueur.id);
        }}
        className={`flex w-20 flex-col items-center gap-1 rounded-lg border p-2 text-center transition-colors sm:w-24 ${
          joueur
            ? "border-club-gold bg-club-black-soft"
            : "border-dashed border-white/20 hover:border-club-gold/60"
        }`}
      >
        {joueur ? (
          <PlayerAvatar joueur={joueur} />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-white/20 text-xs text-white/40">
            {slot}
          </div>
        )}
        <p className="w-full truncate text-[11px] font-semibold text-white">
          {joueur ? `${joueur.prenom} ${joueur.nom}` : slotLabel(slot)}
        </p>
        <p className="text-[10px] text-white/40">
          {slot}. {slotLabel(slot)}
        </p>
      </button>
    );
  }

  function handleSave() {
    const entries = Object.entries(slots)
      .filter(([, joueurId]) => joueurId)
      .map(([slot, joueurId]) => ({ slot: Number(slot), joueur_id: joueurId }));
    const formData = new FormData();
    formData.set("composition", JSON.stringify(entries));
    startTransition(() => {
      updateMatchComposition(matchId, formData);
    });
  }

  return (
    <div>
      <p className="max-w-xl text-xs text-foreground/50">
        Clique un joueur dans la liste puis clique un poste pour le placer (ou fais-le
        glisser). Clique un poste déjà rempli pour reprendre le joueur en main.
      </p>

      <div
        className="mt-4 space-y-3 rounded-lg bg-club-black p-4 sm:p-6"
        onDragOver={(e) => e.preventDefault()}
      >
        {COMPOSITION_ROWS.map((row, i) => (
          <div key={i} className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {row.map((slot) => renderSlot(slot))}
          </div>
        ))}
      </div>

      <div
        className="mt-4 space-y-3 rounded-lg bg-club-black-soft p-4 sm:p-6"
        onDragOver={(e) => e.preventDefault()}
      >
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-white/50">
          Remplaçants
        </p>
        {REMPLACANTS_ROWS.map((row, i) => (
          <div key={i} className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {row.map((slot) => renderSlot(slot))}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded bg-club-gold px-4 py-2 text-sm font-semibold text-black hover:bg-club-gold-light disabled:opacity-50"
        >
          {isPending ? "Enregistrement…" : "Enregistrer la composition"}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="text-sm text-red-600 hover:underline"
        >
          Tout vider
        </button>
      </div>

      <div
        className="mt-6"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const id = e.dataTransfer.getData("text/plain");
          if (id) returnToPool(id);
        }}
      >
        <label className="block text-sm font-medium">
          Rechercher un joueur
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom du joueur…"
            className="mt-1 w-full max-w-xs rounded border border-black/20 px-3 py-2"
          />
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {pool.map((joueur) => (
            <button
              key={joueur.id}
              type="button"
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", joueur.id)}
              onClick={() => clickPoolCard(joueur.id)}
              className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm transition-colors ${
                selected === joueur.id
                  ? "border-club-gold bg-club-gold/10"
                  : "border-black/10 bg-white hover:border-club-gold/50"
              }`}
            >
              <PlayerAvatar joueur={joueur} size={28} />
              <span>
                {joueur.numero ? `#${joueur.numero} ` : ""}
                {joueur.prenom} {joueur.nom}
              </span>
            </button>
          ))}
          {pool.length === 0 && (
            <p className="text-sm text-foreground/50">
              {joueurs.length === 0
                ? "Aucun joueur dans l'effectif."
                : "Tous les joueurs disponibles sont déjà placés."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
