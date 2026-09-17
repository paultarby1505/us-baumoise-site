import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site de l'US Baumoise Rugby.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-extrabold">Mentions légales</h1>

      <div className="mt-6 space-y-6 leading-relaxed text-foreground/80">
        <section>
          <h2 className="text-lg font-bold text-club-gold">Éditeur du site</h2>
          <p className="mt-2">
            Le site usbaumoise.fr est édité par l&apos;US Baumoise Rugby, association sportive
            loi 1901, dont le siège est situé au Stade de la Prairie, Baume-les-Dames (Doubs)
            — SIREN 778 276 915.
          </p>
          <p className="mt-2">
            Responsable de la publication : Simon Courbet, Président de l&apos;US Baumoise
            Rugby.
          </p>
          <p className="mt-2">
            Contact : <a href="mailto:secretariat.usb@orange.fr" className="text-club-gold hover:underline">secretariat.usb@orange.fr</a>
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-club-gold">Hébergement</h2>
          <p className="mt-2">
            Le site est hébergé par Vercel Inc. (
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-club-gold hover:underline"
            >
              vercel.com
            </a>
            ). Les données du club (actualités, effectif, matchs, messages de contact...) sont
            hébergées par Supabase, sur des serveurs situés en France.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-club-gold">Propriété intellectuelle</h2>
          <p className="mt-2">
            L&apos;ensemble des contenus présents sur ce site (textes, photos, logo) est la
            propriété de l&apos;US Baumoise Rugby, sauf mention contraire. Toute reproduction
            sans autorisation préalable est interdite.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-club-gold">Données personnelles</h2>
          <p className="mt-2">
            Le traitement des données personnelles collectées sur ce site est détaillé dans
            notre{" "}
            <a href="/politique-de-confidentialite" className="text-club-gold hover:underline">
              politique de confidentialité
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
