import { login } from "@/app/admin/actions";

export const metadata = { title: "Connexion admin", robots: { index: false, follow: false } };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-club-black px-4">
      <form
        action={login}
        className="w-full max-w-sm rounded-lg border border-white/10 bg-club-black-soft p-8"
      >
        <h1 className="text-xl font-bold text-white">Connexion administrateur</h1>
        {error && (
          <p className="mt-4 rounded bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}
        <label className="mt-6 block text-sm text-white/70">
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
          Mot de passe
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded border border-white/20 bg-transparent px-3 py-2 text-white outline-none focus:border-club-gold"
          />
        </label>
        <button
          type="submit"
          className="mt-6 w-full rounded bg-club-gold py-2 font-semibold text-black hover:bg-club-gold-light"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
}
