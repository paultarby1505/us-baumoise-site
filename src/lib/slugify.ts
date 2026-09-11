const COMBINING_MARK_START = String.fromCodePoint(0x0300);
const COMBINING_MARK_END = String.fromCodePoint(0x036f);
const COMBINING_MARKS = new RegExp(`[${COMBINING_MARK_START}-${COMBINING_MARK_END}]`, "g");

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}
