import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuidePage } from "@/lib/guides";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 3600;

type RouteParams = {
  slug: string;
};

export function generateStaticParams() {
  return [
    { slug: "comment-choisir-un-naturopathe-a-paris" },
    { slug: "naturopathe-ou-dieteticien-quelles-differences" },
    { slug: "trouver-un-naturopathe-autour-de-moi-en-ile-de-france" }
  ];
}

export async function generateMetadata({
  params
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const guide = getGuidePage(resolvedParams.slug);

  if (!guide) {
    return {
      title: "Page introuvable",
      robots: { index: false, follow: false }
    };
  }

  const title = guide.seoTitle ?? guide.title;
  return {
    title,
    description: guide.description,
    keywords: guide.keywords,
    alternates: {
      canonical: `/guides/${guide.slug}`
    },
    openGraph: {
      title: `${title} | NaturoCarte`,
      description: guide.description,
      url: `/guides/${guide.slug}`,
      type: "article"
    },
    twitter: {
      card: "summary",
      title: `${title} | NaturoCarte`,
      description: guide.description
    }
  };
}

export default async function GuidePage({
  params
}: {
  params: Promise<RouteParams>;
}) {
  const resolvedParams = await params;
  const guide = getGuidePage(resolvedParams.slug);

  if (!guide) notFound();

  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const canonicalUrl = `${siteUrl}/guides/${guide.slug}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: `${siteUrl}/`
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Guides",
        item: `${siteUrl}/guides`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.title,
        item: canonicalUrl
      }
    ]
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.seoTitle ?? guide.title,
    description: guide.description,
    url: canonicalUrl,
    inLanguage: "fr-FR",
    mainEntityOfPage: canonicalUrl,
    articleSection: guide.sections.map((section) => section.title),
    keywords: guide.keywords?.join(", "),
    author: {
      "@type": "Organization",
      name: "NaturoCarte"
    }
  };

  const howToJsonLd = guide.howToSteps
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: guide.seoTitle ?? guide.title,
        description: guide.description,
        inLanguage: "fr-FR",
        step: guide.howToSteps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step,
          text: step
        }))
      }
    : null;

  return (
    <article className="about-page guide-article-page">
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
              <li>
                <Link href="/guides">Guides</Link>
              </li>
              <li aria-hidden="true">›</li>
              <li aria-current="page">{guide.title}</li>
            </ol>
          </nav>

          <div className="page-hero-copy about-hero-copy">
            <p className="page-eyebrow">Guide pratique</p>
            <h1>{guide.title}</h1>
            <p className="page-lead">{guide.intro}</p>

            <div className="hero-actions">
              <Link className="btn" href="#guide-essentials" prefetch={false}>
                Les repères essentiels
              </Link>
              <Link className="btn btn-secondary" href="#faq-title" prefetch={false}>
                Questions fréquentes
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="guide-essentials" className="section-shell">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">En bref</p>
            <h2>Les repères essentiels</h2>
          </div>
          <p className="section-intro">
            L'objectif est d'identifier rapidement les critères qui comptent vraiment,
            puis de prendre une décision plus éclairée.
          </p>
        </div>

        <div className="quick-guide-grid">
          {guide.cards.map((card) => (
            <article key={card.title} className="about-card">
              <h3 className="about-title">{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      {guide.sections.map((section) => (
        <section key={section.title} className="about-card">
          <h2 className="about-title">{section.title}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.bullets ? (
            <ul className="guide-bullet-list">
              {section.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}

      <section aria-labelledby="faq-title" className="faq-section section-shell section-shell--compact">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Questions fréquentes</p>
            <h2 id="faq-title">Réponses rapides</h2>
          </div>
        </div>

        {guide.faq.map((item) => (
          <details key={item.question} className="faq-item">
            <summary className="faq-question">{item.question}</summary>
            <div className="faq-answer">
              <p>{item.answer}</p>
            </div>
          </details>
        ))}
      </section>

      <section className="about-card">
        <h2 className="about-title">Aller plus loin</h2>
        <ul className="guide-link-list">
          {guide.relatedLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} prefetch={false}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {howToJsonLd ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
        />
      ) : null}
    </article>
  );
}
