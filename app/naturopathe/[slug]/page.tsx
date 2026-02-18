import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 300;

type Practitioner = {
  slug: string;
  first_name: string;
  last_name: string;
  adresse: string | null;
  postal_code: string | null;
  city: string | null;
  lat: number;
  lng: number;
  phone: string | null;
  email: string | null;
  website: string | null;
  booking_url: string | null;
  description: string | null;
  status: string;
};

async function getPublishedPractitioner(slug: string): Promise<Practitioner | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("practitioners")
    .select(
      "slug, first_name, last_name, adresse, postal_code, city, lat, lng, phone, email, website, booking_url, description, status"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;
  return data as Practitioner;
}

function isValidExternalUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  const v = value.trim();
  return v.startsWith("http://") || v.startsWith("https://");
}

function normalizeWebsiteUrl(value: string | null | undefined): string | null {
  const raw = (value ?? "").trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `https://${raw}`;
}

function getParisArrondissement(postalCode: string | null | undefined): string | null {
  const raw = (postalCode ?? "").trim();
  const match = raw.match(/^75(0[1-9]|1[0-9]|20)$/);
  if (!match) return null;

  const arrondissement = Number.parseInt(match[1], 10);
  return String(arrondissement);
}

function buildTitle(practitioner: Practitioner): string {
  const arrondissement = getParisArrondissement(practitioner.postal_code);

  if (arrondissement) {
    return `${practitioner.first_name} ${practitioner.last_name} - Naturopathe à Paris ${arrondissement}`;
  }

  const city = practitioner.city ?? "Paris";
  return `${practitioner.first_name} ${practitioner.last_name} - Naturopathe à ${city}`;
}

function getAbsoluteSiteUrl(): string {
  return getSiteUrl().replace(/\/$/, "");
}

function buildStaticMapUrl(lat: number, lng: number, accessToken: string): string {
  const marker = encodeURIComponent(`pin-s+16a34a(${lng},${lat})`);
  return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${marker}/${lng},${lat},13.5/720x360?access_token=${encodeURIComponent(
    accessToken
  )}&logo=false&attribution=false`;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const practitioner = await getPublishedPractitioner(decodeURIComponent(slug));

  if (!practitioner) {
    return {
      title: "Praticien introuvable",
      robots: { index: false, follow: false }
    };
  }

  const city = practitioner.city || "Paris";
  const title = buildTitle(practitioner);
  const metadataAddress = [
    practitioner.adresse?.trim(),
    practitioner.postal_code?.trim(),
    city
  ]
    .filter(Boolean)
    .join(", ");
  const description = `Découvrez la fiche de ${practitioner.first_name} ${practitioner.last_name}, naturopathe à ${city}${metadataAddress ? ` (${metadataAddress})` : ""} : adresse, contact et prise de rendez-vous.`;

  const siteUrl = getAbsoluteSiteUrl();
  const canonical = `${siteUrl}/naturopathe/${practitioner.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article"
    },
    twitter: {
      card: "summary",
      title,
      description
    }
  };
}

export default async function PractitionerPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const practitioner = await getPublishedPractitioner(decodeURIComponent(slug));
  if (!practitioner) notFound();

  const city = practitioner.city || "Paris";
  const title = buildTitle(practitioner);

  const bookingUrl = isValidExternalUrl(practitioner.booking_url)
    ? practitioner.booking_url.trim()
    : null;

  const websiteUrl = normalizeWebsiteUrl(practitioner.website);

  const addressLine = [practitioner.adresse?.trim(), practitioner.postal_code?.trim(), city]
    .filter(Boolean)
    .join(", ");

  const siteUrl = getAbsoluteSiteUrl();
  const canonicalUrl = `${siteUrl}/naturopathe/${practitioner.slug}`;
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const staticMapUrl =
    mapboxToken && Number.isFinite(practitioner.lat) && Number.isFinite(practitioner.lng)
      ? buildStaticMapUrl(practitioner.lat, practitioner.lng, mapboxToken)
      : null;

  const hasContact = Boolean(practitioner.phone || practitioner.email || websiteUrl);
  const practitionerDescription = practitioner.description?.trim() || undefined;

  const sameAs = [bookingUrl, websiteUrl].filter((v): v is string => Boolean(v));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${canonicalUrl}#localbusiness`,
    name: `${practitioner.first_name} ${practitioner.last_name}`,
    description: practitionerDescription,
    url: canonicalUrl,
    image: staticMapUrl || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: practitioner.adresse || undefined,
      postalCode: practitioner.postal_code || undefined,
      addressLocality: city,
      addressCountry: "FR"
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: city
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: practitioner.lat,
      longitude: practitioner.lng
    },
    knowsLanguage: "fr",
    telephone: practitioner.phone || undefined,
    email: practitioner.email || undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined
  };

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
        name: "Carte",
        item: `${siteUrl}/carte`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${practitioner.first_name} ${practitioner.last_name}`,
        item: canonicalUrl
      }
    ]
  };

  return (
    <article className="practitioner-page">
      <p className="breadcrumbs">
        <Link href="/carte">← Retour à la carte</Link>
      </p>

      <nav className="breadcrumb-nav" aria-label="Fil d’Ariane">
        <ol>
          <li>
            <Link href="/">Accueil</Link>
          </li>
          <li aria-hidden="true">›</li>
          <li>
            <Link href="/carte">Carte</Link>
          </li>
          <li aria-hidden="true">›</li>
          <li aria-current="page">
            {practitioner.first_name} {practitioner.last_name}
          </li>
        </ol>
      </nav>

      <div className="practitioner-layout">
        <aside className="practitioner-map-pane" aria-label="Carte du praticien">
          <div className="mini-map mini-map--sticky">
            {staticMapUrl ? (
              <Image
                src={staticMapUrl}
                alt={`Carte de localisation de ${practitioner.first_name} ${practitioner.last_name}`}
                width={720}
                height={360}
                sizes="(max-width: 900px) 92vw, 720px"
                placeholder="empty"
              />
            ) : (
              <p>Carte indisponible.</p>
            )}
          </div>
        </aside>

        <div className="practitioner-content-pane">
          <h1>{title}</h1>

          <section className="practitioner-card">
            <h2>Adresse</h2>
            <p>{addressLine || "Adresse non renseignée."}</p>
          </section>

          <section className="practitioner-card">
            <h2>Contact</h2>

            {hasContact ? (
              <ul>
                {practitioner.phone ? (
                  <li>
                    Téléphone : <a href={`tel:${practitioner.phone}`}>{practitioner.phone}</a>
                  </li>
                ) : null}

                {practitioner.email ? (
                  <li>
                    Email : <a href={`mailto:${practitioner.email}`}>{practitioner.email}</a>
                  </li>
                ) : null}

                {websiteUrl ? (
                  <li>
                    Site web :{" "}
                    <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                      {practitioner.website}
                    </a>
                  </li>
                ) : null}
              </ul>
            ) : (
              <p>Contact non renseigné.</p>
            )}
          </section>

          {bookingUrl ? (
            <section className="practitioner-card">
              <h2>Prise de rendez-vous</h2>
              <p>
                <a className="btn" href={bookingUrl} target="_blank" rel="noopener noreferrer">
                  Prendre rendez-vous
                </a>
              </p>
            </section>
          ) : null}

          <section className="practitioner-card">
            <h2>Vous êtes ce praticien ?</h2>
            <p>
              Vous pouvez demander la correction ou la revendication de cette fiche.
            </p>
            <p>
              <Link
                className="btn btn-secondary"
                href={`/praticiens?claim=${encodeURIComponent(practitioner.slug)}`}
              >
                Revendiquer / corriger cette fiche
              </Link>
            </p>
          </section>

          <section className="practitioner-card">
            <h2>Description</h2>
            <p>{practitionerDescription || "Description non renseignée."}</p>
          </section>

        </div>
      </div>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </article>
  );
}
