import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getGalleryPhotos } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galerie",
  description:
    "Toutes les photos du club de rugby US Baumoise à Baume-les-Dames (Doubs) : matchs, événements et vie du club.",
};

export default async function GaleriePage() {
  const photos = await getGalleryPhotos();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-extrabold">Galerie</h1>
      <p className="mt-2 text-sm text-foreground/60">
        Toutes les photos publiées dans les actualités du club.
      </p>

      {photos.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <Link
              key={photo.id}
              href={photo.actualite ? `/actualites/${photo.actualite.slug}` : "#"}
              className="group relative block aspect-square overflow-hidden rounded-lg bg-club-black-soft"
            >
              <Image
                src={photo.url}
                alt={photo.actualite?.titre ?? ""}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              />
              {photo.actualite && (
                <span className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {photo.actualite.titre}
                </span>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-foreground/60">Aucune photo pour le moment.</p>
      )}
    </div>
  );
}
