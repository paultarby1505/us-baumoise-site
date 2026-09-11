import { siteConfig } from "@/lib/config";

export default function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "SportsClub",
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    sport: "Rugby",
    foundingDate: "1995",
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.ville,
      addressRegion: "Doubs",
      addressCountry: "FR",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
