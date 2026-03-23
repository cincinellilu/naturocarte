import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import CarteInteractive from "@/components/CarteInteractive";
import ListSkeleton from "@/components/ListSkeleton";
import MapSkeleton from "@/components/MapSkeleton";
import { PUBLIC_PRACTITIONER_STATUSES } from "@/lib/practitioner-status";
import { getSupabaseServerClient } from "@/lib/supabase-server";

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
};

export default async function CartePage() {
  let practitioners: PractitionerRow[] = [];
  let hasError = false;

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("practitioners")
      .select(
        "first_name, last_name, slug, adresse, postal_code, city, lat, lng, phone, email, booking_url"
      )
      .in("status", [...PUBLIC_PRACTITIONER_STATUSES])
      .order("last_name", { ascending: true });

    if (error) {
      hasError = true;
    } else {
      practitioners = (data ?? []) as PractitionerRow[];
    }
  } catch {
    hasError = true;
  }

  const mapPoints = practitioners
    .filter(
      (p) =>
        typeof p.lat === "number" &&
        Number.isFinite(p.lat) &&
        typeof p.lng === "number" &&
        Number.isFinite(p.lng)
    )
    .map((p) => ({
      slug: p.slug,
      first_name: p.first_name,
      last_name: p.last_name,
      postal_code: p.postal_code,
      lat: p.lat as number,
      lng: p.lng as number,
      phone: p.phone,
      email: p.email,
      booking_url: p.booking_url
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

  return (
    <article className="article-shell article-shell--map">
      <section className="map-page-shell">
        <div className="map-page-header">
          <div className="map-page-copy">
            <h1 className="map-page-title">Trouver un naturopathe près de chez vous</h1>
            <p className="map-page-lead">
              Entrez votre adresse, comparez les praticiens autour de vous et ouvrez les
              fiches les plus utiles en quelques clics.
            </p>
          </div>
        </div>

        {hasError ? (
          <p className="page-alert">
            Les praticiens ne peuvent pas être chargés pour le moment. La carte et
            l’annuaire restent accessibles.
          </p>
        ) : null}

        <Suspense
          fallback={
            <div className="map-experience">
              <MapSkeleton />
              <ListSkeleton />
            </div>
          }
        >
          <CarteInteractive practitioners={practitionerItems} mapPoints={mapPoints} />
        </Suspense>
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
