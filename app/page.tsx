import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { GUIDE_INDEX_ENTRIES } from "@/lib/guides";
import { getSiteUrl } from "@/lib/site";
import { IDF_DEPARTMENTS } from "@/lib/locations";
import homeHeroImage from "@/assets/home-hero-naturopathy-v2.jpg";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "NaturoCarte | Trouver un naturopathe près de chez vous",
  description:
    "NaturoCarte aide à trouver un naturopathe près de chez vous via une carte interactive, des pages locales, des guides utiles et des fiches praticiens.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "NaturoCarte | Trouver un naturopathe près de chez vous",
    description:
      "NaturoCarte aide à trouver un naturopathe près de chez vous via une carte interactive, des pages locales, des guides utiles et des fiches praticiens.",
    url: siteUrl,
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "NaturoCarte | Trouver un naturopathe près de chez vous",
    description:
      "NaturoCarte aide à trouver un naturopathe près de chez vous via une carte interactive, des pages locales, des guides utiles et des fiches praticiens."
  }
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "NaturoCarte",
    url: siteUrl,
    inLanguage: "fr-FR",
    description:
      "Annuaire de naturopathes en France avec carte, pages locales et fiches praticiens."
  };

  return (
    <article className="home-page">
      <section className="home-hero home-hero-fullbleed">
        <div className="home-hero-background" aria-hidden="true">
          <Image
            src={homeHeroImage}
            alt="Espace de naturopathie axé sur l'alimentation et l'hygiène de vie"
            fill
            priority
            sizes="100vw"
            className="home-hero-background-image"
          />
          <div className="home-hero-background-scrim" />
        </div>

        <div className="container home-hero-overlay">
          <div className="home-hero-copy">
            <p className="page-eyebrow">NaturoCarte</p>
            <h1>Trouvez un naturopathe près de chez vous.</h1>
            <p className="page-lead home-lead">
              Explorez les praticiens autour de vous, comparez leurs profils et accédez
              rapidement à leurs informations de contact.
            </p>

            <div className="hero-actions">
              <Link href="/carte" className="btn" prefetch={false}>
                Ouvrir la carte
              </Link>
            </div>
          </div>

          <aside className="home-hero-guide-card" aria-label="Comment ça marche">
            <p className="section-eyebrow">Comment ça marche</p>
            <h2>Utilisez la carte en 3 gestes</h2>
            <div className="home-route home-route--hero">
              <article className="home-route-step">
                <span className="home-route-index">1</span>
                <div>
                  <h3>Choisissez une zone</h3>
                  <p>
                    Recherchez une ville, un département ou naviguez directement{" "}
                    <Link href="/carte" prefetch={false}>sur la carte</Link>.
                  </p>
                </div>
              </article>

              <article className="home-route-step">
                <span className="home-route-index">2</span>
                <div>
                  <h3>Découvrez les praticiens</h3>
                  <p>Consultez les naturopathes présents dans la zone sélectionnée.</p>
                </div>
              </article>

              <article className="home-route-step">
                <span className="home-route-index">3</span>
                <div>
                  <h3>Ouvrir la fiche</h3>
                  <p>
                    Retrouvez les informations utiles : contact, adresse, site web et détails du
                    praticien.
                  </p>
                </div>
              </article>
            </div>
          </aside>
        </div>
      </section>

      <section className="section-shell home-section">
        <div className="home-quick-zones">
          <p className="home-quick-zones-label">Départements couverts</p>
          <div className="home-chip-row">
            {IDF_DEPARTMENTS.map((department) => (
              <Link
                key={department.code}
                href={`/carte?zone=${department.code}`}
                className="home-chip"
                prefetch={false}
              >
                {department.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell home-section">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Guides utiles</p>
            <h2>Des pages qui aident à choisir</h2>
          </div>
          <p className="section-intro">
            Avant d’ouvrir la carte, lisez un guide court si vous voulez clarifier votre
            besoin ou comparer plus proprement les fiches.
          </p>
        </div>

        <div className="quick-guide-grid">
          {GUIDE_INDEX_ENTRIES.map((guide) => (
            <article key={guide.slug} className="about-card">
              <h3 className="about-title">{guide.title}</h3>
              <p>{guide.description}</p>
              <p className="about-inline-link">
                <Link href={guide.href} prefetch={false}>
                  Lire le guide
                </Link>
              </p>
            </article>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </article>
  );
}
