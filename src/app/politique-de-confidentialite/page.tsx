import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité du site de l'US Baumoise Rugby.",
  alternates: { canonical: "/politique-de-confidentialite" },
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-extrabold">Politique de confidentialité</h1>
      <p className="mt-2 text-foreground/60">
        Cette page explique quelles données sont collectées sur usbaumoise.fr, pourquoi, et
        comment les exercer.
      </p>

      <div className="mt-6 space-y-6 leading-relaxed text-foreground/80">
        <section>
          <h2 className="text-lg font-bold text-club-gold">Données collectées</h2>
          <p className="mt-2">
            La seule donnée personnelle collectée sur ce site est celle que tu nous transmets
            volontairement via le{" "}
            <a href="/contact" className="text-club-gold hover:underline">
              formulaire de contact
            </a>{" "}
            : nom, prénom, email et/ou téléphone, objet et message.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-club-gold">Pourquoi on les collecte</h2>
          <p className="mt-2">
            Ces informations servent uniquement à répondre à ta demande. Elles ne sont ni
            revendues, ni transmises à des tiers, ni utilisées à des fins publicitaires.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-club-gold">Qui y a accès</h2>
          <p className="mt-2">
            Seuls les membres de l&apos;équipe du club ayant un accès administrateur au site
            peuvent consulter les messages reçus.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-club-gold">Durée de conservation</h2>
          <p className="mt-2">
            Les messages sont conservés le temps nécessaire pour traiter ta demande, puis
            supprimés. Tu peux aussi en demander la suppression à tout moment (voir
            ci-dessous).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-club-gold">Hébergement des données</h2>
          <p className="mt-2">
            Les données sont hébergées par Supabase, sur des serveurs situés en France.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-club-gold">Cookies</h2>
          <p className="mt-2">
            Le site n&apos;utilise aucun cookie de suivi ou publicitaire pour ses visiteurs.
            Un cookie technique de session est utilisé uniquement pour l&apos;espace
            d&apos;administration, réservé à l&apos;équipe du club.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-club-gold">Tes droits</h2>
          <p className="mt-2">
            Conformément au RGPD, tu disposes d&apos;un droit d&apos;accès, de rectification et
            de suppression des données te concernant. Pour l&apos;exercer, écris-nous à{" "}
            <a href="mailto:secretariat.usb@orange.fr" className="text-club-gold hover:underline">
              secretariat.usb@orange.fr
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
