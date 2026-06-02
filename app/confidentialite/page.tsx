import type { Metadata } from "next";
import Link from "next/link";
import { legalIdentity } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité de NaturoCarte.",
  alternates: {
    canonical: "/confidentialite"
  },
  openGraph: {
    title: "Politique de confidentialité | NaturoCarte",
    description: "Politique de confidentialité de NaturoCarte.",
    url: "/confidentialite",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Politique de confidentialité | NaturoCarte",
    description: "Politique de confidentialité de NaturoCarte."
  }
};

export default function ConfidentialitePage() {
  return (
    <article>
      <h1>Politique de confidentialité</h1>

      <section>
        <h2>Responsable du traitement</h2>
        <p>
          Responsable: {legalIdentity.editorName} ({legalIdentity.brandName})
        </p>
        <p>
          Contact: {legalIdentity.contactEmail} · {legalIdentity.contactPhone}
        </p>
      </section>

      <section>
        <h2>Données traitées</h2>
        <p>
          NaturoCarte traite les données nécessaires au fonctionnement de l’annuaire, des
          fiches praticiens, des comptes et des services associés.
        </p>
        <p>
          Pour les visiteurs et utilisateurs: email, nom, prénom, préférences de favoris,
          avis déposés, notes, commentaires, informations de connexion et métadonnées
          techniques nécessaires à la sécurité du service.
        </p>
        <p>
          Pour les praticiens: email professionnel, nom, prénom, SIRET, adresse
          professionnelle, coordonnées publiques choisies, site web, lien de réservation,
          photo, description, forfait, identifiants de facturation Stripe et statistiques
          de consultation de la fiche.
        </p>
        <p>
          Les fiches déjà présentes dans l’annuaire peuvent provenir d’informations publiques
          disponibles en ligne, puis être complétées ou corrigées par le praticien concerné.
        </p>
      </section>

      <section>
        <h2>Finalités et bases légales</h2>
        <p>
          Les données sont utilisées pour exploiter l’annuaire, afficher les fiches
          praticiens, permettre la recherche par carte ou par zone, gérer les comptes,
          envoyer les liens de connexion, enregistrer les favoris, recueillir les avis,
          permettre aux praticiens de modifier leur fiche et gérer les abonnements payants.
        </p>
        <p>
          Les statistiques de fiche servent à mesurer les consultations et interactions
          utiles au praticien, notamment les vues de fiche, ouvertures depuis la carte et
          clics vers les moyens de contact.
        </p>
        <p>
          Bases légales: exécution du contrat ou mesures précontractuelles pour les comptes
          et abonnements, intérêt légitime pour l’exploitation de l’annuaire, la sécurité et
          les statistiques internes, consentement pour les cookies de mesure d’audience, et
          obligations légales pour la facturation.
        </p>
      </section>

      <section>
        <h2>Durée de conservation</h2>
        <p>
          Les données de compte sont conservées pendant la durée d’utilisation du service,
          puis supprimées ou archivées selon les obligations légales applicables. Les données
          de facturation sont conservées pendant les durées légales requises.
        </p>
        <p>
          Les avis, favoris, photos et informations de fiche sont conservés tant que le
          compte ou la fiche concernée est actif, sauf demande de suppression ou obligation
          contraire. Les statistiques opérationnelles sont conservées le temps nécessaire au
          suivi du service.
        </p>
      </section>

      <section>
        <h2>Destinataires et sous-traitants</h2>
        <p>
          Les données sont accessibles uniquement aux personnes habilitées et aux
          prestataires nécessaires au fonctionnement du service.
        </p>
        <p>
          NaturoCarte utilise notamment Infomaniak pour l’hébergement, Supabase pour la base
          de données, l’authentification et le stockage, Resend pour l’envoi des emails de
          connexion, Stripe pour les abonnements et paiements, Mapbox pour les cartes et
          services de géocodage, et Google Analytics 4 pour la mesure d’audience après
          consentement.
        </p>
        <p>
          Les coordonnées bancaires ne sont pas stockées par NaturoCarte. Elles sont traitées
          par Stripe. NaturoCarte conserve uniquement les informations nécessaires au suivi
          de l’abonnement, comme l’identifiant client, l’identifiant d’abonnement, le statut
          et les dates utiles.
        </p>
      </section>

      <section>
        <h2>Transferts hors UE</h2>
        <p>
          Certains prestataires techniques peuvent impliquer des transferts de données hors
          Union européenne. Dans ce cas, ces transferts sont encadrés par les garanties
          prévues par la réglementation applicable.
        </p>
      </section>

      <section>
        <h2>Vos droits</h2>
        <p>
          Vous pouvez demander l’accès, la rectification, l’effacement, la limitation ou
          l’opposition au traitement de vos données, ainsi que la portabilité lorsque
          applicable, en contactant {legalIdentity.contactEmail}.
        </p>
        <p>
          En cas de désaccord, vous pouvez introduire une réclamation auprès de la CNIL.
        </p>
      </section>

      <section>
        <h2>Cookies et traceurs</h2>
        <p>
          Le site utilise:
        </p>
        <p>
          1. Des cookies strictement nécessaires au fonctionnement du site et des services
          cartographiques.
        </p>
        <p>
          2. Des cookies de mesure d’audience Google Analytics 4 uniquement si vous cliquez
          sur “Accepter” dans la bannière cookies.
        </p>
        <p>
          Vous pouvez modifier votre choix à tout moment via le lien “Gérer mes cookies”
          disponible dans le pied de page.
        </p>
        <p>
          Durée de conservation du choix de consentement: 6 mois. Les cookies Analytics
          sont ensuite gérés selon la politique de Google.
        </p>
        <p>
          Pour les informations éditeur/hébergeur, consultez{" "}
          <Link href="/mentions-legales">les mentions légales</Link>.
        </p>
      </section>
    </article>
  );
}
