import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getSiteUrl } from "@/lib/site";
import Analytics from "@/components/Analytics";
import CookieBannerMount from "@/components/CookieBannerMount";
import CookieSettingsButtonMount from "@/components/CookieSettingsButtonMount";
import { MobileTabBar, SiteHeaderNav } from "@/components/SiteNavigation";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Naturopathe Paris | Annuaire naturopathes | NaturoCarte",
    template: "%s | NaturoCarte"
  },
  description:
    "Annuaire cartographique de naturopathes à Paris. Trouvez un naturopathe par arrondissement et consultez des fiches détaillées.",
  openGraph: {
    title: "NaturoCarte",
    description:
      "Annuaire cartographique de naturopathes à Paris. Trouvez un naturopathe par arrondissement et consultez des fiches détaillées.",
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
      <body className="site-body" suppressHydrationWarning>
        <Analytics />
        <div className="site-shell">
          <header className="site-header">
            <div className="container">
              <SiteHeaderNav />
            </div>
          </header>

          <main className="site-main">
            <div className="container">{children}</div>
          </main>

          <footer className="site-footer">
            <div className="container site-footer-grid">
              <div className="site-footer-block">
                <p className="site-footer-brand">NaturoCarte</p>
                <p className="site-footer-copy">
                  Annuaire cartographique pour repérer rapidement des naturopathes,
                  comparer les fiches et naviguer quartier par quartier.
                </p>
              </div>

              <div className="site-footer-block site-footer-block--links">
                <Link href="/carte">Carte</Link>
                <Link href="/naturopathe-paris">Annuaire Paris</Link>
                <Link href="/praticiens">Espace praticiens</Link>
                <Link href="/a-propos">À propos</Link>
              </div>

              <div className="site-footer-block site-footer-block--meta">
                <p className="site-footer-copy">
                  Couverture initiale: Paris, avec extension progressive vers
                  l’Île-de-France.
                </p>
                <p className="site-footer-legal">
                  <Link href="/mentions-legales">Mentions légales</Link> ·{" "}
                  <Link href="/confidentialite">Confidentialité</Link> ·{" "}
                  <CookieSettingsButtonMount />
                </p>
              </div>
            </div>
          </footer>

          <MobileTabBar />
          <CookieBannerMount />
        </div>
      </body>
    </html>
  );
}
