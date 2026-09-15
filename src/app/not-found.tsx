import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-24 text-center">
      <h1 className="text-3xl font-extrabold">Page introuvable</h1>
      <p className="mt-3 text-foreground/60">
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="mt-6 rounded bg-club-gold px-4 py-2 font-semibold text-black hover:bg-club-gold-light"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
