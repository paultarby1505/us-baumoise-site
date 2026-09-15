"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/config";
import { CATEGORIES, categorySlug } from "@/lib/rugby";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/actualites", label: "Actualités" },
  { href: "/effectif", label: "Effectif" },
  { href: "/matchs", label: "Matchs" },
  { href: "/galerie", label: "Galerie" },
  { href: "/partenaires", label: "Partenaires" },
];

function BurgerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-club-black text-white border-b-2 border-club-gold">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image src="/logo.png" alt="" width={70} height={44} className="h-11 w-auto" priority />
          <span className="text-lg font-bold tracking-wide">
            {siteConfig.shortName}
          </span>
        </Link>

        {/* Menu desktop — inchangé */}
        <nav className="hidden items-center gap-5 text-sm font-medium uppercase tracking-wide md:flex">
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
                    href={`/effectif/${categorySlug(cat)}`}
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
          <Link href="/partenaires" className="transition-colors hover:text-club-gold-light">
            Partenaires
          </Link>
        </nav>

        {/* Bouton menu mobile */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded text-white hover:text-club-gold-light md:hidden"
        >
          {open ? <CloseIcon /> : <BurgerIcon />}
        </button>
      </div>

      {/* Menu mobile */}
      {open && (
        <nav className="border-t border-white/10 px-4 pb-4 text-sm font-medium uppercase tracking-wide md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block border-b border-white/5 py-2.5 transition-colors hover:text-club-gold-light"
            >
              {link.label}
            </Link>
          ))}
          <p className="mt-3 text-xs font-semibold normal-case tracking-normal text-white/40">
            Effectif par catégorie
          </p>
          <div className="mt-2 grid grid-cols-3 gap-x-3 gap-y-2 pb-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/effectif/${categorySlug(cat)}`}
                onClick={() => setOpen(false)}
                className="text-xs normal-case tracking-normal text-white/70 transition-colors hover:text-club-gold-light"
              >
                {cat}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
