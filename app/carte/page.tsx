import type { Metadata } from "next";
import Link from "next/link";
import CarteInteractive from "@/components/CarteInteractive";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Carte des naturopathes",
  description:
    "Consultez la carte des naturopathes et accédez aux profils des praticiens.",
  alternates: {
    canonical: "/carte"
  },
  openGraph: {
    title: "Carte des naturopathes | NaturoCarte",
    description:
      "Consultez la carte des naturopathes et accédez aux profils des praticiens.",
    url: "/carte",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Carte des naturopathes | NaturoCarte",
    description:
      "Consultez la carte des naturopathes et accédez aux profils des praticiens."
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
      city: practitioner?.city ?? "Paris",
      lat: p.lat,
      lng: p.lng
    };
  });

  const showEmptyState = hasError || practitioners.length === 0;
  return (
    <section>
      <h1>Carte des naturopathes</h1>
      <p>
        Cette page présente un aperçu d’un annuaire spécialisé de naturopathes.
        L’objectif est d’aider les visiteurs à trouver un praticien selon une
        localisation, puis d’accéder à une fiche contenant des informations factuelles
        (adresse, contact, lien de prise de rendez-vous lorsque disponible). La structure
        est conçue pour rester claire et lisible pour les utilisateurs comme pour les moteurs
        de recherche, avec une expérience cartographique complète.
      </p>

      {showEmptyState ? (
        <p>Aucun praticien référencé pour le moment.</p>
      ) : (
        <CarteInteractive practitioners={practitionerItems} mapPoints={mapPoints} />
      )}

      <section aria-labelledby="faq-title" className="faq-section">
        <h2 id="faq-title">Questions fréquentes</h2>
        <p className="faq-intro">
          Voici des réponses rapides pour trouver un praticien, corriger une fiche et
          réserver plus facilement.
        </p>

        <details className="faq-item">
          <summary className="faq-question">
            Comment trouver rapidement un naturopathe autour de moi ?
          </summary>
          <p className="faq-answer">
            Utilisez la recherche d’adresse sur la <Link href="/carte">carte</Link> pour
            afficher les praticiens les plus proches et comparer leurs fiches.
          </p>
        </details>

        <details className="faq-item">
          <summary className="faq-question">
            Que faire si une information de fiche est inexacte ?
          </summary>
          <p className="faq-answer">
            Vous pouvez demander une mise à jour via la page{" "}
            <Link href="/praticiens">praticiens</Link> en indiquant le praticien
            concerné.
          </p>
        </details>

        <details className="faq-item">
          <summary className="faq-question">
            Comment prendre rendez-vous avec un praticien ?
          </summary>
          <p className="faq-answer">
            Ouvrez sa fiche depuis la <Link href="/carte">carte</Link>, puis utilisez le
            lien de réservation lorsqu’il est disponible.
          </p>
        </details>
      </section>
    </section>
  );
}
