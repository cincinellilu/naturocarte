export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const isProduction = process.env.NODE_ENV === "production";

  if (!raw) {
    if (isProduction) {
      throw new Error("NEXT_PUBLIC_SITE_URL is required in production");
    }
    return "http://localhost:3000";
  }

  const url = new URL(raw);
  const isLocal = ["localhost", "127.0.0.1"].includes(url.hostname);

  if (isProduction && (isLocal || url.protocol !== "https:")) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be a public HTTPS domain in production"
    );
  }

  return url.origin;
}
