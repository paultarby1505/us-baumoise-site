export const PARIS_TIME_ZONE = "Europe/Paris";

function timeZoneOffsetMinutes(timeZone: string, date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  const asUtc = Date.UTC(
    Number(get("year")),
    Number(get("month")) - 1,
    Number(get("day")),
    Number(get("hour")),
    Number(get("minute")),
    Number(get("second"))
  );
  return (asUtc - date.getTime()) / 60000;
}

/**
 * Convertit la valeur d'un <input type="datetime-local"> ("YYYY-MM-DDTHH:mm"),
 * entrée en heure de Paris par l'admin, en ISO UTC pour la base de données.
 * (Sans ça, le serveur interprète cette valeur avec son propre fuseau, qui
 * n'est pas forcément celui de Paris, et l'heure affichée aux visiteurs
 * dérive de celle saisie.)
 */
export function parisInputToUtcIso(value: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!m) return null;
  const [, year, month, day, hour, minute] = m;
  const guessUtcMs = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute)
  );
  const offsetMinutes = timeZoneOffsetMinutes(PARIS_TIME_ZONE, new Date(guessUtcMs));
  const date = new Date(guessUtcMs - offsetMinutes * 60000);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * Convertit un ISO UTC (venant de la base) en valeur pour un
 * <input type="datetime-local">, affichée en heure de Paris.
 */
export function utcIsoToParisInput(iso: string): string {
  const date = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: PARIS_TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** Formate un ISO UTC en date/heure lisible, toujours en heure de Paris. */
export function formatParis(iso: string, options: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleDateString("fr-FR", { ...options, timeZone: PARIS_TIME_ZONE });
}
