import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPartenaires } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Partenaires",
  description: "Les partenaires qui soutiennent le club US Baumoise Rugby.",
};

export default async function PartenairesPage() {
  const partenaires = await getPartenaires();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-extrabold">Nos partenaires</h1>
      <p className="mt-2 text-foreground/60">
        Ils soutiennent le club, merci à eux !
      </p>

      {partenaires.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partenaires.map((partenaire) => (
            <Link
              key={partenaire.id}
              href={`/partenaires/${partenaire.slug}`}
              className="rounded-lg border border-black/10 bg-white p-5 transition-shadow hover:shadow-md"
            >
              <div className="relative h-16 w-full">
                {partenaire.logo_url ? (
                  <Image
                    src={partenaire.logo_url}
                    alt=""
                    fill
                    className="object-contain object-left"
                    sizes="200px"
                  />
                ) : (
                  <p className="text-lg font-bold text-club-gold">{partenaire.nom}</p>
                )}
              </div>
              <p className="mt-3 font-semibold">{partenaire.nom}</p>
              {partenaire.resume && (
                <p className="mt-1 text-sm text-foreground/70">{partenaire.resume}</p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-foreground/60">Aucun partenaire pour le moment.</p>
      )}
    </div>
  );
}
