import type { Metadata } from "next";
import Link from "next/link";
import CarteInteractive from "@/components/CarteInteractive";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Carte des naturopathes en Île-de-France",
  description:
    "Consultez la carte des naturopathes en Île-de-France et accédez aux profils des praticiens.",
  alternates: {
    canonical: "/carte"
  },
  openGraph: {
    title: "Carte des naturopathes en Île-de-France | NaturoCarte",
    description:
      "Consultez la carte des naturopathes en Île-de-France et accédez aux profils des praticiens.",
    url: "/carte",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Carte des naturopathes en Île-de-France | NaturoCarte",
    description:
      "Consultez la carte des naturopathes en Île-de-France et accédez aux profils des praticiens."
  }
};

type PractitionerRow = {
  first_name: string;
  last_name: string;
  slug: string;
  adresse: string | null;
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
      .select("first_name, last_name, slug, adresse, city, lat, lng, phone, email, booking_url")
      .eq("status", "published")
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
            <h1 className="map-page-title">Carte des naturopathes en Île-de-France</h1>
            <p className="map-page-lead">
              Recherchez une adresse en Île-de-France, recentrez la carte puis ouvrez une
              fiche en un clic.
            </p>
          </div>
        </div>

        {hasError ? (
          <p className="page-alert">
            Les praticiens ne peuvent pas être chargés pour le moment. La carte et
            l’annuaire restent accessibles.
          </p>
        ) : null}

        <CarteInteractive practitioners={practitionerItems} mapPoints={mapPoints} />
      </section>

      <section aria-labelledby="faq-title" className="faq-section section-shell section-shell--compact">
        <div className="section-heading section-heading--stacked">
          <div>
            <h2 id="faq-title">Questions fréquentes</h2>
          </div>
          <p className="faq-intro">
            Réponses rapides sur l’usage de la carte, la mise à jour des fiches et la prise
            de rendez-vous.
          </p>
        </div>

        <details className="faq-item">
          <summary className="faq-question">
            Comment trouver rapidement un naturopathe autour de moi ?
          </summary>
          <p className="faq-answer">
            Utilisez la recherche d’adresse sur la <Link href="/carte">carte</Link> pour
            recentrer l’affichage puis comparer les praticiens les plus proches.
          </p>
        </details>

        <details className="faq-item">
          <summary className="faq-question">
            Que faire si une information de fiche est inexacte ?
          </summary>
          <p className="faq-answer">
            Vous pouvez demander une mise à jour via la page{" "}
            <Link href="/praticiens">praticiens</Link> en indiquant le praticien concerné.
          </p>
        </details>

        <details className="faq-item">
          <summary className="faq-question">
            Comment prendre rendez-vous avec un praticien ?
          </summary>
          <p className="faq-answer">
            Ouvrez sa fiche depuis la <Link href="/carte">carte</Link>, puis utilisez le
            lien de réservation quand il est disponible.
          </p>
        </details>
      </section>
    </article>
  );
}
