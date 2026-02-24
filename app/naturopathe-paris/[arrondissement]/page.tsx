import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatParisPostalCode,
  PARIS_ARRONDISSEMENTS,
  parseParisArrondissement,
  toParisArrondissementLabel
} from "@/lib/paris";
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
};

type RouteParams = {
  arrondissement: string;
};

export function generateStaticParams() {
  return PARIS_ARRONDISSEMENTS.map((arrondissement) => ({
    arrondissement: String(arrondissement)
  }));
}

async function getArrondissementPractitioners(
  arrondissement: number
): Promise<PractitionerRow[]> {
  try {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      .from("practitioners")
      .select("slug, first_name, last_name, city, postal_code, adresse")
      .eq("status", "published")
      .eq("postal_code", formatParisPostalCode(arrondissement))
      .order("last_name", { ascending: true });

    return (data ?? []) as PractitionerRow[];
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
  params
}: {
  params: Promise<RouteParams>;
}) {
  const resolvedParams = await params;
  const arrondissement = parseParisArrondissement(resolvedParams.arrondissement);
  if (!arrondissement) notFound();

  const practitioners = await getArrondissementPractitioners(arrondissement);
  const postalCode = formatParisPostalCode(arrondissement);

  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const canonicalUrl = `${siteUrl}/naturopathe-paris/${arrondissement}`;

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

  return (
    <article>
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

      <h1>Naturopathe Paris {arrondissement}</h1>
      <p>
        Annuaire des naturopathes du {toParisArrondissementLabel(arrondissement)} ({postalCode}).
        Retrouvez les praticiens de ce secteur et accédez à leurs fiches détaillées.
      </p>

      <p>
        <Link className="btn" href="/carte">
          Voir la carte des naturopathes
        </Link>
      </p>

      <p>
        <Link className="btn btn-secondary" href="/naturopathe-paris">
          Voir tous les arrondissements
        </Link>
      </p>

      <section>
        <h2>Praticiens référencés ({practitioners.length})</h2>
        {practitioners.length === 0 ? (
          <p>Aucun naturopathe n’est encore référencé pour ce secteur.</p>
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
    </article>
  );
}
