"use client";

export default function CookieSettingsButton() {
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
