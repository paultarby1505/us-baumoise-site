import Link from "next/link";
import { siteConfig } from "@/lib/config";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/actualites", label: "Actualités" },
  { href: "/effectif", label: "Effectif" },
  { href: "/matchs", label: "Matchs" },
];

export default function Header() {
  return (
    <header className="bg-club-green text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold tracking-wide">
          {siteConfig.shortName}
        </Link>
        <nav className="flex gap-5 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-club-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
