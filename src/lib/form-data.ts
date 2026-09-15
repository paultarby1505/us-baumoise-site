export function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export function strOrNull(formData: FormData, key: string): string | null {
  const value = str(formData, key);
  return value === "" ? null : value;
}

export function intOrNull(formData: FormData, key: string): number | null {
  const value = str(formData, key);
  if (value === "") return null;
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? null : n;
}
