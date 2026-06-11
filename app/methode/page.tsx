import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSiteUrl } from "@/lib/site";

type MethodCard = {
  title: string;
  text: string;
};

type MethodSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

type MethodFaqItem = {
  question: string;
  answer: string;
};

const keyPoints: MethodCard[] = [
  {
    title: "Transparence du parcours",
    text: "Un praticien sérieux explique clairement sa formation, son expérience et les sujets sur lesquels il accompagne."
  },
  {
    title: "Clarté des limites",
    text: "Il sait dire ce qui relève de son accompagnement, ce qui n'en relève pas et quand un autre professionnel doit intervenir."
  },
  {
    title: "Discours mesuré",
    text: "Il ne promet ni guérison, ni solution universelle, ni opposition systématique avec le monde médical."
  }
];

const sections: MethodSection[] = [
  {
    title: "Quels signes montrent qu'un naturopathe est sérieux ?",
    paragraphs: [
      "Le premier critère de sérieux est souvent la capacité à décrire son travail avec simplicité. Un praticien fiable explique sa méthode, les objectifs d'une consultation et le type de besoins qu'il accompagne, sans donner l'impression de tout traiter.",
      "Cette clarté passe aussi par les limites annoncées. Plus un professionnel sait dire ce qu'il ne fait pas, plus son cadre inspire confiance. À l'inverse, un discours qui prétend convenir à tout le monde et répondre à tous les problèmes doit rendre prudent."
    ]
  },
  {
    title: "Comment vérifier la formation d'un naturopathe ?",
    paragraphs: [
      "En naturopathie, les parcours de formation peuvent varier fortement. C'est pourquoi il est utile de demander le nom de l'école, la durée du cursus, les contenus étudiés et la manière dont le praticien a construit son expérience.",
      "Le sérieux ne repose pas sur un intitulé prestigieux ou sur une accumulation de mots techniques, mais sur la capacité à présenter un parcours compréhensible, cohérent et assumé."
    ],
    bullets: [
      "Nom de l'école ou de l'organisme de formation",
      "Durée du parcours et contenu principal",
      "Ancienneté dans la pratique",
      "Publics principalement accompagnés",
      "Formations continues ou mise à jour régulière des connaissances"
    ]
  },
  {
    title: "Pourquoi le rapport au suivi médical est-il un critère clé ?",
    paragraphs: [
      "Un naturopathe sérieux n'oppose pas son accompagnement au suivi médical. Il ne demande pas d'arrêter un traitement, de renoncer à des examens ou de se détourner d'un professionnel de santé lorsque la situation l'exige.",
      "Au contraire, il reconnaît les limites de son champ d'intervention et encourage un avis adapté lorsque les symptômes, les antécédents ou la gravité potentielle de la situation le justifient."
    ]
  },
  {
    title: "Que doit contenir un premier rendez-vous sérieux ?",
    paragraphs: [
      "Un premier échange sérieux repose davantage sur l'écoute que sur l'effet d'annonce. Le praticien cherche à comprendre votre besoin, votre contexte, vos contraintes et vos attentes avant de proposer une direction de travail.",
      "Vous devez ressortir avec une vision plus claire du cadre proposé : déroulé de la consultation, objectifs réalistes, rythme éventuel du suivi et place laissée à votre autonomie. Si vous repartez surtout impressionné ou confus, ce n'est pas un bon signal."
    ]
  },
  {
    title: "Quels signaux d'alerte doivent faire reculer ?",
    paragraphs: [
      "La vente systématique de compléments, de cures ou de programmes coûteux dès le départ doit alerter. Un praticien peut éventuellement recommander certains produits, mais ils ne devraient pas occuper le centre de la relation ni devenir une condition implicite du suivi.",
      "La même vigilance vaut pour les forfaits très engageants proposés trop vite, les promesses de résultats rapides ou la pression commerciale. Un accompagnement sérieux laisse de la place à la réflexion et au consentement éclairé."
    ]
  }
];

const faqItems: MethodFaqItem[] = [
  {
    question: "L'absence de diplôme d'État veut-elle dire qu'un praticien n'est pas sérieux ?",
    answer:
      "Pas automatiquement. En revanche, cela rend la vérification du parcours encore plus importante : formation suivie, durée, expérience, clarté des limites et qualité du premier échange."
  },
  {
    question: "Faut-il éviter un praticien qui vend des compléments ?",
    answer:
      "Pas forcément dans tous les cas, mais il faut rester vigilant si la vente de produits devient centrale, systématique ou présentée comme indispensable dès le premier rendez-vous."
  },
  {
    question: "Que faire si un praticien demande d'arrêter un traitement ?",
    answer:
      "C'est un signal d'alerte majeur. Il est préférable d'interrompre la démarche, de demander un avis médical et de ne jamais modifier un traitement sans l'encadrement approprié."
  }
];

const relatedLinks = [
  {
    href: "/guides/comment-choisir-un-naturopathe-a-paris",
    label: "Comment choisir un naturopathe ?"
  },
  {
    href: "/guides/naturopathe-ou-dieteticien-quelles-differences",
    label: "Naturopathe ou diététicien : quelle différence ?"
  },
  {
    href: "/guides/trouver-un-naturopathe-autour-de-moi-en-ile-de-france",
    label: "Trouver un naturopathe autour de moi"
  }
];

export const metadata: Metadata = {
  title: "Comment évaluer le sérieux d'un naturopathe : critères utiles",
  description:
    "Formation, transparence, limites annoncées, promesses excessives et vente de produits : les repères concrets pour évaluer le sérieux d'un naturopathe.",
  keywords: [
    "comment savoir si un naturopathe est sérieux",
    "évaluer le sérieux d'un naturopathe",
    "naturopathe sérieux",
    "signaux d'alerte naturopathe",
    "formation naturopathe"
  ],
  alternates: {
    canonical: "/methode"
  },
  openGraph: {
    title: "Comment évaluer le sérieux d'un naturopathe : critères utiles | NaturoCarte",
    description:
      "Formation, transparence, limites annoncées, promesses excessives et vente de produits : les repères concrets pour évaluer le sérieux d'un naturopathe.",
    url: "/methode",
    type: "article"
  },
  twitter: {
    card: "summary",
    title: "Comment évaluer le sérieux d'un naturopathe : critères utiles | NaturoCarte",
    description:
      "Formation, transparence, limites annoncées, promesses excessives et vente de produits : les repères concrets pour évaluer le sérieux d'un naturopathe."
  }
};

export default function MethodePage() {
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const canonicalUrl = `${siteUrl}/methode`;

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
        name: "Comment évaluer le sérieux d'un naturopathe ?",
        item: canonicalUrl
      }
    ]
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
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
    headline: "Comment évaluer le sérieux d'un naturopathe : critères utiles",
    description:
      "Repères concrets pour distinguer un cadre sérieux d'un discours trop flou, trop commercial ou trop prometteur.",
    url: canonicalUrl,
    inLanguage: "fr-FR",
    mainEntityOfPage: canonicalUrl,
    articleSection: sections.map((section) => section.title),
    keywords:
      "comment savoir si un naturopathe est sérieux, évaluer le sérieux d'un naturopathe, signaux d'alerte naturopathe",
    author: {
      "@type": "Organization",
      name: "NaturoCarte"
    }
  };

  return (
    <article className="about-page guide-article-page method-page">
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
              <li aria-current="page">Comment évaluer le sérieux d'un naturopathe ?</li>
            </ol>
          </nav>

          <div className="page-hero-copy about-hero-copy">
            <p className="page-eyebrow">Guide pratique</p>
            <h1>Comment évaluer le sérieux d'un naturopathe ?</h1>
            <p className="page-lead">
              Avant de prendre rendez-vous, il est utile de savoir distinguer un cadre
              sérieux d'un discours trop vague, trop commercial ou trop prometteur. Les
              bons repères tiennent surtout à la transparence, à la clarté des limites et à
              la qualité du premier échange.
            </p>

            <div className="hero-actions">
              <Link className="btn" href="#method-essentials" prefetch={false}>
                Les repères essentiels
              </Link>
              <Link className="btn btn-secondary" href="#faq-title" prefetch={false}>
                Questions fréquentes
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="method-essentials" className="section-shell">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">En bref</p>
            <h2>Les repères essentiels</h2>
          </div>
          <p className="section-intro">
            Le sérieux d'un praticien se juge moins à sa promesse qu'à sa transparence,
            à son cadre de travail et à sa capacité à reconnaître ses limites.
          </p>
        </div>

        <div className="quick-guide-grid">
          {keyPoints.map((card) => (
            <article key={card.title} className="about-card">
              <h3 className="about-title">{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      {sections.map((section) => (
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

        {faqItems.map((item) => (
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
          {relatedLinks.map((link) => (
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
    </article>
  );
}
