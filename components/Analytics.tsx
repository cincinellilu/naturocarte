"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import {
  COOKIE_CONSENT_KEY,
  GA4_MEASUREMENT_ID,
  type CookieConsent
} from "@/lib/analytics";
import { trackProductEvent } from "@/lib/product-events";

function getPageTemplate(pathname: string): string {
  if (pathname === "/") return "home";
  if (pathname === "/carte") return "map";
  if (pathname === "/annuaire-naturopathes") return "directory_hub";
  if (pathname.startsWith("/annuaire-naturopathes/")) return "directory_department";
  if (pathname === "/naturopathe-paris") return "paris_hub";
  if (pathname.startsWith("/naturopathe-paris/")) return "paris_arrondissement";
  if (pathname.startsWith("/naturopathe/")) return "practitioner_profile";
  if (pathname.startsWith("/praticiens")) return "practitioner_acquisition";
  if (pathname.startsWith("/compte")) return "user_account";
  if (pathname.startsWith("/admin")) return "admin";
  return "content";
}

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

export default function Analytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const pathname = window.location.pathname;
    const search = window.location.search;

    trackProductEvent("landing_page_view", {
      page_template: getPageTemplate(pathname),
      has_query: Boolean(search)
    });
  }, []);

  useEffect(() => {
    const syncConsent = (consent: CookieConsent | null) => {
      if (consent === "accepted") {
        setEnabled(true);
        return;
      }

      setEnabled(false);
      // Prevent any future hits if consent gets withdrawn.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any)[`ga-disable-${GA4_MEASUREMENT_ID}`] = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (window as any).gtag === "function") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).gtag("consent", "update", { analytics_storage: "denied" });
      }
    };

    syncConsent(readConsent());

    const handleConsentUpdate = (event: Event) => {
      const consent = (event as CustomEvent<CookieConsent>).detail;
      syncConsent(consent);
    };

    window.addEventListener("nc:cookie-consent-updated", handleConsentUpdate);

    return () => {
      window.removeEventListener("nc:cookie-consent-updated", handleConsentUpdate);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return (
    <>
      <Script
        id="ga4-script"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('consent', 'default', { analytics_storage: 'granted' });
          gtag('config', '${GA4_MEASUREMENT_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
