export const PARIS_ARRONDISSEMENTS = Array.from({ length: 20 }, (_, i) => i + 1);

export function formatParisPostalCode(arrondissement: number): string {
  return `750${String(arrondissement).padStart(2, "0")}`;
}

export function toParisArrondissementLabel(arrondissement: number): string {
  if (arrondissement === 1) return "1er arrondissement";
  return `${arrondissement}e arrondissement`;
}

export function parseParisArrondissement(
  value: string | null | undefined
): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed)) return null;
  if (parsed < 1 || parsed > 20) return null;
  return parsed;
}
