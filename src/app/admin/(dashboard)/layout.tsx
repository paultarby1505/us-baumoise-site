import Link from "next/link";
import type { Metadata } from "next";
import { logout } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s — Administration" },
  robots: { index: false, follow: false },
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-club-black text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="text-lg font-bold">Administration — US Baumoise</span>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm text-white/70 transition-colors hover:text-club-gold-light"
            >
              Déconnexion
            </button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-5 px-4 pb-3 text-sm">
          <Link href="/admin" className="hover:text-club-gold-light">
            Accueil
          </Link>
          <Link href="/admin/actualites" className="hover:text-club-gold-light">
            Actualités
          </Link>
          <Link href="/admin/effectif" className="hover:text-club-gold-light">
            Effectif
          </Link>
          <Link href="/admin/matchs" className="hover:text-club-gold-light">
            Matchs
          </Link>
          <Link href="/" className="ml-auto hover:text-club-gold-light">
            Voir le site →
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
