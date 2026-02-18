import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Accueil",
  description:
    "Accueil de NaturoCarte, l'annuaire cartographique des naturopathes.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "NaturoCarte",
    description:
      "Annuaire cartographique de naturopathes. Trouvez des praticiens et consultez une carte simple et claire.",
    url: "/",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "NaturoCarte",
    description:
      "Annuaire cartographique de naturopathes. Trouvez des praticiens et consultez une carte simple et claire."
  }
};

export default function HomePage() {
  return (
    <article>
      <header>
        <h1>Annuaire des naturopathes</h1>
        <p>
          NaturoCarte aide à trouver des naturopathes via une carte interactive et des
          fiches praticiens avec des informations factuelles (adresse, contact, lien de
          rendez-vous quand disponible).
        </p>
      </header>

      <section>
        <h2>Explorer les praticiens</h2>
        <p>
          Accédez à la carte pour rechercher une zone et consulter les fiches détaillées.
        </p>
        <p>
          <Link className="btn" href="/carte">
            Voir la carte
          </Link>
        </p>
      </section>

      <section>
        <h2>Vous êtes praticien ?</h2>
        <p>
          Vous pouvez demander la correction ou la revendication de votre fiche depuis
          l’espace praticiens.
        </p>
        <p>
          <Link className="btn btn-secondary" href="/praticiens">
            Accéder à l’espace praticiens
          </Link>
        </p>
      </section>

      <section>
        <h2>Cadre éditorial</h2>
        <p>
          NaturoCarte publie des informations descriptives à visée d’orientation. Le site
          ne fournit pas de diagnostic médical, ni de promesse de résultat thérapeutique.
        </p>
      </section>
    </article>
  );
}
