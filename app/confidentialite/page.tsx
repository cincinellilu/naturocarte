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
          NaturoCarte collecte les données strictement nécessaires au fonctionnement du
          service, notamment les informations transmises via le formulaire praticiens:
          email professionnel, éventuelle référence de fiche revendiquée et métadonnées
          techniques minimales.
        </p>
      </section>

      <section>
        <h2>Finalités et bases légales</h2>
        <p>
          Les données sont utilisées pour traiter les demandes de correction/revendication
          de fiche et assurer le suivi des échanges avec les praticiens.
        </p>
        <p>
          Bases légales: intérêt légitime (gestion de l’annuaire), mesures précontractuelles
          et obligations légales le cas échéant.
        </p>
      </section>

      <section>
        <h2>Durée de conservation</h2>
        <p>
          Les données sont conservées pendant la durée nécessaire au traitement de la
          demande, puis archivées selon les obligations légales applicables.
        </p>
      </section>

      <section>
        <h2>Destinataires et sous-traitants</h2>
        <p>
          Les données sont accessibles uniquement aux personnes habilitées. Le site s’appuie
          sur des prestataires techniques (hébergement et base de données) agissant en
          qualité de sous-traitants.
        </p>
        <p>
          Pour la mesure d’audience, NaturoCarte utilise Google Analytics 4 (Google Ireland
          Limited), uniquement après consentement explicite.
        </p>
      </section>

      <section>
        <h2>Transferts hors UE</h2>
        <p>
          Certains prestataires techniques peuvent impliquer des transferts de données hors
          Union européenne, encadrés par des mécanismes juridiques appropriés.
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
