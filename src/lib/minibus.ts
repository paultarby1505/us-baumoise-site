import type { MinibusId } from "./types";

export const MINIBUS_IDS: MinibusId[] = ["ancien", "recent"];

export const MINIBUS_LABELS: Record<MinibusId, string> = {
  ancien: "Ancien",
  recent: "Récent",
};

export function isMinibusId(value: string): value is MinibusId {
  return (MINIBUS_IDS as string[]).includes(value);
}

/** Arrondi au dixième de km. */
export function roundKm(km: number): number {
  return Math.round(km * 10) / 10;
}

/** Arrondi au centime. */
export function roundEuros(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function computeTrajet(kmAller: number, allerRetour: boolean, coutKm: number) {
  const km_aller = roundKm(Math.max(0, kmAller));
  const km_total = roundKm(allerRetour ? km_aller * 2 : km_aller);
  const cout_total = roundEuros(km_total * Math.max(0, coutKm));
  return { km_aller, km_total, cout_total };
}

export function formatKm(km: number): string {
  return `${Number(km).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} km`;
}

export function formatEuros(amount: number): string {
  return Number(amount).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}
