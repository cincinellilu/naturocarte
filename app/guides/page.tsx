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
    href: "/methode",
    ctaLabel: "Évaluer le sérieux d'un naturopathe"
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
            <p className="page-eyebrow">Questions fréquentes</p>
            <h1>Comment choisir un naturopathe</h1>
            <p className="page-lead">
              Ces contenus répondent aux questions les plus fréquentes avant un premier
              rendez-vous : comment choisir un naturopathe, comment en trouver un près de
              chez soi, comment le comparer à d'autres praticiens, comment distinguer
              naturopathe et diététicien, et comment repérer un cadre sérieux.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">À lire</p>
            <h2>Quatre guides pour choisir, comparer et trouver un naturopathe</h2>
          </div>
          <p className="section-intro">
            Chaque contenu cible une intention de recherche précise et apporte des repères
            concrets avant de prendre rendez-vous avec un praticien.
          </p>
        </div>

        <div className="quick-guide-grid">
          {guideHubEntries.map((entry) => (
            <article key={entry.slug} className="about-card">
              <h3 className="about-title">{entry.title}</h3>
              <p>{entry.description}</p>
              <p className="about-inline-link">
                <Link href={entry.href} prefetch={false}>
                  {"ctaLabel" in entry ? entry.ctaLabel : entry.title}
                </Link>
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Selon votre situation</p>
            <h2>Quelle page lire selon votre question</h2>
          </div>
          <p className="section-intro">
            Le bon point de départ dépend surtout de la question que vous vous posez
            avant de consulter.
          </p>
        </div>

        <div className="quick-guide-grid">
          <article className="about-card">
            <h3 className="about-title">Vous hésitez entre plusieurs praticiens</h3>
            <p>
              Commencez par les critères de choix : formation, cadre d'accompagnement,
              signaux d'alerte et questions à poser.
            </p>
            <p className="about-inline-link">
              <Link href="/guides/comment-choisir-un-naturopathe-a-paris" prefetch={false}>
                Comment choisir un naturopathe ?
              </Link>
            </p>
          </article>

          <article className="about-card">
            <h3 className="about-title">Vous ne savez pas quel professionnel consulter</h3>
            <p>
              Commencez par la différence entre naturopathe et diététicien pour clarifier
              le rôle, la formation et les cas d'usage.
            </p>
            <p className="about-inline-link">
              <Link href="/guides/naturopathe-ou-dieteticien-quelles-differences" prefetch={false}>
                Naturopathe ou diététicien ?
              </Link>
            </p>
          </article>

          <article className="about-card">
            <h3 className="about-title">Vous cherchez un praticien proche de chez vous</h3>
            <p>
              Commencez par la méthode de recherche locale : périmètre réaliste,
              comparaison utile et arbitrage entre proximité et pertinence.
            </p>
            <p className="about-inline-link">
              <Link href="/guides/trouver-un-naturopathe-autour-de-moi-en-ile-de-france" prefetch={false}>
                Trouver un naturopathe autour de moi
              </Link>
            </p>
          </article>

          <article className="about-card">
            <h3 className="about-title">Vous voulez vérifier si un praticien inspire confiance</h3>
            <p>
              Commencez par les repères de sérieux : transparence, limites, posture,
              promesses et rapport aux produits.
            </p>
            <p className="about-inline-link">
              <Link href="/methode" prefetch={false}>
                Comment savoir si un naturopathe est sérieux ?
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
