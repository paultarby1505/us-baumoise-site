/**
 * Calcul de la distance routière entre deux lieux (en voiture), sans clé
 * d'API : géocodage et itinéraire via la Géoplateforme de l'IGN (service
 * public français), avec le serveur public OSRM / Nominatim en secours.
 */

type Point = { lon: number; lat: number; label: string };

const USER_AGENT = "us-baumoise-site (calcul trajets minibus)";

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function geocodeIgn(query: string): Promise<Point | null> {
  const data = (await fetchJson(
    `https://data.geopf.fr/geocodage/search?q=${encodeURIComponent(query)}&limit=1`
  )) as {
    features?: { geometry?: { coordinates?: [number, number] }; properties?: { label?: string } }[];
  };
  const f = data.features?.[0];
  const coords = f?.geometry?.coordinates;
  if (!coords) return null;
  return { lon: coords[0], lat: coords[1], label: f?.properties?.label ?? query };
}

async function geocodeNominatim(query: string): Promise<Point | null> {
  const data = (await fetchJson(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
  )) as { lon?: string; lat?: string; display_name?: string }[];
  const r = data[0];
  if (!r?.lon || !r?.lat) return null;
  return { lon: Number(r.lon), lat: Number(r.lat), label: r.display_name ?? query };
}

async function geocode(query: string): Promise<Point | null> {
  try {
    const p = await geocodeIgn(query);
    if (p) return p;
  } catch {
    // on tente le service de secours
  }
  try {
    return await geocodeNominatim(query);
  } catch {
    return null;
  }
}

async function routeKmIgn(a: Point, b: Point): Promise<number | null> {
  const url =
    "https://data.geopf.fr/navigation/itineraire?resource=bdtopo-osrm&profile=car" +
    `&optimization=fastest&distanceUnit=kilometer&getSteps=false` +
    `&start=${a.lon},${a.lat}&end=${b.lon},${b.lat}`;
  const data = (await fetchJson(url)) as { distance?: number };
  return typeof data.distance === "number" ? data.distance : null;
}

async function routeKmOsrm(a: Point, b: Point): Promise<number | null> {
  const data = (await fetchJson(
    `https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=false`
  )) as { routes?: { distance?: number }[] };
  const meters = data.routes?.[0]?.distance;
  return typeof meters === "number" ? meters / 1000 : null;
}

export type DistanceResult =
  | { ok: true; km: number; departLabel: string; arriveeLabel: string }
  | { ok: false; error: string };

export async function computeRoadDistance(depart: string, arrivee: string): Promise<DistanceResult> {
  const [a, b] = await Promise.all([geocode(depart), geocode(arrivee)]);
  if (!a) return { ok: false, error: `Lieu de départ introuvable : « ${depart} ».` };
  if (!b) return { ok: false, error: `Lieu d'arrivée introuvable : « ${arrivee} ».` };

  let km: number | null = null;
  try {
    km = await routeKmIgn(a, b);
  } catch {
    // service de secours ci-dessous
  }
  if (km === null) {
    try {
      km = await routeKmOsrm(a, b);
    } catch {
      // rien
    }
  }
  if (km === null) {
    return {
      ok: false,
      error: "Impossible de calculer l'itinéraire pour le moment. Saisis les km à la main.",
    };
  }
  return { ok: true, km: Math.round(km * 10) / 10, departLabel: a.label, arriveeLabel: b.label };
}
