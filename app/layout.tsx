import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getSiteUrl } from "@/lib/site";
import Analytics from "@/components/Analytics";
import CookieBannerMount from "@/components/CookieBannerMount";
import CookieSettingsButton from "@/components/CookieSettingsButton";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NaturoCarte",
    template: "%s | NaturoCarte"
  },
  description:
    "Annuaire cartographique de naturopathes. Trouvez des praticiens et consultez une carte simple et claire.",
  openGraph: {
    title: "NaturoCarte",
    description:
      "Annuaire cartographique de naturopathes. Trouvez des praticiens et consultez une carte simple et claire.",
    url: siteUrl,
    siteName: "NaturoCarte",
    locale: "fr_FR",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Analytics />
        <header className="site-header">
          <div className="container">
            <nav aria-label="Navigation principale">
              <ul>
                <li>
                  <Link href="/">Accueil</Link>
                </li>
                <li>
                  <Link href="/carte">Carte</Link>
                </li>
                <li>
                  <Link href="/a-propos">A propos</Link>
                </li>
                <li>
                  <Link href="/praticiens">Praticiens</Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <main>
          <div className="container">{children}</div>
        </main>

        <footer className="site-footer">
          <div className="container">
            <p>NaturoCarte - annuaire des naturopathes.</p>
            <p>
              <Link href="/mentions-legales">Mentions légales</Link> ·{" "}
              <Link href="/confidentialite">Confidentialité</Link> ·{" "}
              <CookieSettingsButton />
            </p>
          </div>
        </footer>
        <CookieBannerMount />
      </body>
    </html>
  );
}
