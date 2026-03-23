import type { Metadata } from "next";
import Link from "next/link";
import {
  type DepartmentInfo,
  IDF_DEPARTMENTS,
  getDepartmentFromPostalCode
} from "@/lib/locations";
import { PUBLIC_PRACTITIONER_STATUSES } from "@/lib/practitioner-status";
import { getSiteUrl } from "@/lib/site";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Naturopathe Île-de-France | Choisir une zone",
  description:
    "Trouvez un naturopathe en Île-de-France en partant de Paris ou d’un département: Hauts-de-Seine, Yvelines, Seine-Saint-Denis, Val-de-Marne, Essonne, Seine-et-Marne et Val-d’Oise.",
  alternates: {
    canonical: "/annuaire-naturopathes"
  },
  openGraph: {
    title: "Naturopathe Île-de-France | Choisir une zone | NaturoCarte",
    description:
      "Choisissez simplement votre zone puis ouvrez les praticiens publiés à Paris ou dans votre département d’Île-de-France.",
    url: "/annuaire-naturopathes",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Naturopathe Île-de-France | Choisir une zone | NaturoCarte",
    description:
      "Choisissez simplement votre zone puis ouvrez les praticiens publiés à Paris ou dans votre département d’Île-de-France."
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
  keyword: string;
  count: number;
  description: string;
  href: string;
  ctaLabel: string;
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
    return count > 0
      ? `${count} praticiens publiés à Paris.`
      : "Parcourez Paris par arrondissement.";
  }

  if (count === 0) {
    return `Recherche disponible dans ${department.name}.`;
  }

  if (sampleCities.length === 0) {
    return `${count} praticiens publiés dans ${department.name}.`;
  }

  return `${count} praticiens publiés, notamment à ${formatInlineList(sampleCities)}.`;
}

export default async function AnnuaireNaturopathesPage() {
  let practitioners: PractitionerRow[] = [];

  try {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      .from("practitioners")
      .select("city, postal_code")
      .in("status", [...PUBLIC_PRACTITIONER_STATUSES]);

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
      keyword: buildDepartmentKeyword(department),
      count: bucket.count,
      description: buildDepartmentDescription(department, bucket.count, sampleCities),
      href: department.code === "75" ? "/naturopathe-paris" : `/carte?zone=${department.code}`,
      ctaLabel: department.code === "75" ? "Voir Paris" : "Voir les praticiens"
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
        item: item.department.code === "75" ? `${siteUrl}/naturopathe-paris` : `${siteUrl}${item.href}`
      }))
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
          <li aria-current="page">Annuaire naturopathes</li>
        </ol>
      </nav>

      <section className="page-hero page-hero--directory">
        <div className="page-hero-grid">
          <div className="page-hero-copy">
            <p className="page-eyebrow">Annuaire naturopathes</p>
            <h1>Choisissez simplement votre zone</h1>
            <p className="page-lead">
              Paris ou un département d’Île-de-France, puis ouvrez les praticiens publiés
              dans la zone qui vous intéresse.
            </p>

            <div className="hero-actions">
              <Link className="btn" href="/carte">
                Rechercher autour d’une adresse
              </Link>
            </div>
          </div>

          <div className="hero-panel">
            <p className="hero-panel-label">En ce moment</p>
            <div className="hero-metrics">
              <div className="hero-metric">
                <strong>{IDF_DEPARTMENTS.length}</strong>
                <span>zones</span>
              </div>
              <div className="hero-metric">
                <strong>{totalCount}</strong>
                <span>fiches publiées</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Zones disponibles</p>
            <h2>Ouvrir les praticiens par zone</h2>
          </div>
        </div>

        <div className="department-grid">
          {departmentSummaries.map((item) => (
            <article key={item.department.code} className="surface-card department-card">
              <div>
                <p className="section-eyebrow">Département {item.department.code}</p>
                <h3>{item.keyword}</h3>
              </div>

              <div className="department-card-meta">
                <span className="directory-count">
                  {item.count} fiche{item.count > 1 ? "s" : ""}
                </span>
              </div>

              <p className="practitioner-item-meta">{item.description}</p>

              <div className="department-card-actions">
                <Link className="practitioner-item-link" href={item.href}>
                  {item.ctaLabel}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell section-shell--compact">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Recherche précise</p>
            <h2>Vous avez déjà une adresse ?</h2>
          </div>
          <p className="section-intro">
            Utilisez directement la carte pour classer les praticiens autour d’une rue,
            d’un quartier ou d’une commune.
          </p>
        </div>

        <div className="hero-actions">
          <Link className="btn" href="/carte">
            Ouvrir la carte
          </Link>
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
