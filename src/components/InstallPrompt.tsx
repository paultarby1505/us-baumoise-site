"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

// Mémorise que le visiteur a fermé la popup : elle ne revient plus ensuite.
const STORAGE_KEY = "usb-install-prompt-dismissed";

type Platform = "ios" | "android";

// Événement non standard émis par Chrome / Android avant sa propre bannière
// d'installation. On le garde pour proposer un bouton "Installer" direct.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function detectPlatform(): Platform | null {
  const ua = navigator.userAgent;
  // Les iPad récents se présentent comme un Mac : on les reconnaît à l'écran tactile.
  const isIOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS) return "ios";
  if (/Android/i.test(ua)) return "android";
  return null;
}

function isInstalled() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function readDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline h-5 w-5 align-[-4px] text-[#007aff]"
      aria-label="Partager"
    >
      <path d="M12 3v12M8 7l4-4 4 4" />
      <path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
    </svg>
  );
}

function PlusSquareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="inline h-5 w-5 align-[-4px]"
      aria-hidden="true"
    >
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function KebabIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="inline h-5 w-5 align-[-4px]"
      aria-label="Menu"
    >
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}

function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-club-gold text-sm font-bold text-club-black">
        {n}
      </span>
      <span className="leading-6">{children}</span>
    </li>
  );
}

/**
 * Popup affichée sur mobile à la première visite pour expliquer comment
 * installer l'application sur l'écran d'accueil (instructions différentes
 * sur iPhone et sur Android). Une fois fermée, ou si l'appli est déjà
 * installée, elle ne s'affiche plus.
 */
export default function InstallPrompt() {
  const pathname = usePathname();
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [visible, setVisible] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const p = detectPlatform();
    if (!p || isInstalled() || readDismissed()) return;
    // Petit délai pour laisser la page s'afficher avant la popup.
    const timer = window.setTimeout(() => {
      setPlatform(p);
      setVisible(true);
    }, 1500);

    function onBeforeInstall(e: Event) {
      // On garde l'événement pour notre propre bouton "Installer".
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      close();
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function close() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Navigation privée : tant pis, la popup reviendra à la prochaine visite.
    }
  }

  async function installNow() {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    if (outcome === "accepted") close();
  }

  // Jamais dans l'espace d'administration.
  if (!visible || !platform || pathname.startsWith("/admin")) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-prompt-title"
        className="relative w-full max-w-sm rounded-2xl border-t-4 border-club-gold bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-foreground shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Fermer"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-2xl leading-none text-gray-500 hover:bg-gray-100"
        >
          ×
        </button>

        <div className="mb-4 flex items-center gap-3 pr-8">
          <Image
            src="/icon-192.png"
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-xl"
          />
          <div>
            <h2 id="install-prompt-title" className="text-xl font-bold uppercase">
              Installez l&apos;appli
            </h2>
            <p className="text-sm text-gray-600">
              L&apos;US Baumoise sur votre écran d&apos;accueil, en un geste.
            </p>
          </div>
        </div>

        {platform === "ios" ? (
          <>
            <ol className="space-y-3 text-[15px]">
              <Step n={1}>
                Ouvrez le site dans <strong>Safari</strong>, puis touchez le bouton{" "}
                <strong>Partager</strong> <ShareIcon /> (en bas de l&apos;écran, ou
                dans le menu <strong>•••</strong>).
              </Step>
              <Step n={2}>
                Faites défiler et choisissez{" "}
                <strong>
                  Sur l&apos;écran d&apos;accueil <PlusSquareIcon />
                </strong>
                .
              </Step>
              <Step n={3}>
                Touchez <strong>Ajouter</strong> en haut à droite.
              </Step>
            </ol>
            <p className="mt-4 rounded-lg bg-gray-100 p-3 text-sm text-gray-700">
              Sur iPhone, les notifications des matchs ne fonctionnent que depuis
              l&apos;appli installée.
            </p>
          </>
        ) : deferred ? (
          <>
            <p className="text-[15px]">
              Ajoutez l&apos;appli à votre téléphone pour suivre les matchs, les
              résultats et recevoir les notifications du club.
            </p>
            <button
              type="button"
              onClick={installNow}
              className="mt-4 w-full rounded-lg bg-club-black py-3 font-bold uppercase text-white hover:bg-club-black-soft"
            >
              Installer l&apos;application
            </button>
          </>
        ) : (
          <ol className="space-y-3 text-[15px]">
            <Step n={1}>
              Dans <strong>Chrome</strong>, touchez le menu <KebabIcon /> en haut à
              droite.
            </Step>
            <Step n={2}>
              Choisissez <strong>Installer l&apos;application</strong> (ou{" "}
              <strong>Ajouter à l&apos;écran d&apos;accueil</strong>).
            </Step>
            <Step n={3}>
              Confirmez avec <strong>Installer</strong>.
            </Step>
          </ol>
        )}

        <button
          type="button"
          onClick={close}
          className="mt-4 w-full rounded-lg py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}
