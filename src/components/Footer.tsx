import Image from "next/image";
import { siteConfig } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="mt-auto bg-club-black text-white/80 border-t-2 border-club-gold">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-8 text-sm">
        <Image src="/logo.png" alt="" width={64} height={40} className="h-10 w-auto" />
        <div>
          <p className="font-semibold text-white">{siteConfig.name}</p>
          <p className="mt-1">{siteConfig.ville} — Doubs</p>
          <p className="mt-4 text-white/60">
            © {new Date().getFullYear()} {siteConfig.name}. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
