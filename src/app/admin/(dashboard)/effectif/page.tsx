import Image from "next/image";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { deleteJoueur } from "@/app/admin/actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import { categoryRank } from "@/lib/rugby";
import type { Joueur } from "@/lib/types";

export default async function AdminEffectifPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("joueurs")
    .select("*")
    .order("numero", { ascending: true });
  const joueurs = ((data ?? []) as Joueur[]).sort(
    (a, b) => categoryRank(a.categorie) - categoryRank(b.categorie)
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Effectif</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/effectif/categories"
            className="rounded border border-club-gold px-4 py-2 text-sm font-semibold text-club-gold hover:bg-club-gold/10"
          >
            En-têtes des catégories
          </Link>
          <Link
            href="/admin/effectif/new"
            className="rounded bg-club-gold px-4 py-2 text-sm font-semibold text-black hover:bg-club-gold-light"
          >
            + Nouveau joueur
          </Link>
        </div>
      </div>

      <div className="mt-6 divide-y divide-black/10 rounded-lg border border-black/10 bg-white">
        {joueurs.map((joueur) => (
          <div key={joueur.id} className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-club-black-soft">
                {joueur.photo_url ? (
                  <Image
                    src={joueur.photo_url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-full w-full p-2 text-white/25"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8v1H4v-1z" />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-semibold">
                  {joueur.numero ? `#${joueur.numero} — ` : ""}
                  {joueur.prenom} {joueur.nom}
                </p>
                <p className="text-xs text-foreground/50">
                  {joueur.categorie}
                  {joueur.poste ? ` · ${joueur.poste}` : ""}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-3 text-sm">
              <Link href={`/admin/effectif/${joueur.id}`} className="text-club-gold hover:underline">
                Modifier
              </Link>
              <form action={deleteJoueur.bind(null, joueur.id)}>
                <ConfirmSubmitButton
                  confirmMessage={`Supprimer ${joueur.prenom} ${joueur.nom} ?`}
                  className="text-red-600 hover:underline"
                >
                  Supprimer
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
        {joueurs.length === 0 && (
          <p className="p-4 text-sm text-foreground/60">Aucun joueur.</p>
        )}
      </div>
    </div>
  );
}
