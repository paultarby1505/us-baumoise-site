import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    // Le quota gratuit d'optimisation d'images de Vercel est épuisé : au-delà,
    // /_next/image répond 402 et les photos ne s'affichent plus. Les images
    // sont donc servies telles quelles depuis Supabase, déjà compressées à
    // l'envoi dans l'admin.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "geefzxozzuvrqvuuvxkr.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        // Le navigateur doit toujours récupérer la dernière version du
        // service worker, jamais une copie en cache.
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
