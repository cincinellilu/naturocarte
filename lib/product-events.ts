"use client";

type ProductEventPrimitive = string | number | boolean | null | undefined;
export type ProductEventMetadata = Record<string, ProductEventPrimitive>;

const SESSION_STORAGE_KEY = "nc_product_session_id";

function getSessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;

    const generated =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    window.sessionStorage.setItem(SESSION_STORAGE_KEY, generated);
    return generated;
  } catch {
    return "unknown";
  }
}

function getDeviceType(): "desktop" | "tablet" | "mobile" | "unknown" {
  if (typeof window === "undefined") return "unknown";

  const width = window.innerWidth;
  if (width <= 760) return "mobile";
  if (width <= 1024) return "tablet";
  return "desktop";
}

function normalizeMetadata(metadata: ProductEventMetadata = {}): ProductEventMetadata {
  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [
        key,
        typeof value === "string" && value.length > 500 ? value.slice(0, 500) : value
      ])
  );
}

export function trackProductEvent(
  eventName: string,
  metadata: ProductEventMetadata = {}
) {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify({
    eventName,
    pagePath: `${window.location.pathname}${window.location.search}`,
    referrer: document.referrer || null,
    deviceType: getDeviceType(),
    sessionId: getSessionId(),
    metadata: normalizeMetadata(metadata)
  });

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/events", blob);
    return;
  }

  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true
  }).catch(() => {
    // Product tracking must never block the user journey.
  });
}
