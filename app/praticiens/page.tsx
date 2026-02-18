import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Espace praticiens",
  description:
    "Demande de correction ou de revendication de fiche praticien.",
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
          Cet espace permet aux naturopathes de transmettre leurs informations
          professionnelles pour corriger ou compléter une fiche existante, être contactés
          si une précision est nécessaire et suivre les évolutions de l’annuaire. Le
          service est actuellement disponible sur une première zone, avec un déploiement
          progressif.
        </p>
      </section>

      <section className="practitioner-card practitioner-form-card">
        <h2>Formulaire d’inscription</h2>
        <p className="practitioner-form-intro">
          Renseignez votre email professionnel pour recevoir les prochaines étapes.
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

        {error === "db_error" || error === "server_error" ? (
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

        <form action="/api/lead-practitioner" method="post" className="practitioner-form">
          {normalizedClaim ? (
            <input type="hidden" name="claim" value={normalizedClaim} />
          ) : null}
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            className="practitioner-form-honeypot"
            aria-hidden="true"
          />

          <div className="practitioner-form-field">
            <label htmlFor="email" className="practitioner-form-label">
              Email professionnel
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="practitioner-form-input"
            />
            <p className="practitioner-form-help">
              Utilisez une adresse consultée régulièrement.
            </p>
            <p className="practitioner-form-help">
              En envoyant ce formulaire, vous acceptez d’être recontacté au sujet de votre
              fiche et de la gestion de votre demande.
            </p>
          </div>

          <p className="practitioner-form-actions">
            <button type="submit" className="btn">
              Envoyer
            </button>
          </p>
        </form>
      </section>

      <section>
          <h2>Tarif et accès</h2>
          <p>
            Le service est proposé à <strong>5€/mois</strong>. Lorsqu’un naturopathe est
            connecté et dispose d’un abonnement actif, il peut également retrouver ses
            factures depuis son espace.
          </p>
      </section>
    </article>
  );
}
