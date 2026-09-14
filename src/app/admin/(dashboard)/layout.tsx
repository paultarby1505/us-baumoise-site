import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { logout } from "@/app/admin/actions";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s — Administration" },
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Le proxy garantit déjà une session pour arriver ici, mais un compte
  // dont le profil a été retiré (accès révoqué) doit être déconnecté
  // plutôt que de continuer à voir le tableau de bord.
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };

  if (!profile) {
    await supabase.auth.signOut();
    redirect(`/admin/login?error=${encodeURIComponent("Ton accès a été révoqué.")}`);
  }

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
          <Link href="/admin/apparence" className="hover:text-club-gold-light">
            Apparence
          </Link>
          {profile.role === "owner" && (
            <Link href="/admin/equipe" className="hover:text-club-gold-light">
              Équipe
            </Link>
          )}
          <Link href="/" className="ml-auto hover:text-club-gold-light">
            Voir le site →
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
