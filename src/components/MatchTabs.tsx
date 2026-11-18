"use client";

import { useState } from "react";

type Tab = "resume" | "infos" | "composition";

export default function MatchTabs({
  defaultTab,
  infoTab,
  compositionTab,
  resumeTab,
}: {
  defaultTab: Tab;
  infoTab: React.ReactNode;
  compositionTab: React.ReactNode;
  resumeTab?: React.ReactNode;
}) {
  const [tab, setTab] = useState<Tab>(defaultTab);

  const tabs: { id: Tab; label: string }[] = [
    ...(resumeTab ? [{ id: "resume" as const, label: "Résumé" }] : []),
    { id: "infos", label: "Infos" },
    { id: "composition", label: "Composition" },
  ];

  return (
    <div>
      <div className="mt-6 flex gap-2 border-b border-black/10">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.id
                ? "border-b-2 border-club-gold text-club-gold"
                : "text-foreground/50 hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tab === "resume" && resumeTab ? resumeTab : tab === "composition" ? compositionTab : infoTab}
      </div>
    </div>
  );
}
