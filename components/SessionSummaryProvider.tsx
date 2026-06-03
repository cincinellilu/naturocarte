"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

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

const SessionSummaryContext = createContext<SessionSummary>(DEFAULT_SESSION_SUMMARY);

export function SessionSummaryProvider({ children }: { children: React.ReactNode }) {
  const [summary, setSummary] = useState<SessionSummary>(DEFAULT_SESSION_SUMMARY);

  useEffect(() => {
    let mounted = true;

    fetch("/api/session-summary", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: SessionSummary | null) => {
        if (mounted && data) setSummary(data);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(() => summary, [summary]);

  return <SessionSummaryContext.Provider value={value}>{children}</SessionSummaryContext.Provider>;
}

export function useSessionSummary() {
  return useContext(SessionSummaryContext);
}
