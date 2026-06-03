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
          NaturoCarte est un annuaire cartographique et local qui aide les utilisateurs à
          trouver des naturopathes à partir d’une carte, de pages locales et de fiches
          praticiens.
        </p>
        <p>
          Les fiches peuvent contenir des informations publiques, des informations
          communiquées par les praticiens ou des données mises à jour depuis leur espace
          praticien. NaturoCarte ne garantit pas la disponibilité, l’exactitude permanente
          ou l’exhaustivité de chaque information publiée.
        </p>
        <p>
          Les contenus publiés ne constituent pas un avis médical, un diagnostic, une
          prescription ou une promesse de résultat thérapeutique. Le choix et la prise de
          contact avec un praticien relèvent de la responsabilité de l’utilisateur.
        </p>
      </section>

      <section>
        <h2>Comptes praticiens et abonnements</h2>
        <p>
          Les praticiens peuvent créer un compte afin de compléter ou modifier leur fiche et,
          le cas échéant, souscrire à des fonctionnalités payantes. Les paiements et
          abonnements sont traités par Stripe, prestataire de paiement externe.
        </p>
        <p>
          Les conditions applicables aux comptes, forfaits et abonnements sont précisées dans les{" "}
          <Link href="/conditions-generales">conditions générales d’utilisation et de vente</Link>.
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
