import { setupAdmin } from "@/app/admin/actions";

export const metadata = { title: "Configuration admin", robots: { index: false, follow: false } };

export default async function AdminSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-club-black px-4">
      <div className="w-full max-w-sm rounded-lg border border-white/10 bg-club-black-soft p-8">
        <h1 className="text-xl font-bold text-white">Création du compte admin</h1>
        <p className="mt-2 text-sm text-white/60">
          Cette page ne sert qu&apos;une seule fois, pour créer le compte administrateur.
          Elle sera supprimée juste après.
        </p>

        {success && (
          <p className="mt-4 rounded bg-green-500/10 px-3 py-2 text-sm text-green-400">
            Compte créé ! Tu peux maintenant te connecter sur{" "}
            <a href="/admin/login" className="underline">
              /admin/login
            </a>
            .
          </p>
        )}
        {error && (
          <p className="mt-4 rounded bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        {!success && (
          <form action={setupAdmin} className="mt-6">
            <label className="block text-sm text-white/70">
              Email
              <input
                type="email"
                name="email"
                required
                autoComplete="username"
                className="mt-1 w-full rounded border border-white/20 bg-transparent px-3 py-2 text-white outline-none focus:border-club-gold"
              />
            </label>
            <label className="mt-4 block text-sm text-white/70">
              Mot de passe (6 caractères minimum)
              <input
                type="password"
                name="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="mt-1 w-full rounded border border-white/20 bg-transparent px-3 py-2 text-white outline-none focus:border-club-gold"
              />
            </label>
            <button
              type="submit"
              className="mt-6 w-full rounded bg-club-gold py-2 font-semibold text-black hover:bg-club-gold-light"
            >
              Créer le compte
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
