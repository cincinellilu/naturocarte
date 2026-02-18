const PRODUCTION_FALLBACK_SITE_URL = "https://naturocarte.fr";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const isProduction = process.env.NODE_ENV === "production";

  if (!raw) {
    return isProduction ? PRODUCTION_FALLBACK_SITE_URL : "http://localhost:3000";
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return isProduction ? PRODUCTION_FALLBACK_SITE_URL : "http://localhost:3000";
  }

  const isLocal = ["localhost", "127.0.0.1"].includes(url.hostname);

  if (isProduction && (isLocal || url.protocol !== "https:")) {
    return PRODUCTION_FALLBACK_SITE_URL;
  }

  return url.origin;
}
