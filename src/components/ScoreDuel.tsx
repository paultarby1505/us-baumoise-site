function ScoreCarre({ value, gagnant }: { value: number | null; gagnant: boolean }) {
  return (
    <span
      className={`flex h-9 min-w-9 items-center justify-center rounded border-2 border-black px-1 text-sm font-bold ${
        gagnant ? "bg-club-gold text-black" : ""
      }`}
    >
      {value ?? "–"}
    </span>
  );
}

export default function ScoreDuel({
  scoreGauche,
  scoreDroite,
}: {
  scoreGauche: number | null;
  scoreDroite: number | null;
}) {
  const matchJoue = scoreGauche !== null && scoreDroite !== null && scoreGauche !== scoreDroite;
  const gaucheGagne = matchJoue && scoreGauche! > scoreDroite!;
  const droiteGagne = matchJoue && scoreDroite! > scoreGauche!;

  return (
    <span className="flex items-center gap-2 whitespace-nowrap">
      <ScoreCarre value={scoreGauche} gagnant={gaucheGagne} />
      <span className="text-xs font-semibold uppercase text-foreground/50">vs</span>
      <ScoreCarre value={scoreDroite} gagnant={droiteGagne} />
    </span>
  );
}
