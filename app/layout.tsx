import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getSiteUrl } from "@/lib/site";
import Analytics from "@/components/Analytics";
import CookieBannerMount from "@/components/CookieBannerMount";
import CookieSettingsButtonMount from "@/components/CookieSettingsButtonMount";
import HeaderAccountLink from "@/components/HeaderAccountLink";
import { SessionSummaryProvider } from "@/components/SessionSummaryProvider";
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
        <SessionSummaryProvider>
        <div className="site-shell">
          <header className="site-header">
            <div className="container">
              <div className="site-header-inner">
                <Link href="/" className="site-brand" aria-label="NaturoCarte, retour a l’accueil" prefetch={false}>
                  <span className="site-brand-mark" aria-hidden="true">
                    N
                  </span>
                  <span className="site-brand-copy">
                    <span className="site-brand-name">NaturoCarte</span>
                  </span>
                </Link>

                <div className="site-header-actions">
                  <SiteHeaderNav />

                  <Link href="/carte" className="site-header-cta" prefetch={false}>
                    Ouvrir la carte
                  </Link>

                  <HeaderAccountLink />
                </div>
              </div>
            </div>
          </header>

          <main className="site-main">
            <div className="container">{children}</div>
          </main>

          <footer className="site-footer">
            <div className="container">
              <div className="site-footer-inner">
                <div className="site-footer-branding">
                  <p className="site-footer-copy">
                    Cherchez un naturopathe près de chez vous en Île-de-France, par carte,
                    département ou arrondissement à Paris.
                  </p>
                </div>

                <nav className="site-footer-links" aria-label="Liens de pied de page">
                  <Link href="/carte" prefetch={false}>Carte</Link>
                  <Link href="/annuaire-naturopathes" prefetch={false}>Annuaire</Link>
                  <Link href="/praticiens" prefetch={false}>Espace praticiens</Link>
                  <Link href="/methode" prefetch={false}>Méthode</Link>
                  <Link href="/a-propos" prefetch={false}>À propos</Link>
                </nav>
              </div>

              <div className="site-footer-bottom">
                <p className="site-footer-copy">
                  Couverture actuelle: Paris et les départements d’Île-de-France.
                </p>
                <p className="site-footer-legal">
                  <Link href="/mentions-legales" prefetch={false}>Mentions légales</Link> ·{" "}
                  <Link href="/confidentialite" prefetch={false}>Confidentialité</Link> ·{" "}
                  <CookieSettingsButtonMount />
                </p>
              </div>
            </div>
          </footer>

          <MobileTabBar />
          <CookieBannerMount />
        </div>
        </SessionSummaryProvider>
      </body>
    </html>
  );
}
