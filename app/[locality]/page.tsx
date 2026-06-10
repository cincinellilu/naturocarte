import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PartnerBadge from "@/components/PartnerBadge";
import { fetchAllSupabaseRows } from "@/lib/fetch-all-supabase-rows";
import { getDepartmentAreaLabel, getDepartmentFromPostalCode, normalizeLocationToken } from "@/lib/locations";
import { getPartnerAccount, type PractitionerAccountPlanRow } from "@/lib/practitioner-partner";
import { PUBLIC_PRACTITIONER_STATUSES } from "@/lib/practitioner-status";
import { getSiteUrl } from "@/lib/site";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const revalidate = 300;

type PractitionerRow = {
  slug: string;
  first_name: string;
  last_name: string;
  city: string | null;
  postal_code: string | null;
  adresse: string | null;
  practitioner_accounts: PractitionerAccountPlanRow[] | PractitionerAccountPlanRow | null;
};

type RouteParams = {
  locality: string;
};

type SearchParams = {
  audience?: string | string[];
};

type CityPageData = {
  citySlug: string;
  cityName: string;
  practitioners: PractitionerRow[];
  departmentLabel: string | null;
  departmentHref: string | null;
};

function parseCitySlug(locality: string | null | undefined): string | null {
  const raw = locality?.trim().toLowerCase();
  if (!raw?.startsWith("naturopathe-")) return null;

  const citySlug = raw.replace(/^naturopathe-/, "");
  if (!citySlug || citySlug.length < 2) return null;
  if (!/^[a-z0-9-]+$/.test(citySlug)) return null;

  return citySlug;
}

function parseParisShortcut(citySlug: string): number | null {
  const match = citySlug.match(/^paris-(\d{1,2})$/);
  if (!match) return null;

  const arrondissement = Number.parseInt(match[1], 10);
  if (!Number.isInteger(arrondissement) || arrondissement < 1 || arrondissement > 20) return null;
  return arrondissement;
}

function getAudienceParam(value: string | string[] | undefined): "all" | "partners" {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "partenaires" ? "partners" : "all";
}

function getMostCommonCityName(practitioners: PractitionerRow[], citySlug: string): string {
  const counts = new Map<string, number>();

  for (const practitioner of practitioners) {
    const city = practitioner.city?.trim();
    if (!city || normalizeLocationToken(city) !== citySlug) continue;
    counts.set(city, (counts.get(city) ?? 0) + 1);
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr"))[0]?.[0] ?? citySlug;
}

async function loadCityPageData(citySlug: string, audience: "all" | "partners"): Promise<CityPageData | null> {
  const supabase = getSupabaseServerClient();
  const allPublicRows = await fetchAllSupabaseRows<PractitionerRow>((from, to) =>
    supabase
      .from("practitioners")
      .select(
        "slug, first_name, last_name, city, postal_code, adresse, practitioner_accounts(plan, stripe_subscription_status)"
      )
      .in("status", [...PUBLIC_PRACTITIONER_STATUSES])
      .not("city", "is", null)
      .order("last_name", { ascending: true })
      .range(from, to)
  );

  const cityRows = allPublicRows.filter(
    (practitioner) => normalizeLocationToken(practitioner.city) === citySlug
  );

  if (cityRows.length === 0) return null;

  const practitioners =
    audience === "partners"
      ? cityRows.filter((practitioner) => getPartnerAccount(practitioner.practitioner_accounts))
      : cityRows;

  const cityName = getMostCommonCityName(cityRows, citySlug);
  const department = getDepartmentFromPostalCode(cityRows.find((row) => row.postal_code)?.postal_code);

  return {
    citySlug,
    cityName,
    practitioners,
    departmentLabel: department ? getDepartmentAreaLabel(department) : null,
    departmentHref: department
      ? department.code === "75"
        ? "/naturopathe-paris"
        : `/annuaire-naturopathes/${department.code}`
      : null
  };
}

export async function generateStaticParams(): Promise<RouteParams[]> {
  try {
    const supabase = getSupabaseServerClient();
    const rows = await fetchAllSupabaseRows<{ city: string | null }>((from, to) =>
      supabase
        .from("practitioners")
        .select("city")
        .in("status", [...PUBLIC_PRACTITIONER_STATUSES])
        .not("city", "is", null)
        .range(from, to)
    );

    const slugs = new Set<string>();
    for (const row of rows) {
      const slug = normalizeLocationToken(row.city);
      if (slug && slug !== "paris") slugs.add(`naturopathe-${slug}`);
    }

    return [...slugs].sort().map((locality) => ({ locality }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const resolvedParams = await params;
  const citySlug = parseCitySlug(resolvedParams.locality);

  if (!citySlug || citySlug === "paris" || parseParisShortcut(citySlug)) {
    return {
      title: "Page introuvable",
      robots: { index: false, follow: false }
    };
  }

  const data = await loadCityPageData(citySlug, "all");
  if (!data) {
    return {
      title: "Page introuvable",
      robots: { index: false, follow: false }
    };
  }

  const title = `Naturopathe ${data.cityName} | Fiches praticiens`;
  const description = `Consultez les naturopathes référencés à ${data.cityName}, comparez les fiches et accédez rapidement aux informations de contact utiles.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/naturopathe-${citySlug}`
    },
    openGraph: {
      title: `${title} | NaturoCarte`,
      description,
      url: `/naturopathe-${citySlug}`,
      type: "website"
    },
    twitter: {
      card: "summary",
      title: `${title} | NaturoCarte`,
      description
    }
  };
}

export default async function CityNaturopathePage({
  params,
  searchParams
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const citySlug = parseCitySlug(resolvedParams.locality);

  if (!citySlug) notFound();
  if (citySlug === "paris") redirect("/naturopathe-paris");

  const parisShortcut = parseParisShortcut(citySlug);
  if (parisShortcut) redirect(`/naturopathe-paris/${parisShortcut}`);

  const audience = getAudienceParam(resolvedSearchParams.audience);
  const data = await loadCityPageData(citySlug, audience);
  if (!data) notFound();

  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const canonicalUrl = `${siteUrl}/naturopathe-${citySlug}`;
  const departmentText = data.departmentLabel ? ` ${data.departmentLabel}` : "";
  const practitioners = data.practitioners;
  const faqItems = [
    {
      question: `Comment trouver un naturopathe à ${data.cityName} ?`,
      answer:
        "Parcourez la liste locale, ouvrez plusieurs fiches et comparez les informations publiques avant de prendre contact."
    },
    {
      question: "Pourquoi ouvrir plusieurs fiches ?",
      answer:
        "Les informations disponibles varient selon les praticiens. Comparer plusieurs fiches aide à repérer l’adresse, les moyens de contact et les détails utiles."
    },
    {
      question: "Que faire si la ville ne suffit pas ?",
      answer:
        "Repartez du département ou de la carte pour élargir la recherche autour de votre zone."
    }
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Annuaire naturopathes", item: `${siteUrl}/annuaire-naturopathes` },
      { "@type": "ListItem", position: 3, name: `Naturopathe ${data.cityName}`, item: canonicalUrl }
    ]
  };
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Naturopathe ${data.cityName}`,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: practitioners.length,
    itemListElement: practitioners.slice(0, 80).map((practitioner, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${practitioner.first_name} ${practitioner.last_name}`,
      item: `${siteUrl}/naturopathe/${practitioner.slug}`
    }))
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer }
    }))
  };

  return (
    <article className="article-shell article-shell--directory">
      <section className="page-hero page-hero--directory">
        <div className="page-hero-background directory-hero-background" aria-hidden="true">
          <Image
            src="https://images.pexels.com/photos/6255629/pexels-photo-6255629.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260"
            alt=""
            fill
            sizes="100vw"
            priority
            className="home-hero-background-image directory-hero-background-image"
          />
          <div className="home-hero-background-scrim directory-hero-background-scrim" />
        </div>

        <div className="page-hero-grid directory-hero-grid">
          <nav className="breadcrumb-nav directory-hero-breadcrumb" aria-label="Fil d’Ariane">
            <ol>
              <li>
                <Link href="/">Accueil</Link>
              </li>
              <li aria-hidden="true">›</li>
              <li>
                <Link href="/annuaire-naturopathes">Annuaire naturopathes</Link>
              </li>
              <li aria-hidden="true">›</li>
              <li aria-current="page">{data.cityName}</li>
            </ol>
          </nav>

          <div className="page-hero-copy directory-hero-copy">
            <p className="page-eyebrow">{data.cityName} • recherche locale</p>
            <h1>Naturopathe {data.cityName}</h1>
            <p className="page-lead">
              Retrouvez les naturopathes publiés à {data.cityName}{departmentText}. Cette page
              permet d’ouvrir directement les fiches locales pour comparer les informations
              disponibles avant de prendre contact.
            </p>

            <div className="hero-actions">
              <a className="btn" href="#praticiens">
                Voir les praticiens
              </a>
              <Link className="btn btn-secondary" href="/carte">
                Rechercher sur la carte
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell" id="praticiens">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Liste locale</p>
            <h2>Praticiens référencés à {data.cityName} ({practitioners.length})</h2>
          </div>
          <p className="section-intro">
            Chaque lien mène vers une fiche praticien indexable, avec les informations publiques
            disponibles : adresse, contact, site web ou détails renseignés.
          </p>
        </div>

        <nav className="directory-audience-tabs directory-audience-tabs--compact" aria-label="Type de praticiens">
          <Link
            className={audience === "all" ? "directory-audience-tab is-active" : "directory-audience-tab"}
            href={`/naturopathe-${citySlug}`}
          >
            Tous les naturopathes
          </Link>
          <Link
            className={audience === "partners" ? "directory-audience-tab is-active" : "directory-audience-tab"}
            href={`/naturopathe-${citySlug}?audience=partenaires`}
          >
            Naturopathes partenaires
          </Link>
        </nav>

        {practitioners.length === 0 ? (
          <div className="empty-state-panel">
            <p>Aucun naturopathe partenaire n’est publié pour le moment dans cette ville.</p>
            <p>
              <Link className="btn btn-secondary" href={`/naturopathe-${citySlug}`}>
                Voir tous les naturopathes
              </Link>
            </p>
          </div>
        ) : (
          <ul className="practitioner-list">
            {practitioners.map((practitioner) => (
              <li key={practitioner.slug}>
                <div>
                  <strong>
                    {practitioner.first_name} {practitioner.last_name}
                  </strong>
                  {getPartnerAccount(practitioner.practitioner_accounts) ? (
                    <PartnerBadge className="partner-badge--inline" />
                  ) : null}
                  <div className="practitioner-item-meta">
                    {[practitioner.adresse, practitioner.postal_code, practitioner.city]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                </div>
                <Link className="practitioner-item-link" href={`/naturopathe/${practitioner.slug}`}>
                  Voir la fiche
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section-shell">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Élargir la recherche</p>
            <h2>Continuer depuis une zone plus large</h2>
          </div>
          <p className="section-intro">
            Si les résultats de {data.cityName} ne suffisent pas, repartez du département,
            de l’annuaire ou de la carte pour comparer les villes proches.
          </p>
        </div>
        <div className="hero-actions">
          {data.departmentHref ? (
            <Link className="btn" href={data.departmentHref}>
              Voir la zone départementale
            </Link>
          ) : null}
          <Link className="btn btn-secondary" href="/annuaire-naturopathes">
            Retour à l’annuaire
          </Link>
        </div>
      </section>

      <section aria-labelledby="faq-title" className="faq-section section-shell section-shell--compact">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Questions fréquentes</p>
            <h2 id="faq-title">Comprendre la recherche locale</h2>
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </article>
  );
}
