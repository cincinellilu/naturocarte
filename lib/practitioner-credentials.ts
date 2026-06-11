export type PractitionerSelectOption = {
  value: string;
  label: string;
};

export const PRACTITIONER_TRAINING_OPTIONS: readonly PractitionerSelectOption[] = [
  { value: "academie-de-vitalopathie", label: "Académie de Vitalopathie" },
  { value: "aemnat", label: "AEMNAT" },
  { value: "esculape", label: "Esculape" },
  { value: "anindra-campus-vitalopathie", label: "Anindra Campus Vitalopathie" },
  { value: "arbre-rouge", label: "Arbre Rouge" },
  { value: "cenatho", label: "CENATHO" },
  { value: "cfppa-de-mirecourt", label: "CFPPA de Mirecourt" },
  { value: "cnr", label: "CNR" },
  { value: "dargere-univers", label: "Dargère Univers" },
  { value: "ena-mnc", label: "ENA MNC" },
  { value: "euronature", label: "Euronature" },
  { value: "flmne", label: "FLMNE" },
  { value: "ifnat", label: "IFNAT" },
  { value: "institut-hildegarde", label: "Institut Hildegarde" },
  { value: "isupnat", label: "ISUPNAT" },
  { value: "ekilibre", label: "Ekilibre" },
  { value: "naturacopee", label: "Naturacopée" },
  { value: "naturilys", label: "Naturilys" }
] as const;

export const PRACTITIONER_AFFILIATION_OPTIONS: readonly PractitionerSelectOption[] = [
  {
    value: "omnes",
    label: "OMNES — Organisation professionnelle des naturopathes de France"
  },
  {
    value: "spbe",
    label: "SPBE — Syndicat des professionnels du bien-être et de la santé intégrative"
  },
  {
    value: "fena",
    label: "FÉNA — Fédération française des écoles de naturopathie"
  }
] as const;

function buildOptionsMap(options: readonly PractitionerSelectOption[]): Map<string, string> {
  return new Map(options.map((option) => [option.value, option.label]));
}

const TRAINING_OPTIONS_MAP = buildOptionsMap(PRACTITIONER_TRAINING_OPTIONS);
const AFFILIATION_OPTIONS_MAP = buildOptionsMap(PRACTITIONER_AFFILIATION_OPTIONS);

export function normalizePractitionerSelectValue(
  value: FormDataEntryValue | string | null | undefined,
  options: readonly PractitionerSelectOption[]
): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  return options.some((option) => option.value === trimmed) ? trimmed : null;
}

export function getPractitionerTrainingLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return TRAINING_OPTIONS_MAP.get(value) ?? null;
}

export function getPractitionerAffiliationLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return AFFILIATION_OPTIONS_MAP.get(value) ?? null;
}

export function isMissingPractitionerCredentialsColumnError(error: unknown): boolean {
  const text = [
    typeof error === "object" && error !== null && "message" in error ? String(error.message) : "",
    typeof error === "object" && error !== null && "details" in error ? String(error.details) : "",
    typeof error === "object" && error !== null && "hint" in error ? String(error.hint) : ""
  ]
    .join(" ")
    .toLowerCase();

  const referencesCredentialColumn =
    text.includes("training_school") || text.includes("professional_affiliation");

  if (!referencesCredentialColumn) return false;

  return (
    text.includes("column") ||
    text.includes("schema cache") ||
    text.includes("could not find") ||
    text.includes("does not exist")
  );
}
