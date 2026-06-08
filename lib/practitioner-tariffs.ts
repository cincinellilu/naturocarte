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
