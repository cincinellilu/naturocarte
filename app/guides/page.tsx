import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GUIDE_INDEX_ENTRIES } from "@/lib/guides";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();
const guideHubEntries = [
  ...GUIDE_INDEX_ENTRIES,
  {
    slug: "methode",
    title: "Comment évaluer le sérieux d'un naturopathe ?",
    description:
      "Des repères concrets pour distinguer un cadre sérieux d'un discours trop flou, trop commercial ou trop prometteur.",
    href: "/methode"
  }
];

export const metadata: Metadata = {
  title: "Comment choisir un naturopathe : guides pratiques",
  description:
    "Guides pédagogiques pour choisir un naturopathe, comprendre la différence avec un diététicien, trouver un naturopathe autour de soi et évaluer le sérieux d'un praticien.",
  keywords: [
    "comment choisir un naturopathe",
    "comment trouver un naturopathe",
    "naturopathe ou diététicien",
    "comment savoir si un naturopathe est sérieux",
    "guides naturopathe"
  ],
  alternates: {
    canonical: "/guides"
  },
  openGraph: {
    title: "Comment choisir un naturopathe : guides pratiques | NaturoCarte",
    description:
      "Guides pédagogiques pour choisir un naturopathe, comprendre la différence avec un diététicien, trouver un naturopathe autour de soi et évaluer le sérieux d'un praticien.",
    url: "/guides",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Comment choisir un naturopathe : guides pratiques | NaturoCarte",
    description:
      "Guides pédagogiques pour choisir un naturopathe, comprendre la différence avec un diététicien, trouver un naturopathe autour de soi et évaluer le sérieux d'un praticien."
  }
};

export default function GuidesPage() {
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Guides pour choisir un naturopathe",
    url: `${siteUrl}/guides`,
    description:
      "Ressources pédagogiques pour choisir un naturopathe, comparer plusieurs praticiens et comprendre les différences avec un diététicien.",
    inLanguage: "fr-FR",
    about: "Repères pédagogiques pour choisir un naturopathe et comparer plusieurs praticiens",
    keywords:
      "comment choisir un naturopathe, comment trouver un naturopathe, naturopathe ou diététicien, naturopathe sérieux",
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: guideHubEntries.length,
      itemListElement: guideHubEntries.map((entry, index) => ({
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
            <p className="page-eyebrow">Articles pratiques</p>
            <h1>Guides pour choisir un naturopathe</h1>
            <p className="page-lead">
              Ces articles répondent aux questions les plus fréquentes avant un premier
              rendez-vous : comment choisir un naturopathe, comment en trouver un près de
              chez soi, comment distinguer naturopathe et diététicien, et comment évaluer
              le sérieux d'un praticien.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">À lire</p>
            <h2>Articles à lire avant de choisir un praticien</h2>
          </div>
          <p className="section-intro">
            Chaque page traite une problématique précise et apporte des repères concrets
            pour mieux comprendre votre besoin avant de prendre rendez-vous.
          </p>
        </div>

        <div className="quick-guide-grid">
          {guideHubEntries.map((entry) => (
            <article key={entry.slug} className="about-card">
              <h3 className="about-title">{entry.title}</h3>
              <p>{entry.description}</p>
              <p className="about-inline-link">
                <Link href={entry.href} prefetch={false}>
                  Lire l'article
                </Link>
              </p>
            </article>
          ))}
        </div>

        <p className="about-inline-link">
          Commencez par le sujet le plus proche de votre situation, puis comparez les
          critères proposés avec votre besoin réel avant de prendre rendez-vous.
        </p>
      </section>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
    </article>
  );
}
