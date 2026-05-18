import type { Metadata } from "next";
import Link from "next/link";
import PractitionerContactForm from "@/components/PractitionerContactForm";

export const metadata: Metadata = {
  title: "Espace praticiens",
  description:
    "Revendiquer, corriger ou enrichir votre fiche praticien sur NaturoCarte.",
  robots: {
    index: false,
    follow: true
  },
  alternates: {
    canonical: "/praticiens"
  }
};

type SearchParams = {
  claim?: string | string[];
  submitted?: string | string[];
  error?: string | string[];
};

export default async function PractitionersPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const claimParam = resolvedSearchParams.claim;
  const claim = Array.isArray(claimParam) ? claimParam[0] : claimParam;
  const normalizedClaim = claim?.trim() ? claim.trim() : null;
  const submittedParam = resolvedSearchParams.submitted;
  const submitted = Array.isArray(submittedParam) ? submittedParam[0] : submittedParam;
  const errorParam = resolvedSearchParams.error;
  const error = Array.isArray(errorParam) ? errorParam[0] : errorParam;

  return (
    <article className="praticiens-page">
      <section className="section-shell">
        <h1>Revendiquer, corriger ou enrichir votre fiche</h1>
        <p>
          Utilisez ce formulaire si vous êtes déjà présent sur NaturoCarte. Le lien depuis
          une fiche pré-remplit automatiquement votre demande.
        </p>
        <ul className="practitioner-edit-list">
          <li>Revendiquer une fiche et reprendre la main sur les informations publiques</li>
          <li>Corriger une adresse, un téléphone, un site web ou une description</li>
          <li>Ajouter des photos et préparer l’enrichissement futur de la fiche</li>
        </ul>
      </section>

      <section className="practitioner-card practitioner-form-card">
        <h2>Demande praticien</h2>
        <p className="practitioner-form-intro">
          Envoyez votre demande et nous revenons vers vous par email.
        </p>

        {submitted === "1" ? (
          <p className="practitioner-form-feedback practitioner-form-feedback--success">
            Merci, votre demande a bien été envoyée.
          </p>
        ) : null}

        {error === "invalid_email" ? (
          <p className="practitioner-form-feedback practitioner-form-feedback--error">
            Merci de renseigner un email valide.
          </p>
        ) : null}

        {error === "invalid_subject" ? (
          <p className="practitioner-form-feedback practitioner-form-feedback--error">
            Merci de sélectionner un sujet valide.
          </p>
        ) : null}

        {error === "missing_subject" ? (
          <p className="practitioner-form-feedback practitioner-form-feedback--error">
            Merci de renseigner le sujet de votre question.
          </p>
        ) : null}

        {error === "missing_phone" ? (
          <p className="practitioner-form-feedback practitioner-form-feedback--error">
            Merci de renseigner votre numéro de téléphone pour être recontacté.
          </p>
        ) : null}

        {error === "server_error" ? (
          <p className="practitioner-form-feedback practitioner-form-feedback--error">
            Une erreur est survenue pendant l’envoi. Merci de réessayer dans quelques
            instants.
          </p>
        ) : null}

        {normalizedClaim ? (
          <p className="practitioner-form-feedback practitioner-form-feedback--success">
            Fiche pré-remplie : {normalizedClaim}.{" "}
            <Link href={`/naturopathe/${encodeURIComponent(normalizedClaim)}`}>
              Voir la fiche concernée
            </Link>
          </p>
        ) : null}

        {!normalizedClaim ? (
          <p className="practitioner-form-intro">
            Si vous venez d’une fiche, le lien “Revendiquer ou corriger la fiche” la
            pré-remplit automatiquement ici.
          </p>
        ) : null}

        <PractitionerContactForm claim={normalizedClaim} />
      </section>
    </article>
  );
}
