import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/config";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/actualites", label: "Actualités" },
  { href: "/effectif", label: "Effectif" },
  { href: "/matchs", label: "Matchs" },
];

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
        <nav className="flex gap-5 text-sm font-medium uppercase tracking-wide">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-club-gold-light"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
