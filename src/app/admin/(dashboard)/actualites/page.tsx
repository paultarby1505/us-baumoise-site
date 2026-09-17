import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { deleteActualite } from "@/app/admin/actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import type { Actualite } from "@/lib/types";
import { formatParis } from "@/lib/date-fr";

export default async function AdminActualitesPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("actualites")
    .select("*")
    .order("publie_le", { ascending: false });
  const actualites = (data ?? []) as Actualite[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Actualités</h1>
        <Link
          href="/admin/actualites/new"
          className="rounded bg-club-gold px-4 py-2 text-sm font-semibold text-black hover:bg-club-gold-light"
        >
          + Nouvelle actualité
        </Link>
      </div>

      <div className="mt-6 divide-y divide-black/10 rounded-lg border border-black/10 bg-white">
        {actualites.map((actu) => (
          <div key={actu.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-semibold">{actu.titre}</p>
              <p className="text-xs text-foreground/50">
                {formatParis(actu.publie_le, { day: "numeric", month: "numeric", year: "numeric" })}
              </p>
            </div>
            <div className="flex shrink-0 gap-3 text-sm">
              <Link href={`/admin/actualites/${actu.id}`} className="text-club-gold hover:underline">
                Modifier
              </Link>
              <form action={deleteActualite.bind(null, actu.id)}>
                <ConfirmSubmitButton
                  confirmMessage={`Supprimer l'actualité "${actu.titre}" ?`}
                  className="text-red-600 hover:underline"
                >
                  Supprimer
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
        {actualites.length === 0 && (
          <p className="p-4 text-sm text-foreground/60">Aucune actualité.</p>
        )}
      </div>
    </div>
  );
}
