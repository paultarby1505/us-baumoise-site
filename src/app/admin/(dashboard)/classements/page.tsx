import Link from "next/link";
import { getClassements } from "@/lib/queries";
import { deleteClassement } from "@/app/admin/actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import { MATCH_CATEGORIES } from "@/lib/rugby";

export default async function AdminClassementsPage() {
  const lignes = await getClassements();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Classements</h1>
        <Link
          href="/admin/classements/new"
          className="rounded bg-club-gold px-4 py-2 text-sm font-semibold text-black hover:bg-club-gold-light"
        >
          + Nouvelle ligne
        </Link>
      </div>

      {lignes.length === 0 && (
        <p className="mt-6 text-sm text-foreground/60">Aucun classement pour le moment.</p>
      )}

      {MATCH_CATEGORIES.map((cat) => {
        const rows = lignes.filter((l) => l.categorie === cat);
        if (rows.length === 0) return null;
        return (
          <div key={cat} className="mt-8">
            <h2 className="text-lg font-bold text-club-gold">{cat}</h2>
            <div className="mt-3 divide-y divide-black/10 rounded-lg border border-black/10 bg-white">
              {rows.map((ligne) => (
                <div key={ligne.id} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-semibold">
                      {ligne.equipe}
                      {ligne.notre_club && (
                        <span className="ml-2 text-xs font-semibold text-club-gold">
                          (notre club)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-foreground/50">
                      {ligne.joues} J · {ligne.gagnes} G · {ligne.nuls} N · {ligne.perdus} P ·{" "}
                      {ligne.points_classement} pts
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-3 text-sm">
                    <Link
                      href={`/admin/classements/${ligne.id}`}
                      className="text-club-gold hover:underline"
                    >
                      Modifier
                    </Link>
                    <form action={deleteClassement.bind(null, ligne.id)}>
                      <ConfirmSubmitButton
                        confirmMessage={`Supprimer ${ligne.equipe} ?`}
                        className="text-red-600 hover:underline"
                      >
                        Supprimer
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
