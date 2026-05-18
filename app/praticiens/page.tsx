import type { Metadata } from "next";
import Image from "next/image";
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
    <article className="article-shell article-shell--praticiens praticiens-page">
      <section className="page-hero page-hero--praticiens">
        <div className="page-hero-background practitioners-hero-background" aria-hidden="true">
          <Image
            src="https://images.pexels.com/photos/7219167/pexels-photo-7219167.jpeg?auto=compress&cs=tinysrgb&h=900&w=1600"
            alt=""
            fill
            sizes="100vw"
            priority
            className="home-hero-background-image practitioners-hero-background-image"
          />
          <div className="home-hero-background-scrim practitioners-hero-background-scrim" />
        </div>

        <div className="page-hero-grid practitioners-hero-grid">
          <nav className="breadcrumb-nav practitioners-hero-breadcrumb" aria-label="Fil d’Ariane">
            <ol>
              <li>
                <Link href="/">Accueil</Link>
              </li>
              <li aria-hidden="true">›</li>
              <li aria-current="page">Espace praticiens</li>
            </ol>
          </nav>

          <div className="page-hero-copy practitioners-hero-copy">
            <p className="page-eyebrow">Espace praticiens</p>
            <h1>Revendiquer, corriger ou enrichir votre fiche</h1>
            <p className="page-lead">
              Utilisez ce formulaire si vous êtes déjà présent sur NaturoCarte. Le lien depuis
              une fiche pré-remplit automatiquement votre demande.
            </p>

            <ul className="practitioner-edit-list">
              <li>Revendiquer une fiche et reprendre la main sur les informations publiques</li>
              <li>Corriger une adresse, un téléphone, un site web ou une description</li>
              <li>Ajouter des photos et préparer l’enrichissement futur de la fiche</li>
            </ul>

            <div className="hero-actions">
              <Link className="btn" href="#demande">
                Ouvrir le formulaire
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell practitioner-form-section" id="demande">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Demande praticien</p>
            <h2>Envoyez votre demande</h2>
          </div>
          <p className="section-intro">
            Réclamation, correction ou enrichissement : le formulaire s’adapte à votre besoin
            et nous revenons vers vous par email.
          </p>
        </div>

        <section className="practitioner-card practitioner-form-card">
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
      </section>
    </article>
  );
}
