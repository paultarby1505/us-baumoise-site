import type { Metadata } from "next";
import { createContact } from "@/app/actions";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contacter le club de rugby US Baumoise à Baume-les-Dames (Doubs) : inscriptions, questions, demandes.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-extrabold">Nous contacter</h1>
      <p className="mt-2 text-foreground/60">
        Une question, une demande ? Remplis le formulaire ci-dessous, on te répond au plus vite.
      </p>

      {error && (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      {success && (
        <p className="mt-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Message envoyé, merci ! On revient vers toi rapidement.
        </p>
      )}

      <form action={createContact} className="mt-6 space-y-4">
        <input
          type="text"
          name="site"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm font-medium">
            Prénom
            <input
              type="text"
              name="prenom"
              required
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Nom
            <input
              type="text"
              name="nom"
              required
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm font-medium">
            Email
            <input
              type="email"
              name="email"
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Téléphone
            <input
              type="tel"
              name="telephone"
              className="mt-1 w-full rounded border border-black/20 px-3 py-2"
            />
          </label>
        </div>
        <p className="text-xs text-foreground/50">
          Renseigne au moins l&apos;un des deux pour qu&apos;on puisse te répondre.
        </p>
        <label className="block text-sm font-medium">
          Objet
          <input
            type="text"
            name="objet"
            required
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Message
          <textarea
            name="message"
            rows={6}
            required
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded bg-club-gold px-4 py-2 font-semibold text-black hover:bg-club-gold-light"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
