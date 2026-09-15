import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { getPartenaires } from "@/lib/queries";

export default async function Footer() {
  const partenaires = await getPartenaires();

  return (
    <footer className="mt-auto bg-club-black text-white/80 border-t-2 border-club-gold">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm">
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="" width={64} height={40} className="h-10 w-auto" />
          <div>
            <p className="font-semibold text-white">{siteConfig.name}</p>
            <p className="mt-1">{siteConfig.ville} — Doubs</p>
            <p className="mt-4 text-white/60">
              © {new Date().getFullYear()} {siteConfig.name}. Tous droits réservés.
            </p>
          </div>
        </div>

        {partenaires.length > 0 && (
          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
              Nos partenaires
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-6">
              {partenaires.map((partenaire) => (
                <Link
                  key={partenaire.id}
                  href={`/partenaires/${partenaire.slug}`}
                  title={partenaire.nom}
                  className="relative h-10 w-24 opacity-80 transition-opacity hover:opacity-100"
                >
                  {partenaire.logo_url ? (
                    <Image
                      src={partenaire.logo_url}
                      alt={partenaire.nom}
                      fill
                      className="object-contain object-left"
                      sizes="96px"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-white">{partenaire.nom}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
