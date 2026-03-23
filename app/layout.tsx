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
    default: "Trouver un naturopathe en Île-de-France",
    template: "%s | NaturoCarte"
  },
  description:
    "Cherchez un naturopathe en Île-de-France par adresse, département ou arrondissement à Paris, puis comparez les fiches en quelques clics.",
  openGraph: {
    title: "NaturoCarte | Trouver un naturopathe en Île-de-France",
    description:
      "Cherchez un naturopathe en Île-de-France par adresse, département ou arrondissement à Paris, puis comparez les fiches en quelques clics.",
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
                    Cherchez un naturopathe près de chez vous en Île-de-France, par carte,
                    département ou arrondissement à Paris.
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
