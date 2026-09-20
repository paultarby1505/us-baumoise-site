// Service worker du site US Baumoise Rugby.
//
// Objectif : rendre le site installable et utilisable hors connexion,
// sans jamais servir de contenu périmé (actus, matchs, résultats).
//
// Stratégie :
// - pages (navigation) : réseau d'abord, secours sur le cache si hors ligne.
// - fichiers statiques (_next/static, images, icônes) : cache d'abord,
//   ils ne changent pas entre deux déploiements.
// - tout le reste (admin, actions serveur, requêtes non-GET) : on laisse
//   passer directement au réseau, sans jamais intercepter.

const CACHE_VERSION = "v1";
const PAGES_CACHE = `us-baumoise-pages-${CACHE_VERSION}`;
const ASSETS_CACHE = `us-baumoise-assets-${CACHE_VERSION}`;
const OFFLINE_URL = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== PAGES_CACHE && key !== ASSETS_CACHE)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

function isAdminOrApiPath(url) {
  return url.pathname.startsWith("/admin");
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image") ||
    /\.(png|jpg|jpeg|webp|avif|svg|ico|woff2?)$/.test(url.pathname) ||
    url.hostname.endsWith(".supabase.co")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin && !isStaticAsset(url)) return;
  if (isAdminOrApiPath(url)) return;

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(ASSETS_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    if (cached) return cached;
    throw error;
  }
}

async function networkFirst(request) {
  const cache = await caches.open(PAGES_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    const fallback = await cache.match(OFFLINE_URL);
    if (fallback) return fallback;
    throw error;
  }
}

// --- Notifications push (actus, résultats de match) ---

self.addEventListener("push", (event) => {
  let data = { title: "US Baumoise Rugby", body: "" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    if (event.data) data.body = event.data.text();
  }

  const options = {
    body: data.body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data && event.notification.data.url ? event.notification.data.url : "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      const existing = clientsArr.find((c) => c.url.startsWith(self.location.origin));
      if (existing) {
        existing.focus();
        if ("navigate" in existing) existing.navigate(url);
        return undefined;
      }
      return self.clients.openWindow(url);
    })
  );
});
