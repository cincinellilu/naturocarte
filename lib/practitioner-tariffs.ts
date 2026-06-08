function normalizeTariffLine(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;

  return trimmed.replace(/^[\-*•]+\s*/, "");
}

export function parsePractitionerTariffs(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(/\r?\n/)
    .map((line) => normalizeTariffLine(line))
    .filter((line): line is string => Boolean(line));
}

export function buildPractitionerTariffsText(params: {
  primaryTariff?: string | null;
  additionalTariffs?: string | null;
}): string | null {
  const seen = new Set<string>();
  const items: string[] = [];

  for (const rawLine of [
    normalizeTariffLine(params.primaryTariff),
    ...parsePractitionerTariffs(params.additionalTariffs)
  ]) {
    if (!rawLine) continue;

    const key = rawLine.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(rawLine);
  }

  return items.length > 0 ? items.join("\n") : null;
}

export function isMissingPractitionerTariffsColumnError(error: unknown): boolean {
  const text = [
    typeof error === "object" && error !== null && "message" in error ? String(error.message) : "",
    typeof error === "object" && error !== null && "details" in error ? String(error.details) : "",
    typeof error === "object" && error !== null && "hint" in error ? String(error.hint) : ""
  ]
    .join(" ")
    .toLowerCase();

  if (!text.includes("tarifs")) return false;

  return (
    text.includes("column") ||
    text.includes("schema cache") ||
    text.includes("could not find") ||
    text.includes("does not exist")
  );
}
