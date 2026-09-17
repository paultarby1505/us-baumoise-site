function ScoreCarre({ value }: { value: number | null }) {
  return (
    <span className="flex h-9 min-w-9 items-center justify-center rounded border-2 border-black px-1 text-sm font-bold">
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
  return (
    <span className="flex items-center gap-2 whitespace-nowrap">
      <ScoreCarre value={scoreGauche} />
      <span className="text-xs font-semibold uppercase text-foreground/50">vs</span>
      <ScoreCarre value={scoreDroite} />
    </span>
  );
}
