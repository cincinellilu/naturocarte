import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PractitionerDetailMap from "@/components/PractitionerDetailMap";
import PractitionerReviewModal from "@/components/PractitionerReviewModal";
import { getDepartmentFromPostalCode } from "@/lib/locations";
import { PUBLIC_PRACTITIONER_STATUSES } from "@/lib/practitioner-status";
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

type PractitionerReview = {
  id: string;
  rating: number;
  message: string | null;
  created_at: string;
};

async function getPublishedPractitioner(slug: string): Promise<Practitioner | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("practitioners")
    .select(
      "slug, first_name, last_name, adresse, postal_code, city, lat, lng, phone, email, website, booking_url, description, status"
    )
    .eq("slug", slug)
    .in("status", [...PUBLIC_PRACTITIONER_STATUSES])
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

function normalizeLocationSegment(value: string | null | undefined): string | null {
  const raw = value?.trim();
  return raw ? raw : null;
}

function areSameLocationLabel(left: string, right: string): boolean {
  return left.localeCompare(right, "fr", { sensitivity: "base" }) === 0;
}

function getPractitionerLocationLabel(practitioner: Practitioner): string {
  const arrondissement = getParisArrondissement(practitioner.postal_code);

  if (arrondissement) {
    return `Paris ${arrondissement}`;
  }

  const city = normalizeLocationSegment(practitioner.city);
  const department = getDepartmentFromPostalCode(practitioner.postal_code);

  if (city && department && !areSameLocationLabel(city, department.name)) {
    return `${city} (${department.name})`;
  }

  return city ?? department?.name ?? "Île-de-France";
}

function buildTitle(practitioner: Practitioner): string {
  const locationLabel = getPractitionerLocationLabel(practitioner);
  return `${practitioner.first_name} ${practitioner.last_name} - Naturopathe à ${locationLabel}`;
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

function truncateText(value: string, limit: number): string {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit - 1).trimEnd()}…`;
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

  const city = normalizeLocationSegment(practitioner.city);
  const department = getDepartmentFromPostalCode(practitioner.postal_code);
  const locationLabel = getPractitionerLocationLabel(practitioner);
  const title = buildTitle(practitioner);
  const metadataAddress = [
    practitioner.adresse?.trim(),
    practitioner.postal_code?.trim(),
    city ?? department?.name ?? null
  ]
    .filter(Boolean)
    .join(", ");
  const description = `Découvrez la fiche de ${practitioner.first_name} ${practitioner.last_name}, naturopathe à ${locationLabel}${metadataAddress ? ` (${metadataAddress})` : ""} : adresse, contact et prise de rendez-vous.`;

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

  const city = normalizeLocationSegment(practitioner.city);
  const department = getDepartmentFromPostalCode(practitioner.postal_code);
  const title = buildTitle(practitioner);
  const locationLabel = getPractitionerLocationLabel(practitioner);

  const bookingUrl = isValidExternalUrl(practitioner.booking_url)
    ? practitioner.booking_url.trim()
    : null;

  const websiteUrl = normalizeWebsiteUrl(practitioner.website);
  const claimUrl = `/praticiens?claim=${encodeURIComponent(practitioner.slug)}`;
  const practitionerInitials = `${practitioner.first_name?.charAt(0) ?? ""}${practitioner.last_name?.charAt(0) ?? ""}`
    .trim()
    .toUpperCase();

  const addressLine = [
    practitioner.adresse?.trim(),
    practitioner.postal_code?.trim(),
    city ?? department?.name ?? null
  ]
    .filter(Boolean)
    .join(", ");

  const siteUrl = getAbsoluteSiteUrl();
  const canonicalUrl = `${siteUrl}/naturopathe/${practitioner.slug}`;
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const staticMapUrl =
    mapboxToken && Number.isFinite(practitioner.lat) && Number.isFinite(practitioner.lng)
      ? buildStaticMapUrl(practitioner.lat, practitioner.lng, mapboxToken)
      : null;

  const practitionerDescription = practitioner.description?.trim() || null;
  const practitionerDescriptionPreview = practitionerDescription
    ? truncateText(practitionerDescription, 240)
    : "Description non renseignée pour le moment. Cet espace sera utilisé pour présenter la méthode, les spécialisations et les repères utiles.";
  const practitionerReviews: PractitionerReview[] = [];
  const reviewsCount = practitionerReviews.length;
  const ratingAverage = reviewsCount
    ? practitionerReviews.reduce((sum, review) => sum + review.rating, 0) / reviewsCount
    : null;
  const directContactActions = [
    bookingUrl
      ? {
          href: bookingUrl,
          label: "Prendre rendez-vous",
          variant: "primary" as const,
          external: true
        }
      : null,
    practitioner.phone
      ? {
          href: `tel:${practitioner.phone}`,
          label: "Appeler",
          variant: bookingUrl ? ("secondary" as const) : ("primary" as const)
        }
      : null,
    practitioner.email
      ? {
          href: `mailto:${practitioner.email}`,
          label: "Envoyer un email",
          variant: "secondary" as const
        }
      : null,
    websiteUrl
      ? {
          href: websiteUrl,
          label: "Voir le site",
          variant: "secondary" as const,
          external: true
        }
      : null
  ].filter(Boolean) as Array<{
    href: string;
    label: string;
    variant: "primary" | "secondary";
    external?: boolean;
  }>;

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
      addressLocality: city || undefined,
      addressCountry: "FR"
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: department?.name ?? city ?? "Île-de-France"
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
    <article className="article-shell practitioner-page">
      <div className="practitioner-page-links">
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
      </div>

      <div className="practitioner-layout">
        <div className="practitioner-info-pane">
          <section className="practitioner-card practitioner-summary-card">
            <div className="practitioner-summary-top">
              <div className="practitioner-summary-photo" aria-hidden="true">
                <div className="practitioner-summary-photo-placeholder">
                  <span>{practitionerInitials || "NC"}</span>
                </div>
              </div>

              <div className="practitioner-summary-copy">
                <p className="practitioner-eyebrow">Fiche praticien</p>
                <h1>{title}</h1>
                <p className="practitioner-hero-subtitle">{locationLabel}</p>
              </div>
            </div>

            <div className="practitioner-summary-description-panel">
              <p className="practitioner-summary-description">
                {practitionerDescriptionPreview}
              </p>
            </div>

            <div className="practitioner-summary-address">
              <p className="practitioner-detail-label">Adresse</p>
              <p className="practitioner-detail-value">{addressLine || "Adresse non renseignée."}</p>
            </div>

            <div className="practitioner-detail-grid">
              <section className="practitioner-detail-tile practitioner-detail-tile--contact">
                <p className="practitioner-detail-label">Contact direct</p>
                {directContactActions.length > 0 ? (
                  <div className="practitioner-contact-actions">
                    {directContactActions.map((action) => (
                      <Link
                        key={action.href}
                        className={action.variant === "primary" ? "btn" : "btn btn-secondary"}
                        href={action.href}
                        target={action.external ? "_blank" : undefined}
                        rel={action.external ? "noopener noreferrer" : undefined}
                      >
                        {action.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="practitioner-detail-value">Contact non renseigné.</p>
                )}
              </section>
            </div>

            <section className="practitioner-card practitioner-reviews-card">
              <div className="practitioner-reviews-header">
                <div>
                  <p className="practitioner-detail-label">Avis</p>
                  <h2>Avis et notes</h2>
                </div>
              </div>

              {reviewsCount > 0 && ratingAverage !== null ? (
                <>
                  <div className="practitioner-reviews-summary">
                    <div className="practitioner-reviews-score">
                      <strong>{ratingAverage.toFixed(1)}</strong>
                      <span>/5</span>
                    </div>
                    <div
                      className="practitioner-reviews-stars"
                      aria-label={`Note moyenne ${ratingAverage.toFixed(1)} sur 5`}
                    >
                      {Array.from({ length: 5 }, (_, index) => (
                        <span
                          key={`global-star-${index}`}
                          className={index < Math.round(ratingAverage) ? "is-filled" : ""}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="practitioner-detail-value">
                      {reviewsCount} avis publiés pour le moment.
                    </p>
                  </div>

                  <div className="practitioner-review-list">
                    {practitionerReviews.map((review) => (
                      <article key={review.id} className="practitioner-review-item">
                        <div className="practitioner-review-item-head">
                          <div
                            className="practitioner-review-item-stars"
                            aria-label={`Note ${review.rating} sur 5`}
                          >
                            {Array.from({ length: 5 }, (_, index) => (
                              <span
                                key={`review-${review.id}-star-${index}`}
                                className={index < review.rating ? "is-filled" : ""}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <time dateTime={review.created_at} className="practitioner-review-item-date">
                            {new Date(review.created_at).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric"
                            })}
                          </time>
                        </div>
                        {review.message ? (
                          <p className="practitioner-review-item-message">{review.message}</p>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </>
              ) : (
                <div className="practitioner-reviews-empty">
                  <p className="practitioner-detail-value">Aucun avis publié pour le moment.</p>
                </div>
              )}

              <div className="practitioner-reviews-actions">
                <PractitionerReviewModal
                  practitionerSlug={practitioner.slug}
                  practitionerName={`${practitioner.first_name} ${practitioner.last_name}`}
                />
              </div>
            </section>

            <section className="practitioner-card practitioner-tariffs-card">
              <div className="practitioner-reviews-header">
                <div>
                  <p className="practitioner-detail-label">Tarifs</p>
                  <h2>Tarifs et prestations</h2>
                </div>
              </div>
              <div className="practitioner-tariffs-body">
                <p className="practitioner-detail-value">Tarifs non renseignés pour le moment.</p>
              </div>
            </section>
          </section>
        </div>

        <aside className="practitioner-map-pane" aria-label="Carte du praticien">
          <div className="mini-map mini-map--sticky">
            {Number.isFinite(practitioner.lat) && Number.isFinite(practitioner.lng) ? (
              <PractitionerDetailMap lat={practitioner.lat} lng={practitioner.lng} />
            ) : (
              <p>Carte indisponible.</p>
            )}
          </div>
        </aside>

        <div className="practitioner-claim-pane">
          <details className="practitioner-card practitioner-claim-accordion">
            <summary className="practitioner-claim-summary">
              Revendiquer ou corriger cette fiche
            </summary>
            <div className="practitioner-claim-content">
              <p>
                Si vous êtes le praticien, vous pouvez demander la correction de la fiche,
                mettre à jour vos coordonnées ou ajouter des informations utiles.
              </p>
              <ul className="practitioner-edit-list">
                <li>Corriger l’adresse ou les coordonnées</li>
                <li>Ajouter une description plus précise</li>
                <li>Ajouter des photos ou un site web</li>
              </ul>
              <p className="practitioner-form-actions">
                <Link className="btn btn-secondary practitioner-form-btn" href={claimUrl}>
                  Ouvrir la demande de correction
                </Link>
              </p>
            </div>
          </details>
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
