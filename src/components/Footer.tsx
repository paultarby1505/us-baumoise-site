import { siteConfig } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="mt-auto bg-club-green-dark text-white/80">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm">
        <p className="font-semibold text-white">{siteConfig.name}</p>
        <p className="mt-1">{siteConfig.ville} — Doubs</p>
        <p className="mt-4 text-white/60">
          © {new Date().getFullYear()} {siteConfig.name}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
