"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/config";
import { CATEGORIES, categorySlug } from "@/lib/rugby";
import { subscribePush, unsubscribePush } from "@/app/actions";
import { urlBase64ToUint8Array } from "@/lib/push-client";

const NAV_LINKS = [
  { href: "/actualites", label: "Actualités" },
  { href: "/effectif", label: "Catégorie" },
  { href: "/matchs", label: "Matchs" },
  { href: "/resultats", label: "Résultats" },
  { href: "/classements", label: "Classements" },
  { href: "/partenaires", label: "Partenaires" },
  { href: "/galerie", label: "Galerie" },
];

function BurgerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function BellIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

/**
 * Bouton d'activation des notifications push. Ne s'affiche que si le
 * navigateur les supporte (jamais sur un vieux Safari desktop, par
 * exemple), et reflète l'état réel de l'abonnement au chargement.
 */
function NotificationButton() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !publicKey) return;

    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((sub) => {
        setSupported(true);
        setSubscribed(!!sub);
      })
      .catch(() => {});
  }, []);

  async function toggle() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey || busy) return;
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;

      if (subscribed) {
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          await unsubscribePush(sub.endpoint);
        }
        setSubscribed(false);
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Autorisation refusée : impossible d'activer les notifications.");
        return;
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const json = sub.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error("Abonnement incomplet (endpoint ou clés manquantes)");
      }
      const { ok } = await subscribePush({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      });
      if (!ok) throw new Error("Échec de l'enregistrement de l'abonnement côté serveur");
      setSubscribed(true);
    } catch (err) {
      console.error("Échec de l'abonnement aux notifications", err);
      alert("L'activation des notifications a échoué. Réessaie dans un instant.");
    } finally {
      setBusy(false);
    }
  }

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label={subscribed ? "Désactiver les notifications" : "Activer les notifications"}
      title={subscribed ? "Désactiver les notifications" : "Activer les notifications"}
      className="flex h-9 w-9 items-center justify-center rounded text-white hover:text-club-gold-light disabled:opacity-50"
    >
      <BellIcon active={subscribed} />
    </button>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-club-black text-white border-b-2 border-club-gold">
      <div className="flex items-center justify-between px-4 py-3 md:grid md:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          className="flex shrink-0 items-center justify-self-start gap-3"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/logo.png"
            alt=""
            width={70}
            height={44}
            className="h-11 w-auto shrink-0"
            priority
          />
          <span className="whitespace-nowrap font-heading text-lg font-bold tracking-wide">
            {siteConfig.shortName}
          </span>
        </Link>

        {/* Menu desktop */}
        <nav className="hidden items-center gap-1 text-sm font-medium uppercase tracking-wide md:flex">
          <Link
            href="/actualites"
            className="rounded-full px-3 py-1.5 transition-colors hover:bg-club-gold hover:text-black"
          >
            Actualités
          </Link>

          <div className="group relative">
            <Link
              href="/effectif"
              className="block rounded-full px-3 py-1.5 transition-colors hover:bg-club-gold hover:text-black"
            >
              Catégorie
            </Link>
            <div className="invisible absolute left-1/2 top-full z-10 w-44 -translate-x-1/2 pt-3 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
              <div className="overflow-hidden rounded-md border border-white/10 bg-club-black-soft py-2 shadow-lg">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={`/effectif/${categorySlug(cat)}`}
                    className="block px-4 py-1.5 text-xs normal-case tracking-normal text-white/80 transition-colors hover:bg-club-black hover:text-club-gold-light"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/matchs"
            className="rounded-full px-3 py-1.5 transition-colors hover:bg-club-gold hover:text-black"
          >
            Matchs
          </Link>
          <Link
            href="/resultats"
            className="rounded-full px-3 py-1.5 transition-colors hover:bg-club-gold hover:text-black"
          >
            Résultats
          </Link>
          <Link
            href="/classements"
            className="rounded-full px-3 py-1.5 transition-colors hover:bg-club-gold hover:text-black"
          >
            Classements
          </Link>
          <Link
            href="/partenaires"
            className="rounded-full px-3 py-1.5 transition-colors hover:bg-club-gold hover:text-black"
          >
            Partenaires
          </Link>
          <Link
            href="/galerie"
            className="rounded-full px-3 py-1.5 transition-colors hover:bg-club-gold hover:text-black"
          >
            Galerie
          </Link>
        </nav>

        <div className="flex items-center justify-self-end gap-1">
          {/* Bouton menu mobile */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded text-white hover:text-club-gold-light md:hidden"
          >
            {open ? <CloseIcon /> : <BurgerIcon />}
          </button>

          <NotificationButton />

          <Link
            href="/contact"
            aria-label="Nous contacter"
            className="flex h-9 w-9 items-center justify-center rounded text-white hover:text-club-gold-light"
          >
            <EnvelopeIcon />
          </Link>
        </div>
      </div>

      {/* Menu mobile */}
      {open && (
        <nav className="border-t border-white/10 px-4 pb-4 text-sm font-medium uppercase tracking-wide md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block border-b border-white/5 py-2.5 transition-colors hover:text-club-gold-light"
            >
              {link.label}
            </Link>
          ))}
          <p className="mt-3 text-xs font-semibold normal-case tracking-normal text-white/40">
            Catégorie
          </p>
          <div className="mt-2 grid grid-cols-3 gap-x-3 gap-y-2 pb-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/effectif/${categorySlug(cat)}`}
                onClick={() => setOpen(false)}
                className="text-xs normal-case tracking-normal text-white/70 transition-colors hover:text-club-gold-light"
              >
                {cat}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
