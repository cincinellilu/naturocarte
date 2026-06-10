import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GUIDE_INDEX_ENTRIES } from "@/lib/guides";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Guides pratiques",
  description:
    "Des pages simples pour mieux choisir un naturopathe, comprendre les différences avec la diététique et trouver plus vite une fiche utile.",
  alternates: {
    canonical: "/guides"
  },
  openGraph: {
    title: "Guides pratiques | NaturoCarte",
    description:
      "Des pages simples pour mieux choisir un naturopathe, comprendre les différences avec la diététique et trouver plus vite une fiche utile.",
    url: "/guides",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Guides pratiques | NaturoCarte",
    description:
      "Des pages simples pour mieux choisir un naturopathe, comprendre les différences avec la diététique et trouver plus vite une fiche utile."
  }
};

export default function GuidesPage() {
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Guides pratiques NaturoCarte",
    url: `${siteUrl}/guides`,
    inLanguage: "fr-FR",
    about: "Guides utiles pour trouver un naturopathe en Île-de-France",
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: GUIDE_INDEX_ENTRIES.length,
      itemListElement: GUIDE_INDEX_ENTRIES.map((entry, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: entry.title,
        item: `${siteUrl}${entry.href}`
      }))
    }
  };

  return (
    <article className="about-page guide-index-page">
      <section className="page-hero page-hero--about">
        <div className="page-hero-background about-hero-background" aria-hidden="true">
          <Image
            src="https://images.pexels.com/photos/6383166/pexels-photo-6383166.jpeg?auto=compress&cs=tinysrgb&h=900&w=1600"
            alt=""
            fill
            sizes="100vw"
            priority
            className="home-hero-background-image about-hero-background-image"
          />
          <div className="home-hero-background-scrim about-hero-background-scrim" />
        </div>

        <div className="page-hero-grid about-hero-grid">
          <nav className="breadcrumb-nav about-hero-breadcrumb" aria-label="Fil d’Ariane">
            <ol>
              <li>
                <Link href="/">Accueil</Link>
              </li>
              <li aria-hidden="true">›</li>
              <li aria-current="page">Guides</li>
            </ol>
          </nav>

          <div className="page-hero-copy about-hero-copy">
            <p className="page-eyebrow">NaturoCarte</p>
            <h1>Guides pratiques</h1>
            <p className="page-lead">
              Des pages utiles pour choisir plus vite, comprendre les différences de
              positionnement et aller directement vers la carte ou les fiches locales.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">À lire</p>
            <h2>Trois guides pour mieux chercher</h2>
          </div>
          <p className="section-intro">
            Chaque guide répond à un besoin concret et renvoie vers la carte, l’annuaire
            ou les pages locales quand c’est plus utile.
          </p>
        </div>

        <div className="quick-guide-grid">
          {GUIDE_INDEX_ENTRIES.map((entry) => (
            <article key={entry.slug} className="about-card">
              <h3 className="about-title">{entry.title}</h3>
              <p>{entry.description}</p>
              <p className="about-inline-link">
                <Link href={entry.href} prefetch={false}>
                  Lire le guide
                </Link>
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Pages locales</p>
            <h2>Des points d’entrée simples</h2>
          </div>
          <p className="section-intro">
            Commencez par la carte si vous partez d’une adresse, ou par les pages Paris
            et Île-de-France si vous voulez filtrer plus vite.
          </p>
        </div>

        <div className="quick-guide-grid">
          <article className="about-card">
            <h3 className="about-title">Carte</h3>
            <p>La meilleure porte d’entrée quand vous cherchez autour d’une adresse précise.</p>
            <p className="about-inline-link">
              <Link href="/carte" prefetch={false}>
                Ouvrir la carte
              </Link>
            </p>
          </article>

          <article className="about-card">
            <h3 className="about-title">Paris par arrondissement</h3>
            <p>Une vue locale pour comparer rapidement les fiches d’un secteur précis.</p>
            <p className="about-inline-link">
              <Link href="/naturopathe-paris" prefetch={false}>
                Voir Paris
              </Link>
            </p>
          </article>

          <article className="about-card">
            <h3 className="about-title">Annuaire Île-de-France</h3>
            <p>Une vue plus large si vous voulez repartir d’un ensemble de départements.</p>
            <p className="about-inline-link">
              <Link href="/annuaire-naturopathes" prefetch={false}>
                Voir l’annuaire
              </Link>
            </p>
          </article>
        </div>
      </section>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
    </article>
  );
}
