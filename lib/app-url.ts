import { getSiteUrl } from "@/lib/site";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

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
  if (process.env.NODE_ENV === "production") {
    return getSiteUrl();
  }

  if (request) {
    const forwardedOrigin = getForwardedOrigin(request);
    if (forwardedOrigin) return forwardedOrigin;

    try {
      const requestUrl = new URL(request.url);
      if (LOCAL_HOSTS.has(requestUrl.hostname)) return requestUrl.origin;
      return requestUrl.origin;
    } catch {
      return "http://localhost:3000";
    }
  }

  return "http://localhost:3000";
}

export function createAppUrl(path: string, request?: Request): URL {
  return new URL(path, getAppOrigin(request));
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
