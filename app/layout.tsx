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
    default: "Annuaire naturopathes en Île-de-France",
    template: "%s | NaturoCarte"
  },
  description:
    "Annuaire cartographique de naturopathes en Île-de-France. Trouvez un naturopathe par ville, département ou arrondissement à Paris.",
  openGraph: {
    title: "NaturoCarte | Annuaire des naturopathes en Île-de-France",
    description:
      "Annuaire cartographique de naturopathes en Île-de-France. Trouvez un naturopathe par ville, département ou arrondissement à Paris.",
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
            <div className="container">
              <div className="site-footer-inner">
                <div className="site-footer-branding">
                  <p className="site-footer-brand">NaturoCarte</p>
                  <p className="site-footer-copy">
                    Carte et annuaire des naturopathes en Île-de-France, avec navigation
                    locale pour Paris et les départements franciliens.
                  </p>
                </div>

                <nav className="site-footer-links" aria-label="Liens de pied de page">
                  <Link href="/carte">Carte</Link>
                  <Link href="/annuaire-naturopathes">Annuaire</Link>
                  <Link href="/praticiens">Espace praticiens</Link>
                  <Link href="/a-propos">À propos</Link>
                </nav>
              </div>

              <div className="site-footer-bottom">
                <p className="site-footer-copy">
                  Couverture actuelle: Paris et les départements d’Île-de-France.
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
