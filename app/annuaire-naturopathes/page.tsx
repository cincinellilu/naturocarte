import type { Metadata } from "next";
import Link from "next/link";
import {
  type DepartmentInfo,
  IDF_DEPARTMENTS,
  getDepartmentFromPostalCode
} from "@/lib/locations";
import { getSiteUrl } from "@/lib/site";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Naturopathe Île-de-France | Trouver près de chez vous",
  description:
    "Cherchez un naturopathe en Île-de-France par département. Paris par arrondissement, Hauts-de-Seine, Yvelines, Seine-Saint-Denis, Val-de-Marne, Essonne, Seine-et-Marne et Val-d’Oise.",
  alternates: {
    canonical: "/annuaire-naturopathes"
  },
  openGraph: {
    title: "Naturopathe Île-de-France | Trouver près de chez vous | NaturoCarte",
    description:
      "Choisissez votre département, ouvrez les fiches des praticiens et lancez une recherche rapide autour de votre adresse en Île-de-France.",
    url: "/annuaire-naturopathes",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Naturopathe Île-de-France | Trouver près de chez vous | NaturoCarte",
    description:
      "Choisissez votre département, ouvrez les fiches des praticiens et lancez une recherche rapide autour de votre adresse en Île-de-France."
  }
};

type PractitionerRow = {
  city: string | null;
  postal_code: string | null;
};

type DepartmentBucket = {
  count: number;
  cityCounts: Map<string, number>;
};

type DepartmentSummary = {
  department: DepartmentInfo;
  anchorId: string;
  keyword: string;
  count: number;
  description: string;
  sampleCities: string[];
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

function normalizeCity(value: string | null | undefined): string | null {
  const raw = value?.trim();
  return raw ? raw : null;
}

function formatInlineList(values: string[]): string {
  if (values.length === 0) return "";
  if (values.length === 1) return values[0];
  if (values.length === 2) return `${values[0]} et ${values[1]}`;
  return `${values.slice(0, -1).join(", ")} et ${values[values.length - 1]}`;
}

function buildDepartmentKeyword(department: DepartmentInfo): string {
  return department.code === "75" ? "Naturopathe Paris" : `Naturopathe ${department.name}`;
}

function buildDepartmentDescription(
  department: DepartmentInfo,
  count: number,
  sampleCities: string[]
): string {
  if (department.code === "75") {
    if (count === 0) {
      return "Commencez par votre arrondissement si vous savez déjà où chercher, ou utilisez la carte pour une recherche autour d’une adresse.";
    }

    return `${count} praticiens publiés à Paris. Commencez par votre arrondissement pour aller plus vite.`;
  }

  if (count === 0) {
    return `Le ${department.name} est en cours d’enrichissement. Vous pouvez déjà lancer une recherche sur la carte pour explorer cette zone.`;
  }

  const sampleCitiesLabel =
    sampleCities.length > 0 ? `, notamment à ${formatInlineList(sampleCities)}` : "";

  return `${count} praticiens publiés dans ${department.name}${sampleCitiesLabel}.`;
}

export default async function AnnuaireNaturopathesPage() {
  let practitioners: PractitionerRow[] = [];

  try {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      .from("practitioners")
      .select("city, postal_code")
      .eq("status", "published");

    practitioners = (data ?? []) as PractitionerRow[];
  } catch {
    practitioners = [];
  }

  const buckets = new Map<string, DepartmentBucket>(
    IDF_DEPARTMENTS.map((department) => [
      department.code,
      { count: 0, cityCounts: new Map<string, number>() }
    ])
  );

  for (const practitioner of practitioners) {
    const department = getDepartmentFromPostalCode(practitioner.postal_code);
    if (!department) continue;

    const bucket = buckets.get(department.code);
    if (!bucket) continue;

    bucket.count += 1;

    const city = normalizeCity(practitioner.city);
    if (!city) continue;

    bucket.cityCounts.set(city, (bucket.cityCounts.get(city) ?? 0) + 1);
  }

  const departmentSummaries: DepartmentSummary[] = IDF_DEPARTMENTS.map((department) => {
    const bucket = buckets.get(department.code) ?? {
      count: 0,
      cityCounts: new Map<string, number>()
    };
    const sampleCities = Array.from(bucket.cityCounts.entries())
      .sort((left, right) => {
        if (right[1] !== left[1]) return right[1] - left[1];
        return left[0].localeCompare(right[0], "fr", { sensitivity: "base" });
      })
      .slice(0, 3)
      .map(([city]) => city);

    return {
      department,
      anchorId: `departement-${department.code}`,
      keyword: buildDepartmentKeyword(department),
      count: bucket.count,
      description: buildDepartmentDescription(department, bucket.count, sampleCities),
      sampleCities,
      primaryHref: department.code === "75" ? "/naturopathe-paris" : `/carte?zone=${department.code}`,
      primaryLabel: department.code === "75" ? "Choisir un arrondissement" : "Voir les praticiens",
      secondaryHref: department.code === "75" ? "/carte?zone=75" : undefined,
      secondaryLabel: department.code === "75" ? "Voir Paris sur la carte" : undefined
    };
  });

  const totalCount = departmentSummaries.reduce((sum, item) => sum + item.count, 0);
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const canonicalUrl = `${siteUrl}/annuaire-naturopathes`;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Naturopathe Île-de-France",
    url: canonicalUrl,
    about: "Trouver un naturopathe en Île-de-France",
    inLanguage: "fr-FR",
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: departmentSummaries.length,
      itemListElement: departmentSummaries.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.keyword,
        item:
          item.department.code === "75"
            ? `${siteUrl}/naturopathe-paris`
            : `${siteUrl}/carte?zone=${item.department.code}`
      }))
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Comment choisir un naturopathe dans ma zone ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Choisissez d’abord votre département, puis ouvrez quelques fiches pour comparer l’adresse, les coordonnées et la disponibilité d’un lien de prise de rendez-vous."
        }
      },
      {
        "@type": "Question",
        name: "Comment chercher à Paris ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Paris dispose d’une page dédiée avec une entrée par arrondissement, utile si vous savez déjà dans quel secteur vous cherchez."
        }
      },
      {
        "@type": "Question",
        name: "Dois-je passer par la carte ou par l’annuaire ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Utilisez l’annuaire pour choisir rapidement une zone, puis la carte pour affiner la recherche autour d’une adresse précise."
        }
      }
    ]
  };

  return (
    <article className="article-shell">
      <nav className="breadcrumb-nav" aria-label="Fil d’Ariane">
        <ol>
          <li>
            <Link href="/">Accueil</Link>
          </li>
          <li aria-hidden="true">›</li>
          <li aria-current="page">Annuaire naturopathes</li>
        </ol>
      </nav>

      <section className="page-hero page-hero--directory">
        <div className="page-hero-grid">
          <div className="page-hero-copy">
            <p className="page-eyebrow">Trouver près de chez vous</p>
            <h1>Trouver un naturopathe en Île-de-France</h1>
            <p className="page-lead">
              Choisissez votre département, ouvrez quelques fiches puis contactez le
              praticien qui vous convient. Pour Paris, vous pouvez aussi partir
              directement de l’arrondissement.
            </p>

            <div className="hero-actions">
              <Link className="btn" href="/carte">
                Rechercher autour d’une adresse
              </Link>
              <Link className="btn btn-secondary" href="/naturopathe-paris">
                Chercher à Paris
              </Link>
            </div>
          </div>

          <div className="hero-panel">
            <p className="hero-panel-label">Repères rapides</p>
            <div className="hero-metrics">
              <div className="hero-metric">
                <strong>{IDF_DEPARTMENTS.length}</strong>
                <span>départements couverts</span>
              </div>
              <div className="hero-metric">
                <strong>{totalCount}</strong>
                <span>fiches publiées</span>
              </div>
            </div>
            <p className="hero-note">
              La carte peut être ouverte avec une zone déjà présélectionnée, pour aller
              plus vite dès le premier clic.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Choisir votre zone</p>
            <h2>Commencez par le bon territoire</h2>
          </div>
          <p className="section-intro">
            Si vous cherchez d’abord par département, utilisez les raccourcis ci-dessous.
            Chaque carte mène vers une vue directement exploitable.
          </p>
        </div>

        <div className="zone-filter-links zone-filter-links--static">
          {departmentSummaries.map((item) => (
            <Link key={item.anchorId} href={`#${item.anchorId}`} className="zone-filter-link">
              {item.department.code === "75" ? "Paris" : item.department.name}
            </Link>
          ))}
        </div>

        <div className="department-grid">
          {departmentSummaries.map((item) => (
            <article
              key={item.department.code}
              id={item.anchorId}
              className="surface-card department-card"
            >
              <div>
                <p className="section-eyebrow">Département {item.department.code}</p>
                <h3>{item.keyword}</h3>
              </div>

              <div className="department-card-meta">
                <span className="directory-count">
                  {item.count} fiche{item.count > 1 ? "s" : ""}
                </span>
                {item.sampleCities.length > 0 ? (
                  <span className="department-card-cities">
                    {formatInlineList(item.sampleCities)}
                  </span>
                ) : null}
              </div>

              <p className="practitioner-item-meta">{item.description}</p>

              <div className="department-card-actions">
                <Link className="practitioner-item-link" href={item.primaryHref}>
                  {item.primaryLabel}
                </Link>
                {item.secondaryHref && item.secondaryLabel ? (
                  <Link className="practitioner-item-link" href={item.secondaryHref}>
                    {item.secondaryLabel}
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Comment faire</p>
            <h2>Trouver plus vite le bon praticien</h2>
          </div>
          <p className="section-intro">
            Le site est pensé pour aller à l’essentiel: choisir une zone, comparer
            quelques profils, puis contacter le praticien.
          </p>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <p className="feature-card-label">1. Zone</p>
            <h2>Choisissez votre département</h2>
            <p>
              Commencez par Paris, les Hauts-de-Seine, les Yvelines ou le territoire qui
              vous intéresse pour éviter de parcourir toute l’Île-de-France.
            </p>
          </article>

          <article className="feature-card">
            <p className="feature-card-label">2. Fiches</p>
            <h2>Ouvrez 2 ou 3 profils</h2>
            <p>
              Vérifiez l’adresse, les coordonnées et les informations disponibles sur
              chaque fiche avant de faire votre choix.
            </p>
          </article>

          <article className="feature-card">
            <p className="feature-card-label">3. Contact</p>
            <h2>Passez à l’action</h2>
            <p>
              Quand un lien de réservation est disponible, vous pouvez prendre rendez-vous
              directement depuis la fiche du praticien.
            </p>
          </article>
        </div>
      </section>

      <section aria-labelledby="faq-title" className="faq-section section-shell section-shell--compact">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Questions fréquentes</p>
            <h2 id="faq-title">Besoin d’un point de départ simple ?</h2>
          </div>
        </div>

        <details className="faq-item">
          <summary className="faq-question">Comment choisir un naturopathe dans ma zone ?</summary>
          <p className="faq-answer">
            Choisissez d’abord votre département, puis ouvrez quelques fiches pour comparer
            l’adresse, les coordonnées et les éventuelles options de prise de rendez-vous.
          </p>
        </details>

        <details className="faq-item">
          <summary className="faq-question">Comment chercher à Paris ?</summary>
          <p className="faq-answer">
            Utilisez la page <Link href="/naturopathe-paris">Naturopathe Paris</Link> si
            vous savez déjà dans quel arrondissement vous souhaitez chercher.
          </p>
        </details>

        <details className="faq-item">
          <summary className="faq-question">Dois-je passer par la carte ou par l’annuaire ?</summary>
          <p className="faq-answer">
            L’annuaire sert à choisir rapidement une zone. La <Link href="/carte">carte</Link>{" "}
            est ensuite la meilleure option pour affiner autour d’une adresse précise.
          </p>
        </details>
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
