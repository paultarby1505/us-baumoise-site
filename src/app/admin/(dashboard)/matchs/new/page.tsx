import { createMatch } from "@/app/admin/actions";
import MatchFormFields from "@/components/MatchFormFields";

export default async function NewMatchPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Nouveau match</h1>
      {error && (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      <form action={createMatch} className="mt-6 max-w-md space-y-4">
        <MatchFormFields />
        <button
          type="submit"
          className="rounded bg-club-gold px-4 py-2 font-semibold text-black hover:bg-club-gold-light"
        >
          Ajouter
        </button>
      </form>
    </div>
  );
}
