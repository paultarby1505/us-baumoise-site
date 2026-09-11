import Link from "next/link";

const sections = [
  {
    href: "/admin/actualites",
    label: "Actualités",
    description: "Ajouter, modifier ou supprimer des articles.",
  },
  {
    href: "/admin/effectif",
    label: "Effectif",
    description: "Gérer la liste des joueurs par catégorie.",
  },
  {
    href: "/admin/matchs",
    label: "Matchs",
    description: "Gérer le calendrier et les résultats.",
  },
];

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Tableau de bord</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-lg border border-black/10 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <h2 className="text-lg font-bold text-club-gold">{section.label}</h2>
            <p className="mt-2 text-sm text-foreground/70">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
