import type { Metadata } from "next";
import Link from "next/link";
import { legalIdentity } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales de NaturoCarte.",
  alternates: {
    canonical: "/mentions-legales"
  },
  openGraph: {
    title: "Mentions légales | NaturoCarte",
    description: "Mentions légales de NaturoCarte.",
    url: "/mentions-legales",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Mentions légales | NaturoCarte",
    description: "Mentions légales de NaturoCarte."
  }
};

export default function MentionsLegalesPage() {
  return (
    <article>
      <h1>Mentions légales</h1>

      <section>
        <h2>Éditeur du site</h2>
        <p>
          Site: {legalIdentity.brandName} ({legalIdentity.websiteUrl})
        </p>
        <p>Entrepreneur: {legalIdentity.editorName}</p>
        <p>Nom commercial: {legalIdentity.editorTradeName}</p>
        <p>Statut juridique: {legalIdentity.editorLegalForm}</p>
        <p>Capital social: {legalIdentity.editorCapital}</p>
        <p>Adresse: {legalIdentity.editorAddress}</p>
        <p>SIRET: {legalIdentity.editorSiret}</p>
        <p>Immatriculation: {legalIdentity.editorRegistration}</p>
        <p>TVA intracommunautaire: {legalIdentity.editorVatNumber}</p>
        <p>Directeur de la publication: {legalIdentity.publicationDirector}</p>
        <p>
          Contact: {legalIdentity.contactEmail} · {legalIdentity.contactPhone}
        </p>
      </section>

      <section>
        <h2>Hébergement</h2>
        <p>Hébergeur: {legalIdentity.hostName}</p>
        <p>Raison sociale: {legalIdentity.hostLegalName}</p>
        <p>Adresse: {legalIdentity.hostAddress}</p>
        <p>Téléphone: {legalIdentity.hostPhone}</p>
      </section>

      <section>
        <h2>Objet du service et limites</h2>
        <p>
          Le site propose une mise en relation informative via des fiches descriptives.
          Les contenus publiés ne constituent pas un avis médical, un diagnostic ou une
          promesse de résultat thérapeutique.
        </p>
      </section>

      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          La structure du site, les textes et les éléments graphiques sont protégés par
          le droit applicable. Toute reproduction non autorisée est interdite.
        </p>
      </section>

      <section>
        <h2>Données personnelles et cookies</h2>
        <p>
          Pour les informations relatives au traitement des données, consultez la page{" "}
          <Link href="/confidentialite">Politique de confidentialité</Link>.
        </p>
        <p>
          Les cookies de mesure d’audience Google Analytics 4 sont activés uniquement après
          consentement de l’utilisateur via la bannière cookies.
        </p>
      </section>

      <section>
        <h2>Crédits cartographiques</h2>
        <p>
          Les fonctionnalités cartographiques s’appuient sur des services tiers, notamment
          Mapbox. Les droits et conditions associés à ces services restent applicables.
        </p>
      </section>
    </article>
  );
}
