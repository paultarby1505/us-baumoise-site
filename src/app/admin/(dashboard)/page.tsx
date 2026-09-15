import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";

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
  {
    href: "/admin/classements",
    label: "Classements",
    description: "Mettre à jour le classement des équipes par catégorie.",
  },
  {
    href: "/admin/apparence",
    label: "Apparence",
    description: "Changer la photo de fond de la page d'accueil.",
  },
  {
    href: "/admin/partenaires",
    label: "Partenaires",
    description: "Gérer les logos et fiches des partenaires du club.",
  },
  {
    href: "/admin/contacts",
    label: "Messages",
    description: "Consulter les messages envoyés via le formulaire de contact.",
  },
];

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const profile = await getCurrentProfile();

  const allSections =
    profile?.role === "owner"
      ? [
          ...sections,
          {
            href: "/admin/equipe",
            label: "Équipe",
            description: "Ajouter ou retirer des rédacteurs (réservé à toi).",
          },
        ]
      : sections;

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Tableau de bord</h1>
      {error && (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {allSections.map((section) => (
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
