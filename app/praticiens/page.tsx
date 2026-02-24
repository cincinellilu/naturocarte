import type { Metadata } from "next";
import Link from "next/link";
import PractitionerContactFormMounted from "@/components/PractitionerContactFormMounted";

export const metadata: Metadata = {
  title: "Espace praticiens",
  description:
    "Contact pour souscription ou demande de rappel praticien.",
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
      <h1>Espace praticiens</h1>

      <section>
        <p>
          Cet espace permet aux naturopathes de demander un rappel, de demander leur
          souscription à l’abonnement (5€/mois), ou de poser une question.
        </p>
      </section>

      <section className="practitioner-card practitioner-form-card">
        <h2>Formulaire de contact praticiens</h2>
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
          <p>
            Vous souhaitez revendiquer / corriger la fiche : {normalizedClaim}.{" "}
            <Link href={`/naturopathe/${encodeURIComponent(normalizedClaim)}`}>
              Voir la fiche concernée
            </Link>
          </p>
        ) : null}

        <PractitionerContactFormMounted claim={normalizedClaim} />
      </section>
    </article>
  );
}
