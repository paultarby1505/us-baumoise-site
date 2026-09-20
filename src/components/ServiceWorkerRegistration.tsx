"use client";

import { useEffect } from "react";

/**
 * Enregistre le service worker (public/sw.js) qui rend le site installable
 * et utilisable hors connexion. Ne rend rien à l'écran.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
      console.error("Échec de l'enregistrement du service worker", error);
    });
  }, []);

  return null;
}
