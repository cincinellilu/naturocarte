import type { Metadata } from "next";
import Link from "next/link";
import { getSiteUrl } from "@/lib/site";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import {
  formatParisPostalCode,
  PARIS_ARRONDISSEMENTS,
  toParisArrondissementLabel
} from "@/lib/paris";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Naturopathe Paris | Annuaire naturopathes",
  description:
    "Trouvez un naturopathe à Paris avec un annuaire clair par arrondissement, adresses et liens de contact.",
  alternates: {
    canonical: "/naturopathe-paris"
  },
  openGraph: {
    title: "Naturopathe Paris | Annuaire naturopathes | NaturoCarte",
    description:
      "Annuaire de naturopathes à Paris avec fiches détaillées et accès par arrondissement.",
    url: "/naturopathe-paris",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Naturopathe Paris | Annuaire naturopathes | NaturoCarte",
    description:
      "Annuaire de naturopathes à Paris avec fiches détaillées et accès par arrondissement."
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
    const { data } = await supabase
      .from("practitioners")
      .select("slug, first_name, last_name, city, postal_code, adresse")
      .eq("status", "published")
      .or("city.ilike.%paris%,postal_code.like.75%")
      .order("last_name", { ascending: true });

    practitioners = (data ?? []) as PractitionerRow[];
  } catch {
    practitioners = [];
  }

  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const canonicalUrl = `${siteUrl}/naturopathe-paris`;

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
            <p className="page-eyebrow">Paris • annuaire éditorial</p>
            <h1>Naturopathe Paris: un annuaire plus lisible par arrondissement</h1>
            <p className="page-lead">
              Cette page regroupe les fiches de naturopathes à Paris pour faciliter la
              recherche par quartier et arrondissement, avec accès rapide à la carte et aux
              fiches détaillées.
            </p>

            <div className="hero-actions">
              <Link className="btn" href="/carte">
                Voir la carte des naturopathes
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
              Pour une recherche plus directe, la carte permet aussi de trier les profils
              autour d’une adresse précise.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Navigation locale</p>
            <h2>Rechercher par arrondissement</h2>
          </div>
          <p className="section-intro">
            Accédez directement aux pages locales, de Paris 1 à Paris 20.
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

      <section className="paris-practitioners-section section-shell">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Référencement</p>
            <h2>Naturopathes référencés à Paris</h2>
          </div>
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

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
    </article>
  );
}
