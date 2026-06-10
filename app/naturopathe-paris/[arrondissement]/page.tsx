import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import PartnerBadge from "@/components/PartnerBadge";
import PractitionerEntryLink from "@/components/PractitionerEntryLink";
import { fetchAllSupabaseRows } from "@/lib/fetch-all-supabase-rows";
import {
  formatParisPostalCode,
  PARIS_ARRONDISSEMENTS,
  parseParisArrondissement,
  toParisArrondissementLabel
} from "@/lib/paris";
import { PUBLIC_PRACTITIONER_STATUSES } from "@/lib/practitioner-status";
import { getPartnerAccount, type PractitionerAccountPlanRow } from "@/lib/practitioner-partner";
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
  arrondissement: string;
};

type SearchParams = {
  audience?: string | string[];
};

export function generateStaticParams() {
  return PARIS_ARRONDISSEMENTS.map((arrondissement) => ({
    arrondissement: String(arrondissement)
  }));
}

async function getArrondissementPractitioners(
  arrondissement: number,
  audience: "all" | "partners"
): Promise<PractitionerRow[]> {
  try {
    const supabase = getSupabaseServerClient();
    const rows = await fetchAllSupabaseRows<PractitionerRow>((from, to) =>
      supabase
        .from("practitioners")
        .select(
          "slug, first_name, last_name, city, postal_code, adresse, practitioner_accounts(plan, stripe_subscription_status)"
        )
        .in("status", [...PUBLIC_PRACTITIONER_STATUSES])
        .eq("postal_code", formatParisPostalCode(arrondissement))
        .order("last_name", { ascending: true })
        .range(from, to)
    );

    return audience === "partners"
      ? rows.filter((practitioner) => getPartnerAccount(practitioner.practitioner_accounts))
      : rows;
  } catch {
    return [];
  }
}

function getAudienceParam(value: string | string[] | undefined): "all" | "partners" {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "partenaires" ? "partners" : "all";
}

export async function generateMetadata({
  params
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const arrondissement = parseParisArrondissement(resolvedParams.arrondissement);

  if (!arrondissement) {
    return {
      title: "Page introuvable",
      robots: { index: false, follow: false }
    };
  }

  const title = `Naturopathe Paris ${arrondissement} | Annuaire`;
  const description = `Consultez l’annuaire des naturopathes à Paris ${arrondissement} (${toParisArrondissementLabel(
    arrondissement
  )}) avec adresses et fiches détaillées.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/naturopathe-paris/${arrondissement}`
    },
    openGraph: {
      title: `${title} | NaturoCarte`,
      description,
      url: `/naturopathe-paris/${arrondissement}`,
      type: "website"
    },
    twitter: {
      card: "summary",
      title: `${title} | NaturoCarte`,
      description
    }
  };
}

export default async function NaturopatheParisArrondissementPage({
  params,
  searchParams
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const audience = getAudienceParam(resolvedSearchParams.audience);
  const arrondissement = parseParisArrondissement(resolvedParams.arrondissement);
  if (!arrondissement) notFound();

  const practitioners = await getArrondissementPractitioners(arrondissement, audience);
  const postalCode = formatParisPostalCode(arrondissement);

  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const canonicalUrl = `${siteUrl}/naturopathe-paris/${arrondissement}`;
  const arrondissementLabel = toParisArrondissementLabel(arrondissement);
  const quickGuide = [
    {
      title: "1. Vérifier le secteur",
      text: `Cette page cible le ${arrondissementLabel} (${postalCode}) pour vous faire gagner du temps sur la recherche locale.`
    },
    {
      title: "2. Ouvrir plusieurs fiches",
      text: "Ouvrez plusieurs praticiens du même secteur afin de comparer les coordonnées et la présentation avant de choisir."
    },
    {
      title: "3. Revenir à la vue Paris",
      text: "Si le secteur ne suffit pas, retournez à la page Paris ou à la carte pour élargir la recherche."
    }
  ];
  const faqItems = [
    {
      question: `Pourquoi une page dédiée au Paris ${arrondissement} ?`,
      answer:
        "Une page par arrondissement permet de comparer plus vite les praticiens d’un même secteur sans mélanger les résultats de tout Paris."
    },
    {
      question: "Que faire si je n’ai pas assez de résultats ?",
      answer:
        "Repartez de la page Paris ou de la carte pour élargir la zone et trouver d’autres fiches pertinentes."
    },
    {
      question: "Les fiches contiennent-elles toutes les mêmes informations ?",
      answer:
        "Non. Chaque fiche affiche les informations publiques disponibles sur le praticien, ce qui permet de comparer plusieurs profils plus proprement."
    }
  ];

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
        name: "Naturopathe Paris",
        item: `${siteUrl}/naturopathe-paris`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Naturopathe Paris ${arrondissement}`,
        item: canonicalUrl
      }
    ]
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Naturopathe Paris ${arrondissement}`,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: practitioners.length,
    itemListElement: practitioners.slice(0, 80).map((p, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${p.first_name} ${p.last_name}`,
      item: `${siteUrl}/naturopathe/${p.slug}`
    }))
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
          <li>
            <Link href="/naturopathe-paris">Naturopathe Paris</Link>
          </li>
          <li aria-hidden="true">›</li>
          <li aria-current="page">Paris {arrondissement}</li>
        </ol>
      </nav>

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

        <div className="page-hero-grid">
          <div className="page-hero-copy">
            <p className="page-eyebrow">Paris {arrondissement} • annuaire local</p>
            <h1>Naturopathe Paris {arrondissement}</h1>
            <p className="page-lead">
              Annuaire des naturopathes du {arrondissementLabel} ({postalCode}). Cette page
              sert à comparer rapidement les praticiens du secteur, puis à ouvrir leurs
              fiches détaillées si vous voulez aller plus loin.
            </p>

            <div className="hero-actions">
              <Link className="btn" href="/carte">
                Voir la carte des naturopathes
              </Link>
              <Link className="btn btn-secondary" href="/naturopathe-paris">
                Voir tous les arrondissements
              </Link>
            </div>
          </div>

          <div className="hero-panel">
            <p className="hero-panel-label">Dans ce secteur</p>
            <div className="hero-metrics">
              <div className="hero-metric">
                <strong>{practitioners.length}</strong>
                <span>fiches publiées</span>
              </div>
              <div className="hero-metric">
                <strong>{postalCode}</strong>
                <span>code postal</span>
              </div>
            </div>
            <p className="hero-note">
              Les fiches restent accessibles individuellement pour consulter les coordonnées,
              les informations de contact et les éléments publics utiles à la comparaison.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Liste locale</p>
            <h2>Praticiens référencés ({practitioners.length})</h2>
          </div>
        </div>
        <nav className="directory-audience-tabs directory-audience-tabs--compact" aria-label="Type de praticiens">
          <Link
            className={audience === "all" ? "directory-audience-tab is-active" : "directory-audience-tab"}
            href={`/naturopathe-paris/${arrondissement}`}
          >
            Tous les naturopathes
          </Link>
          <Link
            className={
              audience === "partners" ? "directory-audience-tab is-active" : "directory-audience-tab"
            }
            href={`/naturopathe-paris/${arrondissement}?audience=partenaires`}
          >
            Naturopathes partenaires
          </Link>
        </nav>
        {practitioners.length === 0 ? (
          <p>
            {audience === "partners"
              ? "Aucun naturopathe partenaire n’est encore référencé pour ce secteur."
              : "Aucun naturopathe n’est encore référencé pour ce secteur."}
          </p>
        ) : (
          <ul className="practitioner-list">
            {practitioners.map((p) => (
              <li key={p.slug}>
                <div>
                  <strong>
                    {p.first_name} {p.last_name}
                  </strong>
                  {getPartnerAccount(p.practitioner_accounts) ? (
                    <PartnerBadge className="partner-badge--inline" />
                  ) : null}
                  <div className="practitioner-item-meta">
                    {[p.adresse, p.postal_code, p.city].filter(Boolean).join(", ")}
                  </div>
                </div>
                <PractitionerEntryLink
                  className="practitioner-item-link"
                  href={`/naturopathe/${p.slug}`}
                  practitionerSlug={p.slug}
                  source="paris_arrondissement"
                >
                  Voir la fiche
                </PractitionerEntryLink>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section-shell">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Mode d’emploi</p>
            <h2>Comparer les praticiens du secteur</h2>
          </div>
          <p className="section-intro">
            Cette page concentre les résultats du secteur pour aller plus vite. L’objectif
            n’est pas seulement de lister des noms, mais de faciliter la comparaison avant
            d’ouvrir une fiche.
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

      <section aria-labelledby="faq-title" className="faq-section section-shell section-shell--compact">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Questions fréquentes</p>
            <h2 id="faq-title">Comprendre ce secteur</h2>
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
