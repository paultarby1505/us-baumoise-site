import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/config";
import { CATEGORIES, categorySlug } from "@/lib/rugby";

export default function Header() {
  return (
    <header className="bg-club-black text-white border-b-2 border-club-gold">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="" width={70} height={44} className="h-11 w-auto" priority />
          <span className="text-lg font-bold tracking-wide">
            {siteConfig.shortName}
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium uppercase tracking-wide">
          <Link href="/" className="transition-colors hover:text-club-gold-light">
            Accueil
          </Link>
          <Link href="/actualites" className="transition-colors hover:text-club-gold-light">
            Actualités
          </Link>

          <div className="group relative">
            <Link href="/effectif" className="transition-colors hover:text-club-gold-light">
              Effectif
            </Link>
            <div className="invisible absolute left-1/2 top-full z-10 w-44 -translate-x-1/2 pt-3 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
              <div className="overflow-hidden rounded-md border border-white/10 bg-club-black-soft py-2 shadow-lg">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={`/effectif#${categorySlug(cat)}`}
                    className="block px-4 py-1.5 text-xs normal-case tracking-normal text-white/80 transition-colors hover:bg-club-black hover:text-club-gold-light"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link href="/matchs" className="transition-colors hover:text-club-gold-light">
            Matchs
          </Link>
          <Link href="/galerie" className="transition-colors hover:text-club-gold-light">
            Galerie
          </Link>
        </nav>
      </div>
    </header>
  );
}
