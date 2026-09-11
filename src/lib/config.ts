export const siteConfig = {
  name: "US Baumoise Rugby",
  shortName: "US Baumoise",
  description:
    "Site officiel de l'US Baumoise, club de rugby de Baume-les-Dames (Doubs). Actualités, effectif et calendrier des matchs.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  locale: "fr_FR",
  ville: "Baume-les-Dames",
};
