import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import DirectorySearchBar from "@/components/DirectorySearchBar";
import {
  type DepartmentInfo,
  IDF_DEPARTMENTS,
  getDepartmentFromPostalCode
} from "@/lib/locations";
import { fetchAllSupabaseRows } from "@/lib/fetch-all-supabase-rows";
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
  slug: string;
  first_name: string;
  last_name: string;
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
    practitioners = await fetchAllSupabaseRows<PractitionerRow>((from, to) =>
      supabase
        .from("practitioners")
        .select("slug, first_name, last_name, city, postal_code")
        .in("status", [...PUBLIC_PRACTITIONER_STATUSES])
        .range(from, to)
    );
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
      href: department.code === "75" ? "/naturopathe-paris" : `/annuaire-naturopathes/${department.code}`,
      ctaLabel: "Voir les praticiens"
    };
  });

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
              <li aria-current="page">Annuaire naturopathes</li>
            </ol>
          </nav>

          <div className="page-hero-copy directory-hero-copy">
            <p className="page-eyebrow">Annuaire naturopathes</p>
            <h1>Choisissez votre zone de recherche</h1>
            <p className="page-lead">
              Paris, un département d’Île-de-France ou la carte, puis ouvrez directement les
              praticiens publiés dans la zone qui vous intéresse.
            </p>

            <div className="hero-actions">
              <Link className="btn" href="#departements">
                Rechercher par département
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell directory-search-section">
        <div className="directory-search-panel">
          <h2>Rechercher un naturopathe</h2>
          <p className="directory-search-intro">
            Saisissez le nom d’un praticien pour ouvrir directement sa fiche et retrouver ses
            informations utiles en quelques secondes.
          </p>
          <DirectorySearchBar practitioners={practitioners} compact />
        </div>
      </section>

      <section className="section-shell directory-path-section">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Comment trouver un naturopathe</p>
            <h2>Trois étapes simples depuis l’annuaire</h2>
          </div>
          <p className="section-intro">
            Commencez par une zone, ouvrez la liste correspondante, puis consultez les fiches
            qui vous semblent les plus utiles.
          </p>
        </div>

        <div className="directory-path-grid">
          <article className="surface-card directory-path-card">
            <p className="directory-path-index">1</p>
            <h3>Choisissez une zone</h3>
            <p>
              Sélectionnez Paris ou un département pour accéder directement à la bonne liste de
              praticiens.
            </p>
          </article>

          <article className="surface-card directory-path-card">
            <p className="directory-path-index">2</p>
            <h3>Ouvrez la liste des praticiens</h3>
            <p>
              Parcourez les naturopathes publiés dans la zone choisie et repérez ceux qui vous
              intéressent.
            </p>
          </article>

          <article className="surface-card directory-path-card">
            <p className="directory-path-index">3</p>
            <h3>Comparez les fiches</h3>
            <p>
              Consultez le contact, l’adresse, le site web et les informations utiles avant de
              choisir.
            </p>
          </article>
        </div>
      </section>

      <section className="section-shell directory-departments-section" id="departements">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Départements</p>
            <h2>Choisissez une zone en un clic</h2>
          </div>
          <p className="section-intro">
            Chaque carte ouvre directement les praticiens publiés dans la zone choisie.
          </p>
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

      <section className="section-shell section-shell--compact directory-map-cta">
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
