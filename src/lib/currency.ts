export const SAR_SYMBOL = "﷼";

function toSafeNumber(value: number | string | null | undefined): number {
  const n = typeof value === "string" ? Number(value) : Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/** UI formatting: uses the Saudi Riyal symbol. */
export function formatSar(value: number | string | null | undefined, decimals = 0): string {
  const n = toSafeNumber(value);
  return `${SAR_SYMBOL} ${n.toFixed(decimals)}`;
}

/** PDF/text-safe formatting: uses plain "SAR" to avoid font issues in generated PDFs. */
export function formatSarText(value: number | string | null | undefined, decimals = 0): string {
  const n = toSafeNumber(value);
  return `SAR ${n.toFixed(decimals)}`;
}
