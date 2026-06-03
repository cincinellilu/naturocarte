import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PartnerBadge from "@/components/PartnerBadge";
import { fetchAllSupabaseRows } from "@/lib/fetch-all-supabase-rows";
import { IDF_DEPARTMENTS, getDepartmentAreaLabel, getDepartmentByCode } from "@/lib/locations";
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
  departement: string;
};

type SearchParams = {
  audience?: string | string[];
};

export function generateStaticParams() {
  return IDF_DEPARTMENTS.filter((department) => department.code !== "75").map((department) => ({
    departement: department.code
  }));
}

function normalizeDepartmentCode(value: string | null | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  if (!/^\d{2}$/.test(raw)) return null;
  return raw;
}

function getAudienceParam(value: string | string[] | undefined): "all" | "partners" {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "partenaires" ? "partners" : "all";
}

function withAudience(href: string, audience: "all" | "partners"): string {
  return audience === "partners" ? `${href}?audience=partenaires` : href;
}

async function getDepartmentPractitioners(
  departmentCode: string,
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
        .like("postal_code", `${departmentCode}%`)
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

export async function generateMetadata({
  params
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const departmentCode = normalizeDepartmentCode(resolvedParams.departement);

  if (!departmentCode || departmentCode === "75") {
    return {
      title: "Page introuvable",
      robots: { index: false, follow: false }
    };
  }

  const department = getDepartmentByCode(departmentCode);
  if (!department) {
    return {
      title: "Page introuvable",
      robots: { index: false, follow: false }
    };
  }

  const areaLabel = getDepartmentAreaLabel(department);
  const title = `Naturopathe ${department.name} | Liste des praticiens`;
  const description = `Consultez la liste des naturopathes publiés ${areaLabel} et ouvrez leurs fiches pour comparer les coordonnées et les informations utiles.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/annuaire-naturopathes/${departmentCode}`
    },
    openGraph: {
      title: `${title} | NaturoCarte`,
      description,
      url: `/annuaire-naturopathes/${departmentCode}`,
      type: "website"
    },
    twitter: {
      card: "summary",
      title: `${title} | NaturoCarte`,
      description
    }
  };
}

export default async function DepartmentAnnuairePage({
  params,
  searchParams
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const audience = getAudienceParam(resolvedSearchParams.audience);
  const departmentCode = normalizeDepartmentCode(resolvedParams.departement);

  if (!departmentCode) notFound();
  if (departmentCode === "75") redirect(withAudience("/naturopathe-paris", audience));

  const department = getDepartmentByCode(departmentCode);
  if (!department) notFound();

  const practitioners = await getDepartmentPractitioners(departmentCode, audience);
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const canonicalUrl = `${siteUrl}/annuaire-naturopathes/${departmentCode}`;
  const areaLabel = getDepartmentAreaLabel(department);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Naturopathe ${department.name}`,
    url: canonicalUrl,
    about: `Liste des naturopathes publiés ${areaLabel}`,
    inLanguage: "fr-FR",
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: practitioners.length,
      itemListElement: practitioners.slice(0, 80).map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `${item.first_name} ${item.last_name}`,
        item: `${siteUrl}/naturopathe/${item.slug}`
      }))
    }
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
              <li aria-current="page">{department.name}</li>
            </ol>
          </nav>

          <div className="page-hero-copy directory-hero-copy">
            <p className="page-eyebrow">{department.name} • annuaire local</p>
            <h1>Naturopathe {department.name}</h1>
            <p className="page-lead">
              Parcourez les naturopathes publiés {areaLabel}, puis ouvrez leurs
              fiches pour comparer l’adresse, le contact et les informations utiles.
            </p>

            <div className="hero-actions">
              <a className="btn" href="#praticiens">
                Voir la liste
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell" id="praticiens">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Praticiens publiés</p>
            <h2>Liste des naturopathes référencés</h2>
          </div>
          <p className="section-intro">
            Ouvrez plusieurs fiches du même département pour comparer les informations
            visibles avant de faire votre choix.
          </p>
        </div>

        <nav className="directory-audience-tabs directory-audience-tabs--compact" aria-label="Type de praticiens">
          <Link
            className={audience === "all" ? "directory-audience-tab is-active" : "directory-audience-tab"}
            href={`/annuaire-naturopathes/${department.code}`}
          >
            Tous les naturopathes
          </Link>
          <Link
            className={
              audience === "partners" ? "directory-audience-tab is-active" : "directory-audience-tab"
            }
            href={`/annuaire-naturopathes/${department.code}?audience=partenaires`}
          >
            Naturopathes partenaires
          </Link>
        </nav>

        {practitioners.length === 0 ? (
          <div className="empty-state-panel">
            <p>
              {audience === "partners"
                ? "Aucun naturopathe partenaire n’est publié pour le moment dans ce département."
                : "Aucun naturopathe n’est publié pour le moment dans ce département."}
            </p>
            <p>
              <Link className="btn btn-secondary" href="/annuaire-naturopathes">
                Revenir à l’annuaire
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

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
    </article>
  );
}
