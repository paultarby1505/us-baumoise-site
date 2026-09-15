import type { MetadataRoute } from "next";
import { getActualites, getMatchs, getPartenaires } from "@/lib/queries";
import { siteConfig } from "@/lib/config";
import { CATEGORIES, categorySlug } from "@/lib/rugby";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [actualites, matchs, partenaires] = await Promise.all([
    getActualites(),
    getMatchs(),
    getPartenaires(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: "daily", priority: 1 },
    { url: `${siteConfig.url}/actualites`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteConfig.url}/effectif`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteConfig.url}/matchs`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteConfig.url}/classements`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteConfig.url}/galerie`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${siteConfig.url}/partenaires`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteConfig.url}/contact`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const categorieRoutes: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${siteConfig.url}/effectif/${categorySlug(cat)}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const newsRoutes: MetadataRoute.Sitemap = actualites.map((actu) => ({
    url: `${siteConfig.url}/actualites/${actu.slug}`,
    lastModified: actu.publie_le,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const matchRoutes: MetadataRoute.Sitemap = matchs.map((match) => ({
    url: `${siteConfig.url}/matchs/${match.id}`,
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  const partenaireRoutes: MetadataRoute.Sitemap = partenaires.map((partenaire) => ({
    url: `${siteConfig.url}/partenaires/${partenaire.slug}`,
    changeFrequency: "monthly",
    priority: 0.3,
  }));

  return [
    ...staticRoutes,
    ...categorieRoutes,
    ...newsRoutes,
    ...matchRoutes,
    ...partenaireRoutes,
  ];
}
