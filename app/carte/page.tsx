import type { Metadata } from "next";
import Link from "next/link";
import CarteInteractiveMount from "@/components/CarteInteractiveMount";
import ZoneFilterPanel from "@/components/ZoneFilterPanel";
import { fetchAllSupabaseRows } from "@/lib/fetch-all-supabase-rows";
import {
  getDepartmentByCode,
  getDepartmentCodeFromPostalCode,
  normalizeLocationToken
} from "@/lib/locations";
import { PUBLIC_PRACTITIONER_STATUSES } from "@/lib/practitioner-status";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import {
  getParisArrondissementFromPostalCode,
  parseParisArrondissement,
  toParisArrondissementLabel
} from "@/lib/paris";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Naturopathe Île-de-France | Carte des praticiens",
  description:
    "Cherchez un naturopathe en Île-de-France autour de votre adresse, comparez les fiches et contactez le praticien qui vous convient.",
  alternates: {
    canonical: "/carte"
  },
  openGraph: {
    title: "Naturopathe Île-de-France | Carte des praticiens | NaturoCarte",
    description:
      "Cherchez un naturopathe en Île-de-France autour de votre adresse, comparez les fiches et contactez le praticien qui vous convient.",
    url: "/carte",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Naturopathe Île-de-France | Carte des praticiens | NaturoCarte",
    description:
      "Cherchez un naturopathe en Île-de-France autour de votre adresse, comparez les fiches et contactez le praticien qui vous convient."
  }
};

type PractitionerRow = {
  first_name: string;
  last_name: string;
  slug: string;
  adresse: string | null;
  postal_code: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  email: string | null;
  booking_url: string | null;
  photo_url: string | null;
  description: string | null;
};

type SearchParams = {
  zone?: string | string[];
  subzone?: string | string[];
};

export default async function CartePage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const zoneParam = resolvedSearchParams.zone;
  const subzoneParam = resolvedSearchParams.subzone;
  const zoneCode = Array.isArray(zoneParam) ? zoneParam[0] : zoneParam ?? null;
  const subzoneCode = Array.isArray(subzoneParam) ? subzoneParam[0] : subzoneParam ?? null;
  const activeDepartment = zoneCode ? getDepartmentByCode(zoneCode) : null;
  const activeZoneLabel = activeDepartment?.name ?? "Île-de-France";
  const activeSubzoneKey = subzoneCode ? normalizeLocationToken(subzoneCode) : null;

  let practitioners: PractitionerRow[] = [];
  let hasError = false;

  try {
    const supabase = getSupabaseServerClient();
    practitioners = await fetchAllSupabaseRows<PractitionerRow>((from, to) =>
      supabase
        .from("practitioners")
        .select(
          "first_name, last_name, slug, adresse, postal_code, city, lat, lng, phone, email, booking_url, photo_url, description"
        )
        .in("status", [...PUBLIC_PRACTITIONER_STATUSES])
        .order("last_name", { ascending: true })
        .range(from, to)
    );
  } catch {
    hasError = true;
  }

  const cityOptionsByDepartment = practitioners.reduce<
    Record<string, Array<{ label: string; slug: string }>>
  >((acc, practitioner) => {
    const departmentCode = getDepartmentCodeFromPostalCode(practitioner.postal_code);
    const city = practitioner.city?.trim();

    if (!departmentCode || !city) return acc;

    const slug = normalizeLocationToken(city);
    if (!slug) return acc;

    const bucket = acc[departmentCode] ?? [];
    if (!bucket.some((option) => option.slug === slug)) {
      bucket.push({ label: city, slug });
    }

    acc[departmentCode] = bucket;
    return acc;
  }, {});

  for (const bucket of Object.values(cityOptionsByDepartment)) {
    bucket.sort((left, right) => left.label.localeCompare(right.label, "fr"));
  }

  const activeSubzoneLabel = (() => {
    if (!activeDepartment || !subzoneCode) return null;

    if (activeDepartment.code === "75") {
      const arrondissement = parseParisArrondissement(subzoneCode);
      return arrondissement ? toParisArrondissementLabel(arrondissement) : null;
    }

    const option = cityOptionsByDepartment[activeDepartment.code]?.find(
      (cityOption) => cityOption.slug === activeSubzoneKey
    );

    return option?.label ?? null;
  })();

  const matchesActiveSubzone = (practitioner: PractitionerRow): boolean => {
    if (!activeDepartment || !activeSubzoneKey) return true;

    if (activeDepartment.code === "75") {
      const arrondissement = getParisArrondissementFromPostalCode(practitioner.postal_code);
      return arrondissement ? String(arrondissement) === activeSubzoneKey : false;
    }

    return normalizeLocationToken(practitioner.city) === activeSubzoneKey;
  };

  const mapPoints = practitioners
    .filter(
      (p) =>
        typeof p.lat === "number" &&
        Number.isFinite(p.lat) &&
        typeof p.lng === "number" &&
        Number.isFinite(p.lng)
    )
    .filter((p) => {
      if (!activeDepartment) return true;
      const departmentCode = getDepartmentCodeFromPostalCode(p.postal_code);
      if (departmentCode !== activeDepartment.code) return false;
      return matchesActiveSubzone(p);
    })
    .map((p) => ({
      slug: p.slug,
      first_name: p.first_name,
      last_name: p.last_name,
      postal_code: p.postal_code,
      lat: p.lat as number,
      lng: p.lng as number,
      phone: p.phone,
      email: p.email,
      booking_url: p.booking_url,
      photo_url: p.photo_url,
      description: p.description
    }));

  const practitionerItems = mapPoints.map((p) => {
    const practitioner = practitioners.find((candidate) => candidate.slug === p.slug);
    return {
      slug: p.slug,
      first_name: p.first_name,
      last_name: p.last_name,
      adresse: practitioner?.adresse ?? null,
      postal_code: practitioner?.postal_code ?? null,
      city: practitioner?.city ?? null,
      lat: p.lat,
      lng: p.lng
    };
  });

  const activeLocationLabel = activeSubzoneLabel
    ? activeDepartment?.code === "75"
      ? `Paris ${activeSubzoneLabel}`
      : `${activeSubzoneLabel} (${activeZoneLabel})`
    : activeZoneLabel;

  const activeLocationSummary = activeSubzoneLabel
    ? `Zone actuelle : ${activeZoneLabel} · ${activeSubzoneLabel}.`
    : activeDepartment
      ? `Zone actuelle : ${activeZoneLabel}.`
      : "Choisissez une zone pour filtrer la carte.";

  return (
    <article className="article-shell article-shell--map">
      <nav className="breadcrumb-nav" aria-label="Fil d’Ariane">
        <ol>
          <li>
            <Link href="/">Accueil</Link>
          </li>
          <li aria-hidden="true">›</li>
          <li aria-current="page">Carte</li>
        </ol>
      </nav>

      <section className="map-page-shell">
        <div className="map-page-header">
          <div className="map-page-copy">
            <h1 className="map-page-title">
              Trouver un naturopathe <span className="map-page-title-accent">près de chez vous</span>
            </h1>
            <p className="map-page-lead">
              Entrez votre adresse, comparez les praticiens autour de vous et ouvrez les
              fiches les plus utiles en quelques clics.
            </p>
            <div className="map-mobile-action-bar" aria-label="Actions rapides carte">
              <a className="map-mobile-action-link" href="#carte-interactive" data-scroll-target="carte-interactive">
                Voir la carte
              </a>
              <a className="map-mobile-action-link" href="#zone-filter-panel" data-scroll-target="zone-filter-panel">
                Filtrer
              </a>
              <a className="map-mobile-action-link" href="#praticiens-results" data-scroll-target="praticiens-results">
                Liste
              </a>
            </div>
          </div>
        </div>

        {hasError ? (
          <p className="page-alert">
            Les praticiens ne peuvent pas être chargés pour le moment. La carte et
            l’annuaire restent accessibles.
          </p>
        ) : null}

        <ZoneFilterPanel
          zoneCode={zoneCode}
          subzoneCode={subzoneCode}
          activeZoneLabel={activeZoneLabel}
          activeSubzoneLabel={activeSubzoneLabel}
          cityOptionsByDepartment={cityOptionsByDepartment}
        />

        <CarteInteractiveMount
          practitioners={practitionerItems}
          mapPoints={mapPoints}
          zoneCode={zoneCode}
          activeSubzoneLabel={activeSubzoneLabel}
          activeLocationLabel={activeLocationLabel}
          activeLocationSummary={activeLocationSummary}
        />
      </section>

      <section className="directory-promo-shell section-shell section-shell--compact">
        <div className="directory-promo-copy">
          <p className="section-eyebrow">Autre façon de chercher</p>
          <h2>Vous pouvez aussi parcourir l’annuaire des naturopathes référencés.</h2>
          <p className="section-intro">
            Si vous préférez repartir d’une fiche ou d’une zone déjà connue, l’annuaire vous
            permet d’explorer les naturopathes référencés sans passer par la carte.
          </p>
        </div>
        <div className="directory-promo-actions">
          <Link className="btn" href="/annuaire-naturopathes">
            Parcourir l’annuaire
          </Link>
        </div>
      </section>

      <section aria-labelledby="faq-title" className="faq-section section-shell section-shell--compact">
        <div className="section-heading section-heading--stacked">
          <div>
            <h2 id="faq-title">Questions fréquentes</h2>
          </div>
          <p className="faq-intro">
            Réponses rapides pour chercher plus vite et comparer plusieurs praticiens.
          </p>
        </div>

        <details className="faq-item">
          <summary className="faq-question">Dois-je commencer par la carte ou l’annuaire ?</summary>
          <p className="faq-answer">
            Commencez par la <Link href="/carte">carte</Link> si vous avez déjà une adresse
            précise. Si vous préférez partir d’un département ou de Paris, utilisez
            l’<Link href="/annuaire-naturopathes">annuaire</Link>.
          </p>
        </details>

        <details className="faq-item">
          <summary className="faq-question">Comment chercher seulement dans un département ?</summary>
          <p className="faq-answer">
            Utilisez les filtres de zone au-dessus de la carte, ou commencez par la page{" "}
            <Link href="/annuaire-naturopathes">annuaire</Link> pour ouvrir directement le
            bon territoire.
          </p>
        </details>

        <details className="faq-item">
          <summary className="faq-question">Comment comparer plusieurs praticiens ?</summary>
          <p className="faq-answer">
            Ouvrez 2 ou 3 fiches depuis la <Link href="/carte">carte</Link> pour vérifier
            l’adresse, les coordonnées et le lien de prise de rendez-vous quand il est
            disponible.
          </p>
        </details>
      </section>
    </article>
  );
}
