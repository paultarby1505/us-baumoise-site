import Image from "next/image";
import Link from "next/link";
import { getPartenaires } from "@/lib/queries";
import { deletePartenaire } from "@/app/admin/actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";

export default async function AdminPartenairesPage() {
  const partenaires = await getPartenaires();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Partenaires</h1>
        <Link
          href="/admin/partenaires/new"
          className="rounded bg-club-gold px-4 py-2 text-sm font-semibold text-black hover:bg-club-gold-light"
        >
          + Nouveau partenaire
        </Link>
      </div>

      <div className="mt-6 divide-y divide-black/10 rounded-lg border border-black/10 bg-white">
        {partenaires.map((partenaire) => (
          <div key={partenaire.id} className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-black/10 bg-white">
                {partenaire.logo_url ? (
                  <Image
                    src={partenaire.logo_url}
                    alt=""
                    fill
                    className="object-contain p-1"
                    sizes="40px"
                  />
                ) : null}
              </div>
              <div>
                <p className="font-semibold">{partenaire.nom}</p>
                {partenaire.resume && (
                  <p className="text-xs text-foreground/50">{partenaire.resume}</p>
                )}
              </div>
            </div>
            <div className="flex shrink-0 gap-3 text-sm">
              <Link
                href={`/admin/partenaires/${partenaire.id}`}
                className="text-club-gold hover:underline"
              >
                Modifier
              </Link>
              <form action={deletePartenaire.bind(null, partenaire.id)}>
                <ConfirmSubmitButton
                  confirmMessage={`Supprimer ${partenaire.nom} ?`}
                  className="text-red-600 hover:underline"
                >
                  Supprimer
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
        {partenaires.length === 0 && (
          <p className="p-4 text-sm text-foreground/60">Aucun partenaire.</p>
        )}
      </div>
    </div>
  );
}
