import type { Metadata } from "next";
import Link from "next/link";
import CarteInteractive from "@/components/CarteInteractive";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Carte des naturopathes à Paris",
  description:
    "Consultez la carte des naturopathes à Paris et accédez aux profils des praticiens.",
  alternates: {
    canonical: "/carte"
  },
  openGraph: {
    title: "Carte des naturopathes à Paris | NaturoCarte",
    description:
      "Consultez la carte des naturopathes à Paris et accédez aux profils des praticiens.",
    url: "/carte",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Carte des naturopathes à Paris | NaturoCarte",
    description:
      "Consultez la carte des naturopathes à Paris et accédez aux profils des praticiens."
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
  const practitionerCount = practitioners.length;
  const bookableCount = practitioners.filter((p) => Boolean(p.booking_url)).length;
  const contactableCount = practitioners.filter((p) => Boolean(p.phone || p.email)).length;

  return (
    <article className="article-shell article-shell--map">
      <section className="page-hero page-hero--map">
        <div className="page-hero-grid">
          <div className="page-hero-copy">
            <p className="page-eyebrow">Paris • recherche locale</p>
            <h1>La carte des naturopathes pensée pour chercher vite, sans friction.</h1>
            <p className="page-lead">
              Saisissez une adresse, recadrez la carte, comparez les praticiens autour de
              vous puis ouvrez une fiche claire avec l’essentiel: adresse, contact et prise
              de rendez-vous quand elle existe.
            </p>

            <div className="hero-actions">
              <Link className="btn" href="#explorer-carte">
                Explorer la carte
              </Link>
              <Link className="btn btn-secondary" href="/naturopathe-paris">
                Parcourir par arrondissement
              </Link>
            </div>
          </div>

          <div className="hero-panel">
            <p className="hero-panel-label">En un coup d’œil</p>
            <div className="hero-metrics">
              <div className="hero-metric">
                <strong>{practitionerCount}</strong>
                <span>fiches publiées</span>
              </div>
              <div className="hero-metric">
                <strong>{mapPoints.length}</strong>
                <span>adresses localisées</span>
              </div>
              <div className="hero-metric">
                <strong>{bookableCount}</strong>
                <span>liens de rendez-vous</span>
              </div>
              <div className="hero-metric">
                <strong>{contactableCount}</strong>
                <span>contacts affichés</span>
              </div>
            </div>
            <p className="hero-note">
              L’interface reste volontairement sobre: pas de classement arbitraire, seulement
              une lecture cartographique plus nette et plus rapide.
            </p>
          </div>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <p className="feature-card-label">Adresse</p>
            <h2>Recentrez la recherche en quelques secondes</h2>
            <p>
              La recherche d’adresse pilote la carte et retrie automatiquement la liste par
              proximité.
            </p>
          </div>
          <div className="feature-card">
            <p className="feature-card-label">Décision</p>
            <h2>Comparez sans naviguer à l’aveugle</h2>
            <p>
              Le passage carte/liste reste synchronisé pour repérer rapidement les cabinets
              pertinents.
            </p>
          </div>
          <div className="feature-card">
            <p className="feature-card-label">Fiches</p>
            <h2>Gardez uniquement les informations utiles</h2>
            <p>
              Chaque profil présente les données factuelles nécessaires pour prendre contact
              ou réserver.
            </p>
          </div>
        </div>
      </section>

      <section id="explorer-carte" className="section-shell">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">Explorer</p>
            <h2>Comparer les praticiens sur carte et dans la liste</h2>
          </div>
          <p className="section-intro">
            Entrez une adresse ou utilisez votre position pour voir les profils les plus
            proches et accéder ensuite à chaque fiche.
          </p>
        </div>

        {showEmptyState ? (
          <div className="empty-state-panel">
            <h3>Aucun praticien n’est disponible pour le moment.</h3>
            <p>
              La carte sera alimentée à mesure de la publication des fiches. Vous pouvez en
              attendant parcourir l’index éditorial par quartier.
            </p>
            <p>
              <Link className="btn btn-secondary" href="/naturopathe-paris">
                Voir l’annuaire Paris
              </Link>
            </p>
          </div>
        ) : (
          <CarteInteractive practitioners={practitionerItems} mapPoints={mapPoints} />
        )}
      </section>

      <section aria-labelledby="faq-title" className="faq-section section-shell">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Questions fréquentes</p>
            <h2 id="faq-title">Ce qu’il faut savoir avant de contacter un praticien</h2>
          </div>
          <p className="faq-intro">
            Voici les réponses rapides aux questions les plus fréquentes sur l’usage de la
            carte, la correction des fiches et la prise de rendez-vous.
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
