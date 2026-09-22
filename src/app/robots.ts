import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  // Chaque déploiement de preview sert le même contenu que la production sous
  // une URL *.vercel.app différente. On les tient hors de l'index pour ne pas
  // multiplier les pages en double, la production restant la seule crawlable.
  if (process.env.VERCEL_ENV === "preview") {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
