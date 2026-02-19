"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  COOKIE_CONSENT_KEY,
  type CookieConsent
} from "@/lib/analytics";

function readConsent(): CookieConsent | null {
  if (typeof window === "undefined") {
    return null;
  }

  const localValue = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  if (localValue === "accepted" || localValue === "refused") {
    return localValue;
  }

  const cookieValue = document.cookie
    .split("; ")
    .find((value) => value.startsWith(`${COOKIE_CONSENT_KEY}=`))
    ?.split("=")[1];

  if (cookieValue === "accepted" || cookieValue === "refused") {
    return cookieValue;
  }

  return null;
}

function persistConsent(value: CookieConsent) {
  const isSecure = window.location.protocol === "https:";
  const securePart = isSecure ? "; Secure" : "";
  const maxAge = 60 * 60 * 24 * 180;

  window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
  document.cookie =
    `${COOKIE_CONSENT_KEY}=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax` + securePart;
  window.dispatchEvent(new CustomEvent<CookieConsent>("nc:cookie-consent-updated", { detail: value }));
}

export default function CookieBanner() {
  const [isReady, setIsReady] = useState(false);
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const currentConsent = readConsent();
    setConsent(currentConsent);
    setVisible(!currentConsent);
    setIsReady(true);

    const handleOpen = () => {
      setVisible(true);
    };

    window.addEventListener("nc:cookie-banner-open", handleOpen);

    return () => {
      window.removeEventListener("nc:cookie-banner-open", handleOpen);
    };
  }, []);

  if (!isReady) {
    return null;
  }

  if (!visible) {
    return null;
  }

  return (
    <aside
      className="cookie-banner"
      role="dialog"
      aria-live="polite"
      aria-label="Gestion des cookies"
      aria-modal="false"
      style={{
        position: "fixed",
        right: "16px",
        bottom: "16px",
        zIndex: 99999,
        width: "min(360px, calc(100vw - 24px))",
        background: "#111827",
        color: "#f9fafb",
        border: "1px solid rgba(148, 163, 184, 0.45)",
        borderRadius: "12px",
        boxShadow: "0 14px 34px rgba(2, 6, 23, 0.38)",
        padding: "12px"
      }}
    >
      <p className="cookie-banner-title" style={{ margin: 0, fontWeight: 700, fontSize: "0.95rem" }}>
        Cookies
      </p>
      <p style={{ margin: "6px 0 0", fontSize: "0.88rem", lineHeight: 1.4 }}>
        Nous utilisons des cookies de mesure d’audience. Vous pouvez accepter ou
        refuser ces cookies.
      </p>
      <p style={{ margin: "6px 0 0", fontSize: "0.82rem", color: "#cbd5e1" }}>
        Détails:{" "}
        <Link href="/confidentialite" style={{ color: "#99f6e4" }}>
          politique de confidentialité
        </Link>
        .
      </p>
      <div className="cookie-banner-actions" style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
        <button
          type="button"
          style={{
            border: "1px solid #94a3b8",
            background: "transparent",
            color: "#f8fafc",
            padding: "6px 10px",
            borderRadius: "8px",
            font: "inherit",
            cursor: "pointer"
          }}
          onClick={() => {
            persistConsent("refused");
            setConsent("refused");
            setVisible(false);
          }}
        >
          Refuser
        </button>
        <button
          type="button"
          className="cookie-banner-accept"
          style={{
            border: "1px solid #2dd4bf",
            background: "#2dd4bf",
            color: "#042f2e",
            padding: "6px 10px",
            borderRadius: "8px",
            font: "inherit",
            fontWeight: 600,
            cursor: "pointer"
          }}
          onClick={() => {
            persistConsent("accepted");
            setConsent("accepted");
            setVisible(false);
          }}
        >
          Accepter
        </button>
        <button
          type="button"
          style={{
            border: "1px solid transparent",
            background: "transparent",
            color: "#cbd5e1",
            padding: "6px 8px",
            borderRadius: "8px",
            font: "inherit",
            cursor: "pointer"
          }}
          onClick={() => setVisible(false)}
        >
          Fermer
        </button>
      </div>
    </aside>
  );
}
