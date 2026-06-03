"use client";

import { useEffect, useState } from "react";

export type SessionSummary = {
  type: "anonymous" | "user" | "practitioner";
  href: string;
  initials: string | null;
  photoUrl: string | null;
};

const DEFAULT_SESSION_SUMMARY: SessionSummary = {
  type: "anonymous",
  href: "/compte",
  initials: null,
  photoUrl: null
};

let cachedSessionSummary: SessionSummary | null = null;

export default function SessionSummaryProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useSessionSummary() {
  const [summary, setSummary] = useState<SessionSummary>(
    cachedSessionSummary ?? DEFAULT_SESSION_SUMMARY
  );

  useEffect(() => {
    let mounted = true;

    fetch("/api/session-summary", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: SessionSummary | null) => {
        if (!data) return;
        cachedSessionSummary = data;
        if (mounted) setSummary(data);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  return summary;
}
