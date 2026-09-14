import Link from "next/link";
import { getCategoriePages } from "@/lib/queries";
import { CATEGORIES, categorySlug } from "@/lib/rugby";

export default async function AdminCategoriesPage() {
  const pages = await getCategoriePages();
  const byCategorie = new Map(pages.map((p) => [p.categorie, p]));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">En-têtes des catégories</h1>
        <Link href="/admin/effectif" className="text-sm text-club-gold hover:underline">
          ← Effectif
        </Link>
      </div>
      <p className="mt-2 max-w-xl text-sm text-foreground/60">
        Chaque catégorie a sa propre page publique. Ajoute une photo et un texte
        d&apos;en-tête ; sans photo, le bandeau noir classique s&apos;affiche.
      </p>

      <div className="mt-6 divide-y divide-black/10 rounded-lg border border-black/10 bg-white">
        {CATEGORIES.map((cat) => {
          const page = byCategorie.get(cat);
          return (
            <Link
              key={cat}
              href={`/admin/effectif/categories/${categorySlug(cat)}`}
              className="flex items-center justify-between gap-4 p-4 hover:bg-neutral-50"
            >
              <div>
                <p className="font-semibold">{cat}</p>
                <p className="text-xs text-foreground/50">
                  {page?.header_image_url ? "Photo personnalisée" : "Bandeau noir par défaut"}
                  {page?.header_titre ? ` · « ${page.header_titre} »` : ""}
                </p>
              </div>
              <span className="text-sm text-club-gold">Modifier →</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
