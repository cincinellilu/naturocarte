"use client";

import { useEffect, useRef } from "react";

export type PractitionerStatEvent = "profile_view" | "contact_click" | "booking_click";

export function trackPractitionerStat(practitionerSlug: string, event: PractitionerStatEvent) {
  const slug = practitionerSlug.trim();
  if (!slug) return;

  const payload = JSON.stringify({
    practitionerSlug: slug,
    event
  });

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/practitioner-stats", blob);
    return;
  }

  void fetch("/api/practitioner-stats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true
  }).catch(() => {
    // Stats should never block navigation or interaction.
  });
}

export default function PractitionerStatsTracker({
  practitionerSlug
}: {
  practitionerSlug: string;
}) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;
    trackPractitionerStat(practitionerSlug, "profile_view");
  }, [practitionerSlug]);

  return null;
}
