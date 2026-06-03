import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCurrentPractitionerSession } from "@/lib/practitioner-auth";
import { PRACTITIONER_PLANS } from "@/lib/practitioner-plans";

export const metadata: Metadata = {
  title: "Espace praticien naturopathe",
  description:
    "Créez votre fiche naturopathe sur NaturoCarte, connectez-vous à votre espace praticien et choisissez l’offre adaptée à votre visibilité.",
  alternates: {
    canonical: "/praticiens"
  },
  openGraph: {
    title: "Espace praticien naturopathe | NaturoCarte",
    description:
      "Créez votre fiche naturopathe sur NaturoCarte, connectez-vous à votre espace praticien et choisissez l’offre adaptée à votre visibilité.",
    url: "/praticiens",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Espace praticien naturopathe | NaturoCarte",
    description:
      "Créez votre fiche naturopathe sur NaturoCarte, connectez-vous à votre espace praticien et choisissez l’offre adaptée à votre visibilité."
  }
};

type SearchParams = {
  auth?: string | string[];
  error?: string | string[];
  email?: string | string[];
};

function getParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function getAuthErrorMessage(error: string | null): string | null {
  switch (error) {
    case "invalid_email":
      return "Renseignez un email valide pour recevoir votre lien.";
    case "email_provider_missing":
      return "L’envoi d’email NaturoCarte n’est pas encore configuré. Ajoutez RESEND_API_KEY côté serveur.";
    case "email_failed":
      return "Le lien a été généré, mais l’email n’a pas pu être envoyé. Vérifiez l’expéditeur Resend.";
    case "auth_failed":
      return "Le lien n’a pas pu être validé ou généré. Demandez un nouveau lien de connexion.";
    case "account_failed":
      return "Votre compte a été validé, mais l’espace praticien n’a pas pu être initialisé.";
    case "server_error":
      return "Une erreur serveur a empêché l’envoi du lien. Réessayez dans quelques instants.";
    default:
      return error ? "La connexion n’a pas pu aboutir. Demandez un nouveau lien." : null;
  }
}

export default async function PractitionersPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const auth = getParam(resolvedSearchParams.auth);
  const error = getParam(resolvedSearchParams.error);
  const email = getParam(resolvedSearchParams.email);
  const session = await getCurrentPractitionerSession();
  const authErrorMessage = getAuthErrorMessage(error);

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
              <li aria-current="page">Espace praticien</li>
            </ol>
          </nav>

          <div className="page-hero-copy practitioners-hero-copy">
            <p className="page-eyebrow">Espace praticien</p>
            <h1>Créez et pilotez votre fiche NaturoCarte</h1>
            <p className="page-lead">
              Recevez un lien de connexion par email. Si c’est votre premier accès, votre fiche
              sera finalisée depuis le dashboard avec vos informations professionnelles.
            </p>

            {session ? (
              <Link className="btn practitioner-hero-dashboard-link" href="/praticiens/dashboard">
                Accéder à mon dashboard
              </Link>
            ) : (
              <form
                className="practitioner-login-form practitioner-login-form--hero"
                action="/api/practitioner-auth/magic-link"
                method="post"
              >
                <label className="practitioner-form-label" htmlFor="practitioner-email">
                  Email professionnel
                </label>
                <div className="practitioner-login-row">
                  <input
                    id="practitioner-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="practitioner-form-input"
                    placeholder="vous@cabinet.fr"
                    defaultValue={email ?? ""}
                  />
                  <button className="btn practitioner-login-submit" type="submit">
                    Inscription / Connexion
                  </button>
                </div>
                <p className="practitioner-login-note">
                  Aucun mot de passe à retenir. Le lien vous connecte ou crée votre espace si
                  c’est votre première visite.
                </p>
              </form>
            )}

            {auth === "sent" ? (
              <p className="practitioner-form-feedback practitioner-form-feedback--success">
                Le lien de connexion a été envoyé. Ouvrez votre email pour accéder à votre espace.
              </p>
            ) : null}

            {auth === "required" ? (
              <p className="practitioner-form-feedback practitioner-form-feedback--error">
                Connectez-vous pour accéder au dashboard praticien.
              </p>
            ) : null}

            {authErrorMessage ? (
              <p className="practitioner-form-feedback practitioner-form-feedback--error">
                {authErrorMessage}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section-shell practitioner-offers-section" id="offres">
        <div className="section-heading section-heading--stacked">
          <div>
            <p className="section-eyebrow">Offres praticiens</p>
            <h2>Une fiche gratuite, des options pour suivre votre visibilité</h2>
          </div>
          <p className="section-intro">
            Le forfait Présence suffit pour être affiché dans l’annuaire avec un contact public.
            Le forfait Visibilité+ ajoute le badge Partenaire NaturoCarte, les statistiques,
            les avis et les informations enrichies pour les praticiens qui veulent piloter leur
            présence plus finement.
          </p>
        </div>

        <div className="practitioner-plan-grid">
          {PRACTITIONER_PLANS.map((plan) => (
            <article key={plan.id} className="practitioner-plan-card">
              <div>
                <p className="practitioner-workspace-label">Le forfait {plan.name}</p>
                <h3>{plan.price}</h3>
                <p>{plan.summary}</p>
              </div>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </article>
  );
}
