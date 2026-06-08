import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PractitionerDetailMap from "@/components/PractitionerDetailMap";
import PartnerBadge, { PARTNER_DIRECTORY_HREF } from "@/components/PartnerBadge";
import PractitionerReviewModal from "@/components/PractitionerReviewModal";
import PractitionerStatsTracker from "@/components/PractitionerStatsTracker";
import PractitionerTrackedLink from "@/components/PractitionerTrackedLink";
import { fetchAllSupabaseRows } from "@/lib/fetch-all-supabase-rows";
import { getDepartmentFromPostalCode } from "@/lib/locations";
import { PUBLIC_PRACTITIONER_STATUSES } from "@/lib/practitioner-status";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSiteUrl } from "@/lib/site";
import { getCurrentUserSession } from "@/lib/user-auth";
import { getPartnerAccount, type PractitionerAccountPlanRow } from "@/lib/practitioner-partner";
import {
  isMissingPractitionerTariffsColumnError,
  parsePractitionerTariffs
} from "@/lib/practitioner-tariffs";
import {
  getVisiblePublicContacts,
  type PractitionerPublicAccountInput
} from "@/lib/practitioner-public-contact";

export const revalidate = 300;

type Practitioner = {
  id: string;
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
  photo_url?: string | null;
  description: string | null;
  tarifs?: string | null;
  status: string;
  practitioner_accounts:
    | PractitionerPublicAccountInput[]
    | PractitionerPublicAccountInput
    | null;
};

type PractitionerReview = {
  id: string;
  rating: number;
  message: string | null;
  created_at: string;
  published_at: string | null;
};

type UserAccountRow = {
  id: string;
};

type FavoriteRow = {
  id: string;
};

async function getPublishedPractitioner(slug: string): Promise<Practitioner | null> {
  const supabase = getSupabaseServerClient();

  async function run(includeTariffs: boolean) {
    return supabase
      .from("practitioners")
      .select(
        includeTariffs
          ? "id, slug, first_name, last_name, adresse, postal_code, city, lat, lng, phone, email, website, booking_url, photo_url, description, tarifs, status, practitioner_accounts(id, plan, contact_slot, stripe_subscription_status)"
          : "id, slug, first_name, last_name, adresse, postal_code, city, lat, lng, phone, email, website, booking_url, photo_url, description, status, practitioner_accounts(id, plan, contact_slot, stripe_subscription_status)"
      )
      .eq("slug", slug)
      .in("status", [...PUBLIC_PRACTITIONER_STATUSES])
      .maybeSingle();
  }

  const result = await run(true);

  if (result.error && isMissingPractitionerTariffsColumnError(result.error)) {
    const fallback = await run(false);
    if (fallback.error || !fallback.data) return null;
    return { ...(fallback.data as unknown as Practitioner), tarifs: null };
  }

  if (result.error || !result.data) return null;
  return result.data as unknown as Practitioner;
}

async function getPublishedPractitionerReviews(practitionerId: string): Promise<PractitionerReview[]> {
  const supabase = getSupabaseServerClient();

  try {
    const rows = await fetchAllSupabaseRows<PractitionerReview>((from, to) =>
      supabase
        .from("practitioner_reviews")
        .select("id, rating, message, created_at, published_at")
        .eq("practitioner_id", practitionerId)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .range(from, to)
    );

    return rows;
  } catch (error) {
    console.error("practitioner reviews fetch error", error);
    return [];
  }
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

  const userSession = await getCurrentUserSession();
  const city = normalizeLocationSegment(practitioner.city);
  const department = getDepartmentFromPostalCode(practitioner.postal_code);
  const title = buildTitle(practitioner);
  const locationLabel = getPractitionerLocationLabel(practitioner);

  const bookingUrl = isValidExternalUrl(practitioner.booking_url)
    ? practitioner.booking_url.trim()
    : null;

  const websiteUrl = normalizeWebsiteUrl(practitioner.website);
  const visibleContacts = getVisiblePublicContacts({
    practitioner: {
      phone: practitioner.phone,
      email: practitioner.email,
      booking_url: bookingUrl,
      website: websiteUrl
    },
    accounts: practitioner.practitioner_accounts
  });
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
  const isPartner = Boolean(getPartnerAccount(practitioner.practitioner_accounts));
  const tariffItems = parsePractitionerTariffs(practitioner.tarifs ?? null);
  const primaryTariff = tariffItems[0] ?? null;
  const additionalTariffs = tariffItems.slice(1);
  const shouldShowTariffs = isPartner && tariffItems.length > 0;
  const practitionerDescriptionPreview = practitionerDescription
    ? truncateText(practitionerDescription, 240)
    : null;
  const practitionerReviews = await getPublishedPractitionerReviews(practitioner.id);
  let isFavorite = false;

  if (userSession) {
    const supabase = getSupabaseServerClient();
    const { data: account } = await supabase
      .from("user_accounts")
      .select("id")
      .eq("auth_user_id", userSession.userId)
      .maybeSingle<UserAccountRow>();

    if (account?.id) {
      const { data: favorite } = await supabase
        .from("user_favorite_practitioners")
        .select("id")
        .eq("user_account_id", account.id)
        .eq("practitioner_id", practitioner.id)
        .maybeSingle<FavoriteRow>();

      isFavorite = Boolean(favorite?.id);
    }
  }

  const reviewsCount = practitionerReviews.length;
  const ratingAverage = reviewsCount
    ? practitionerReviews.reduce((sum, review) => sum + review.rating, 0) / reviewsCount
    : null;
  const directContactActions = visibleContacts.map((contact, index) => {
    if (contact.type === "booking_url") {
      return {
        href: contact.value,
        label: "Prendre rendez-vous",
        variant: index === 0 ? ("primary" as const) : ("secondary" as const),
        external: true,
        statEvent: "booking_click" as const
      };
    }

    if (contact.type === "phone") {
      return {
        href: `tel:${contact.value}`,
        label: "Appeler",
        variant: index === 0 ? ("primary" as const) : ("secondary" as const),
        statEvent: "contact_click" as const
      };
    }

    if (contact.type === "email") {
      return {
        href: `mailto:${contact.value}`,
        label: "Envoyer un email",
        variant: index === 0 ? ("primary" as const) : ("secondary" as const),
        statEvent: "contact_click" as const
      };
    }

    return {
      href: contact.value,
      label: "Voir le site",
      variant: index === 0 ? ("primary" as const) : ("secondary" as const),
      external: true,
      statEvent: "contact_click" as const
    };
  }) as Array<{
    href: string;
    label: string;
    variant: "primary" | "secondary";
    external?: boolean;
    statEvent: "contact_click" | "booking_click";
  }>;

  const visibleBookingUrl =
    visibleContacts.find((contact) => contact.type === "booking_url")?.value ?? null;
  const visibleWebsiteUrl =
    visibleContacts.find((contact) => contact.type === "website")?.value ?? null;
  const visiblePhone = visibleContacts.find((contact) => contact.type === "phone")?.value ?? null;
  const visibleEmail = visibleContacts.find((contact) => contact.type === "email")?.value ?? null;
  const sameAs = [visibleBookingUrl, visibleWebsiteUrl].filter((v): v is string => Boolean(v));
  const practitionerPath = `/naturopathe/${practitioner.slug}`;
  const reviewLoginUrl = `/compte?next=${encodeURIComponent(`${practitionerPath}#avis`)}`;

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
    priceRange: primaryTariff || undefined,
    knowsLanguage: "fr",
    telephone: visiblePhone || undefined,
    email: visibleEmail || undefined,
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
      <PractitionerStatsTracker practitionerSlug={practitioner.slug} />

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
                {practitioner.photo_url?.trim() ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="practitioner-summary-photo-image"
                    src={practitioner.photo_url.trim()}
                    alt=""
                  />
                ) : (
                  <div className="practitioner-summary-photo-placeholder">
                    <span>{practitionerInitials || "NC"}</span>
                  </div>
                )}
              </div>

              <div className="practitioner-summary-copy">
                <div className="practitioner-summary-copy-main">
                  <p className="practitioner-eyebrow">Fiche praticien</p>
                  <h1>{title}</h1>
                  <div className="practitioner-summary-meta">
                    <p className="practitioner-hero-subtitle">{locationLabel}</p>
                    {isPartner ? (
                      <PartnerBadge
                        className="practitioner-summary-partner-badge"
                        href={PARTNER_DIRECTORY_HREF}
                      />
                    ) : null}
                  </div>
                </div>
                <form className="practitioner-favorite-form" action="/api/user-favorites" method="post">
                  <input type="hidden" name="practitioner_slug" value={practitioner.slug} />
                  <input type="hidden" name="intent" value={isFavorite ? "remove" : "add"} />
                  <input type="hidden" name="redirect" value={practitionerPath} />
                  <button
                    className={`practitioner-favorite-btn${isFavorite ? " is-active" : ""}`}
                    type="submit"
                    aria-pressed={isFavorite}
                  >
                    {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                  </button>
                </form>
              </div>
            </div>

            {practitionerDescriptionPreview ? (
              <div className="practitioner-summary-description-panel">
                <p className="practitioner-summary-description">
                  {practitionerDescriptionPreview}
                </p>
              </div>
            ) : null}

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
                      <PractitionerTrackedLink
                        key={action.href}
                        className={action.variant === "primary" ? "btn" : "btn btn-secondary"}
                        href={action.href}
                        practitionerSlug={practitioner.slug}
                        event={action.statEvent}
                        target={action.external ? "_blank" : undefined}
                        rel={action.external ? "noopener noreferrer" : undefined}
                      >
                        {action.label}
                      </PractitionerTrackedLink>
                    ))}
                  </div>
                ) : (
                  <p className="practitioner-detail-value">Contact non renseigné.</p>
                )}
              </section>
            </div>

            <section className="practitioner-card practitioner-reviews-card" id="avis">
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
                            {new Date(review.published_at ?? review.created_at).toLocaleDateString("fr-FR", {
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
                  isAuthenticated={Boolean(userSession)}
                  loginUrl={reviewLoginUrl}
                />
              </div>
            </section>

            {shouldShowTariffs ? (
              <section className="practitioner-card practitioner-tariffs-card" id="tarifs">
                <div className="practitioner-reviews-header">
                  <div>
                    <p className="practitioner-detail-label">Tarifs</p>
                    <h2>Tarifs et prestations</h2>
                  </div>
                </div>
                <div className="practitioner-tariffs-body">
                  {primaryTariff ? (
                    <div className="practitioner-tariff-highlight">
                      <p className="practitioner-detail-label">Tarif principal</p>
                      <strong>{primaryTariff}</strong>
                    </div>
                  ) : null}

                  {additionalTariffs.length > 0 ? (
                    <ul className="practitioner-tariff-list">
                      {additionalTariffs.map((tariff) => (
                        <li key={tariff}>{tariff}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            ) : null}
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
