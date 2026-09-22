import type { Metadata } from "next";
import { getClassements } from "@/lib/queries";
import ClassementTable from "@/components/ClassementTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Classements",
  description:
    "Classements des équipes de rugby du championnat où évolue l'US Baumoise, club de Baume-les-Dames (Doubs).",
  alternates: { canonical: "/classements" },
};

export default async function ClassementsPage() {
  const lignes = await getClassements();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-extrabold">Classements</h1>
      <p className="mt-2 text-foreground/60">Choisis une catégorie pour voir son classement.</p>

      <div className="mt-6">
        <ClassementTable lignes={lignes} />
      </div>
    </div>
  );
}
