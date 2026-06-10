import { getSiteUrl } from "@/lib/site";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);
const LOCAL_PROTOCOLS = new Set(["http:", "https:"]);

function getForwardedOrigin(request: Request): string | null {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();

  if (!forwardedHost) return null;

  const protocol =
    forwardedProto ||
    (forwardedHost.startsWith("localhost") || forwardedHost.startsWith("127.0.0.1")
      ? "http"
      : "https");

  try {
    return new URL(`${protocol}://${forwardedHost}`).origin;
  } catch {
    return null;
  }
}

export function getAppOrigin(request?: Request): string {
  if (request) {
    const forwardedOrigin = getForwardedOrigin(request);
    if (forwardedOrigin) {
      const forwardedUrl = new URL(forwardedOrigin);
      if (LOCAL_HOSTS.has(forwardedUrl.hostname)) return forwardedUrl.origin;
      if (process.env.NODE_ENV !== "production") return forwardedUrl.origin;
    }

    try {
      const requestUrl = new URL(request.url);
      if (LOCAL_HOSTS.has(requestUrl.hostname) && LOCAL_PROTOCOLS.has(requestUrl.protocol)) {
        return requestUrl.origin;
      }
      if (process.env.NODE_ENV !== "production") return requestUrl.origin;
    } catch {
      return "http://localhost:3000";
    }
  }

  if (process.env.NODE_ENV === "production") {
    return getSiteUrl();
  }

  return "http://localhost:3000";
}

export function createAppUrl(path: string, request?: Request): URL {
  return new URL(path, getAppOrigin(request));
}

export function isSecureAppRequest(request: Request): boolean {
  return createAppUrl("/", request).protocol === "https:";
}

export function getSafeAppUrl(request: Request, target: string, fallbackPath = "/"): URL {
  const origin = getAppOrigin(request);

  try {
    const url = new URL(target, origin);
    if (url.origin !== origin) return new URL(fallbackPath, origin);
    return url;
  } catch {
    return new URL(fallbackPath, origin);
  }
}
