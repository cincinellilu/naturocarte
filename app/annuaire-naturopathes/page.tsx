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
  title: "Annuaire naturopathes en Île-de-France",
  description:
    "Trouvez un naturopathe à Paris, en Seine-et-Marne, dans les Yvelines, l’Essonne, les Hauts-de-Seine, la Seine-Saint-Denis, le Val-de-Marne ou le Val-d’Oise.",
  alternates: {
    canonical: "/annuaire-naturopathes"
  },
  openGraph: {
    title: "Annuaire naturopathes en Île-de-France | NaturoCarte",
    description:
      "Annuaire éditorial des naturopathes en Île-de-France, avec entrée par département, carte interactive et page dédiée à Paris.",
    url: "/annuaire-naturopathes",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Annuaire naturopathes en Île-de-France | NaturoCarte",
    description:
      "Annuaire éditorial des naturopathes en Île-de-France, avec entrée par département, carte interactive et page dédiée à Paris."
  }
};

type PractitionerRow = {
  city: string | null;
  postal_code: string | null;
};

type DepartmentSummary = {
  department: DepartmentInfo;
  anchorId: string;
  keyword: string;
  count: number;
  description: string;
  ctaHref: string;
  ctaLabel: string;
};

type DepartmentBucket = {
  count: number;
  cityCounts: Map<string, number>;
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
      return "Page dédiée à Paris, avec navigation par arrondissement et accès direct à la carte.";
    }

    return `${count} fiches publiées actuellement, avec une navigation dédiée, arrondissement par arrondissement.`;
  }

  if (count === 0) {
    return "Département en cours d’enrichissement, à explorer depuis la carte et les nouvelles fiches locales.";
  }

  if (sampleCities.length === 0) {
    return `${count} fiches publiées actuellement dans ce département, accessibles depuis la carte et les profils détaillés.`;
  }

  return `${count} fiches publiées actuellement, notamment autour de ${formatInlineList(sampleCities)}.`;
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
      ctaHref: department.code === "75" ? "/naturopathe-paris" : "/carte",
      ctaLabel:
        department.code === "75" ? "Voir Paris par arrondissement" : "Voir sur la carte"
    };
  });

  const totalCount = departmentSummaries.reduce((sum, item) => sum + item.count, 0);
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const canonicalUrl = `${siteUrl}/annuaire-naturopathes`;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Annuaire naturopathes en Île-de-France",
    url: canonicalUrl,
    about: "Annuaire éditorial des naturopathes en Île-de-France",
    inLanguage: "fr-FR",
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: departmentSummaries.length,
      itemListElement: departmentSummaries.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.keyword,
        item: `${canonicalUrl}#${item.anchorId}`
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
            <p className="page-eyebrow">Île-de-France • annuaire éditorial</p>
            <h1>Trouver un naturopathe en Île-de-France</h1>
            <p className="page-lead">
              L’annuaire s’organise désormais par département pour mieux refléter la base
              francilienne, tout en gardant des pages courtes et une navigation utile.
            </p>

            <div className="hero-actions">
              <Link className="btn" href="/carte">
                Voir la carte des naturopathes
              </Link>
              <Link className="btn btn-secondary" href="/naturopathe-paris">
                Ouvrir la page Paris
              </Link>
            </div>
          </div>

          <div className="hero-panel">
            <p className="hero-panel-label">Couverture actuelle</p>
            <div className="hero-metrics">
              <div className="hero-metric">
                <strong>{IDF_DEPARTMENTS.length}</strong>
                <span>départements</span>
              </div>
              <div className="hero-metric">
                <strong>{totalCount}</strong>
                <span>fiches publiées</span>
              </div>
            </div>
            <p className="hero-note">
              Paris conserve une entrée dédiée par arrondissement. Les autres territoires
              s’explorent depuis la carte et les fiches locales.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Structure SEO</p>
            <h2>Une page annuaire plus utile, sans listes à rallonge</h2>
          </div>
          <p className="section-intro">
            Le contenu met en avant les territoires réellement couverts, les volumes de
            fiches et les accès clés, plutôt qu’une succession de noms difficile à lire.
          </p>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <p className="feature-card-label">Recherche locale</p>
            <h2>Entrée par département</h2>
            <p>
              Les expressions comme <strong>Naturopathe Paris</strong>,{" "}
              <strong>Naturopathe Hauts-de-Seine</strong> ou{" "}
              <strong>Naturopathe Seine-Saint-Denis</strong> sont désormais visibles
              directement dans la page.
            </p>
          </article>

          <article className="feature-card">
            <p className="feature-card-label">Navigation claire</p>
            <h2>Carte et fiches détaillées</h2>
            <p>
              L’annuaire sert de hub éditorial. La carte reste le point d’entrée pour une
              recherche très précise autour d’une adresse ou d’une commune.
            </p>
          </article>

          <article className="feature-card">
            <p className="feature-card-label">Cas particulier</p>
            <h2>Paris reste séparé</h2>
            <p>
              La capitale conserve sa page dédiée afin de garder une navigation fine par
              arrondissement, sans alourdir le reste de l’annuaire.
            </p>
          </article>
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Départements couverts</p>
            <h2>Naturopathe, département par département</h2>
          </div>
          <p className="section-intro">
            Chaque bloc résume un territoire avec un intitulé SEO local, un volume de
            fiches et un lien de navigation court.
          </p>
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
                {item.department.code === "75" ? (
                  <span className="practitioner-item-meta">navigation par arrondissement</span>
                ) : null}
              </div>

              <p className="practitioner-item-meta">{item.description}</p>

              <div className="department-card-actions">
                <Link className="practitioner-item-link" href={item.ctaHref}>
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
            <p className="section-eyebrow">Prochaine étape</p>
            <h2>Utiliser la bonne porte d’entrée</h2>
          </div>
          <p className="section-intro">
            Pour comparer rapidement plusieurs profils autour d’une adresse, la carte est
            la meilleure option. Pour Paris intra-muros, la page dédiée reste la plus
            directe.
          </p>
        </div>

        <div className="hero-actions">
          <Link className="btn" href="/carte">
            Accéder à la carte
          </Link>
          <Link className="btn btn-secondary" href="/praticiens">
            Mettre à jour une fiche
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
