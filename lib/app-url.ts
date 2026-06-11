import { getSiteUrl } from "@/lib/site";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);
const LOCAL_PROTOCOLS = new Set(["http:", "https:"]);

function createOrigin(host: string | null | undefined, protocol?: string | null): string | null {
  const cleanHost = host?.split(",")[0]?.trim();
  if (!cleanHost) return null;
  const hostname = cleanHost.split(":")[0];
  const cleanProtocol = protocol?.split(",")[0]?.trim() || (LOCAL_HOSTS.has(hostname) ? "http" : "https");
  try {
    return new URL(`${cleanProtocol}://${cleanHost}`).origin;
  } catch {
    return null;
  }
}

function isLocalOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return LOCAL_HOSTS.has(url.hostname) && LOCAL_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
}

export function getAppOrigin(request?: Request): string {
  if (request) {
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const candidates = [
      createOrigin(request.headers.get("x-forwarded-host"), forwardedProto),
      createOrigin(request.headers.get("host"), forwardedProto)
    ];

    try {
      candidates.push(new URL(request.url).origin);
    } catch {
      // Keep the fallback below.
    }

    const publicOrigin = candidates.find((origin): origin is string => Boolean(origin && !isLocalOrigin(origin)));
    if (publicOrigin) return publicOrigin;

    const localOrigin = candidates.find((origin): origin is string => Boolean(origin && isLocalOrigin(origin)));
    if (localOrigin && process.env.NODE_ENV !== "production") {
      return localOrigin;
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
