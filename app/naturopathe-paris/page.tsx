import type { Metadata } from "next";
import Link from "next/link";
import { fetchAllSupabaseRows } from "@/lib/fetch-all-supabase-rows";
import { PUBLIC_PRACTITIONER_STATUSES } from "@/lib/practitioner-status";
import { getSiteUrl } from "@/lib/site";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import {
  formatParisPostalCode,
  PARIS_ARRONDISSEMENTS,
  toParisArrondissementLabel
} from "@/lib/paris";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Naturopathe Paris | Trouver par arrondissement",
  description:
    "Cherchez un naturopathe à Paris par arrondissement, comparez les fiches et repérez rapidement les praticiens proches de votre secteur.",
  alternates: {
    canonical: "/naturopathe-paris"
  },
  openGraph: {
    title: "Naturopathe Paris | Trouver par arrondissement | NaturoCarte",
    description:
      "Cherchez un naturopathe à Paris par arrondissement et ouvrez rapidement les fiches des praticiens.",
    url: "/naturopathe-paris",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Naturopathe Paris | Trouver par arrondissement | NaturoCarte",
    description:
      "Cherchez un naturopathe à Paris par arrondissement et ouvrez rapidement les fiches des praticiens."
  }
};

type PractitionerRow = {
  slug: string;
  first_name: string;
  last_name: string;
  city: string | null;
  postal_code: string | null;
  adresse: string | null;
};

export default async function NaturopatheParisPage() {
  let practitioners: PractitionerRow[] = [];

  try {
    const supabase = getSupabaseServerClient();
    practitioners = await fetchAllSupabaseRows<PractitionerRow>((from, to) =>
      supabase
        .from("practitioners")
        .select("slug, first_name, last_name, city, postal_code, adresse")
        .in("status", [...PUBLIC_PRACTITIONER_STATUSES])
        .or("city.ilike.%paris%,postal_code.like.75%")
        .order("last_name", { ascending: true })
        .range(from, to)
    );
  } catch {
    practitioners = [];
  }

  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const canonicalUrl = `${siteUrl}/naturopathe-paris`;
  const quickGuide = [
    {
      title: "1. Choisir un secteur",
      text: "Commencez par l’arrondissement le plus pertinent, puis élargissez si besoin à Paris voisin ou à la carte."
    },
    {
      title: "2. Ouvrir la fiche",
      text: "Comparez l’adresse, la ville, les coordonnées et les informations visibles avant de contacter le praticien."
    },
    {
      title: "3. Revenir à la vue d’ensemble",
      text: "Si vous hésitez encore, utilisez la carte ou l’annuaire Île-de-France pour repartir d’une vue plus large."
    }
  ];
  const faqItems = [
    {
      question: "Comment choisir un naturopathe à Paris ?",
      answer:
        "Le plus efficace est de partir de l’arrondissement, d’ouvrir plusieurs fiches, puis de comparer l’adresse, les infos de contact et la présentation du praticien."
    },
    {
      question: "Faut-il passer par la carte ou par cette page ?",
      answer:
        "Cette page est pensée pour la recherche par secteur. La carte est plus pratique quand vous partez d’une adresse ou quand vous voulez élargir la zone."
    },
    {
      question: "Que contient une fiche praticien ?",
      answer:
        "Chaque fiche rassemble les informations publiques utiles pour comparer les praticiens avant de passer à la prise de contact."
    }
  ];

  const itemListElement = practitioners.slice(0, 80).map((p, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: `${p.first_name} ${p.last_name}`,
    item: `${siteUrl}/naturopathe/${p.slug}`
  }));

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Naturopathe Paris - Annuaire naturopathes",
    url: canonicalUrl,
    about: "Annuaire des naturopathes à Paris",
    inLanguage: "fr-FR",
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: practitioners.length,
      itemListElement
    }
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

  return (
    <article className="article-shell">
      <nav className="breadcrumb-nav" aria-label="Fil d’Ariane">
        <ol>
          <li>
            <Link href="/">Accueil</Link>
          </li>
          <li aria-hidden="true">›</li>
          <li aria-current="page">Naturopathe Paris</li>
        </ol>
      </nav>

      <section className="page-hero page-hero--directory">
        <div className="page-hero-grid">
          <div className="page-hero-copy">
            <p className="page-eyebrow">Paris • recherche locale</p>
            <h1>Trouver un naturopathe à Paris</h1>
            <p className="page-lead">
              Choisissez votre arrondissement si vous savez déjà où chercher, ou utilisez
              la carte pour comparer les praticiens autour d’une adresse précise.
            </p>

            <div className="hero-actions">
              <Link className="btn" href="/carte">
                Rechercher autour d’une adresse
              </Link>
              <Link className="btn btn-secondary" href="/annuaire-naturopathes">
                Voir toutes les zones
              </Link>
            </div>
          </div>

          <div className="hero-panel">
            <p className="hero-panel-label">Couverture actuelle</p>
            <div className="hero-metrics">
              <div className="hero-metric">
                <strong>{PARIS_ARRONDISSEMENTS.length}</strong>
                <span>arrondissements</span>
              </div>
              <div className="hero-metric">
                <strong>{practitioners.length}</strong>
                <span>fiches publiées</span>
              </div>
            </div>
            <p className="hero-note">
              Si vous hésitez entre plusieurs secteurs, la carte permet de recentrer la
              recherche et d’ouvrir rapidement plusieurs fiches.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Choisir votre secteur</p>
            <h2>Commencez par l’arrondissement</h2>
          </div>
          <p className="section-intro">
            Accédez directement aux pages locales, de Paris 1 à Paris 20, pour aller plus
            vite vers les fiches utiles.
          </p>
        </div>
        <ul className="practitioner-list">
          {PARIS_ARRONDISSEMENTS.map((arrondissement) => (
            <li key={arrondissement}>
              <div>
                <strong>Naturopathe Paris {arrondissement}</strong>
                <div className="practitioner-item-meta">
                  {toParisArrondissementLabel(arrondissement)} ({formatParisPostalCode(arrondissement)})
                </div>
              </div>
              <Link
                className="practitioner-item-link"
                href={`/naturopathe-paris/${arrondissement}`}
              >
                Voir la page
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="section-shell">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Mode d’emploi</p>
            <h2>Comment comparer les fiches rapidement</h2>
          </div>
          <p className="section-intro">
            Cette page existe pour réduire le temps de recherche. L’idée est simple:
            partir d’un secteur, ouvrir plusieurs fiches et comparer ce qui compte
            vraiment avant de choisir.
          </p>
        </div>
        <div className="quick-guide-grid">
          {quickGuide.map((step) => (
            <div key={step.title} className="about-card">
              <h3 className="about-title">{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="paris-practitioners-section section-shell">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Praticiens disponibles</p>
            <h2>Voir les praticiens publiés à Paris</h2>
          </div>
          <p className="section-intro">
            Affichez la liste si vous préférez parcourir l’ensemble des fiches publiées
            avant de choisir un arrondissement précis.
          </p>
        </div>
        <details className="faq-item">
          <summary className="faq-question">Afficher la liste ({practitioners.length})</summary>
          {practitioners.length === 0 ? (
            <p className="faq-answer">Aucun naturopathe n’est disponible pour le moment.</p>
          ) : (
            <ul className="practitioner-list">
              {practitioners.map((p) => (
                <li key={p.slug}>
                  <div>
                    <strong>
                      {p.first_name} {p.last_name}
                    </strong>
                    <div className="practitioner-item-meta">
                      {[p.adresse, p.postal_code, p.city].filter(Boolean).join(", ")}
                    </div>
                  </div>
                  <Link className="practitioner-item-link" href={`/naturopathe/${p.slug}`}>
                    Voir la fiche
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </details>
      </section>

      <section aria-labelledby="faq-title" className="faq-section section-shell section-shell--compact">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Questions fréquentes</p>
            <h2 id="faq-title">Comprendre la page Paris</h2>
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

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </article>
  );
}
