"use client";

import { useEffect, useState } from "react";

export default function CookieSettingsButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <span className="cookie-settings-button cookie-settings-button--placeholder">
        Gérer mes cookies
      </span>
    );
  }

  return (
    <button
      type="button"
      className="cookie-settings-button"
      aria-label="Gérer les cookies"
      onClick={() => window.dispatchEvent(new Event("nc:cookie-banner-open"))}
    >
      Gérer mes cookies
    </button>
  );
}
