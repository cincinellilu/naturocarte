const PRACTITIONER_ENTRY_SOURCE_KEY = "nc_practitioner_entry_source";
const PRACTITIONER_ENTRY_SOURCE_MAX_AGE_MS = 10 * 60 * 1000;

type StoredPractitionerEntrySource = {
  practitionerSlug: string;
  source: string;
  timestamp: number;
};

function readStoredSource(): StoredPractitionerEntrySource | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(PRACTITIONER_ENTRY_SOURCE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredPractitionerEntrySource> | null;
    if (
      !parsed ||
      typeof parsed.practitionerSlug !== "string" ||
      typeof parsed.source !== "string" ||
      typeof parsed.timestamp !== "number"
    ) {
      window.sessionStorage.removeItem(PRACTITIONER_ENTRY_SOURCE_KEY);
      return null;
    }

    if (Date.now() - parsed.timestamp > PRACTITIONER_ENTRY_SOURCE_MAX_AGE_MS) {
      window.sessionStorage.removeItem(PRACTITIONER_ENTRY_SOURCE_KEY);
      return null;
    }

    return {
      practitionerSlug: parsed.practitionerSlug,
      source: parsed.source,
      timestamp: parsed.timestamp
    };
  } catch {
    return null;
  }
}

function clearStoredSource() {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(PRACTITIONER_ENTRY_SOURCE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

export function rememberPractitionerEntrySource(practitionerSlug: string, source: string) {
  if (typeof window === "undefined") return;

  const normalizedSlug = practitionerSlug.trim();
  const normalizedSource = source.trim();
  if (!normalizedSlug || !normalizedSource) return;

  try {
    window.sessionStorage.setItem(
      PRACTITIONER_ENTRY_SOURCE_KEY,
      JSON.stringify({
        practitionerSlug: normalizedSlug,
        source: normalizedSource,
        timestamp: Date.now()
      } satisfies StoredPractitionerEntrySource)
    );
  } catch {
    // Ignore storage failures.
  }
}

export function consumePractitionerEntrySource(practitionerSlug: string): string | null {
  const stored = readStoredSource();
  if (!stored) return null;
  if (stored.practitionerSlug !== practitionerSlug.trim()) return null;

  clearStoredSource();
  return stored.source;
}

function detectReferrerSource(): string | null {
  if (typeof window === "undefined" || typeof document === "undefined") return null;

  const referrer = document.referrer?.trim();
  if (!referrer) return "direct";

  try {
    const referrerUrl = new URL(referrer);
    if (referrerUrl.origin !== window.location.origin) return "external";

    const pathname = referrerUrl.pathname;
    if (pathname === "/") return "home";
    if (pathname.startsWith("/carte")) return "map";
    if (pathname.startsWith("/annuaire-naturopathes/")) return "directory_department";
    if (pathname.startsWith("/annuaire-naturopathes")) return "directory";
    if (pathname.startsWith("/naturopathe-paris/")) return "paris_arrondissement";
    if (pathname.startsWith("/naturopathe-paris")) return "paris_directory";
    if (pathname.startsWith("/compte")) return "account_favorites";
    return "internal";
  } catch {
    return "unknown";
  }
}

export function getPractitionerProfileViewSource(practitionerSlug: string): string {
  return consumePractitionerEntrySource(practitionerSlug) ?? detectReferrerSource() ?? "profile_page";
}
