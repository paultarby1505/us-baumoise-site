"use client";

import { useState } from "react";

export default function MatchTabs({
  defaultTab,
  infoTab,
  compositionTab,
}: {
  defaultTab: "infos" | "composition";
  infoTab: React.ReactNode;
  compositionTab: React.ReactNode;
}) {
  const [tab, setTab] = useState<"infos" | "composition">(defaultTab);

  return (
    <div>
      <div className="mt-6 flex gap-2 border-b border-black/10">
        <button
          type="button"
          onClick={() => setTab("infos")}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "infos"
              ? "border-b-2 border-club-gold text-club-gold"
              : "text-foreground/50 hover:text-foreground"
          }`}
        >
          Infos
        </button>
        <button
          type="button"
          onClick={() => setTab("composition")}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "composition"
              ? "border-b-2 border-club-gold text-club-gold"
              : "text-foreground/50 hover:text-foreground"
          }`}
        >
          Composition
        </button>
      </div>
      <div className="mt-6">{tab === "infos" ? infoTab : compositionTab}</div>
    </div>
  );
}
