import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { addTeamMember, removeTeamMember } from "@/app/admin/actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";

export default async function EquipePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const profile = await getCurrentProfile();

  if (profile?.role !== "owner") {
    redirect(`/admin?error=${encodeURIComponent("Réservé au propriétaire du site.")}`);
  }

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });
  const membres = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Équipe</h1>
      <p className="mt-2 max-w-xl text-sm text-foreground/60">
        Les personnes listées ci-dessous peuvent ajouter, modifier et supprimer le
        contenu du site (actualités, effectif, matchs). Toi seul peux ajouter ou
        retirer des membres — cette page n&apos;est visible que par toi.
      </p>

      {error && (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      {success && (
        <p className="mt-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Compte créé. Transmets les identifiants à la personne concernée.
        </p>
      )}

      <div className="mt-6 divide-y divide-black/10 rounded-lg border border-black/10 bg-white">
        {membres.map((membre) => (
          <div key={membre.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-semibold">{membre.email}</p>
              <p className="text-xs text-foreground/50">
                {membre.role === "owner" ? "Propriétaire" : "Rédacteur"}
              </p>
            </div>
            {membre.role !== "owner" && (
              <form action={removeTeamMember.bind(null, membre.id)}>
                <ConfirmSubmitButton
                  confirmMessage={`Retirer l'accès de ${membre.email} ?`}
                  className="text-sm text-red-600 hover:underline"
                >
                  Retirer
                </ConfirmSubmitButton>
              </form>
            )}
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-bold">Ajouter un rédacteur</h2>
      <form action={addTeamMember} className="mt-4 max-w-sm space-y-4">
        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            name="email"
            required
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Mot de passe temporaire (6 caractères minimum)
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <p className="text-xs text-foreground/50">
          Transmets ces identifiants à la personne : elle pourra se connecter sur
          /admin/login. Elle ne pourra ni ajouter ni retirer de membres.
        </p>
        <button
          type="submit"
          className="rounded bg-club-gold px-4 py-2 font-semibold text-black hover:bg-club-gold-light"
        >
          Ajouter
        </button>
      </form>
    </div>
  );
}
