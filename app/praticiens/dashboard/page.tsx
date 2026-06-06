import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PractitionerOnboardingForm from "@/components/PractitionerOnboardingForm";
import PractitionerWrongAccountNotice from "@/components/PractitionerWrongAccountNotice";
import { getCurrentPractitionerSession } from "@/lib/practitioner-auth";
import { getPractitionerProfileCompletion } from "@/lib/practitioner-profile-completion";
import {
  getPractitionerPlan,
  PRACTITIONER_PLAN_VISIBILITY,
  PRACTITIONER_PLANS
} from "@/lib/practitioner-plans";
import { isPublicPractitionerStatus } from "@/lib/practitioner-status";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard praticien",
  robots: {
    index: false,
    follow: false
  }
};

type SearchParams = {
  saved?: string | string[];
  error?: string | string[];
  plans?: string | string[];
  billing?: string | string[];
};

type PractitionerAccount = {
  id: string;
  auth_user_id: string;
  practitioner_id: string | null;
  email: string;
  plan: string;
  contact_slot: string;
  stripe_customer_id: string | null;
  stripe_subscription_status: string | null;
};

type Practitioner = {
  id: string;
  slug: string;
  first_name: string;
  last_name: string;
  siret: string | null;
  adresse: string | null;
  postal_code: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  booking_url: string | null;
  photo_url?: string | null;
  description: string | null;
  status: string;
};

type ExistingPractitionerByEmail = {
  id: string;
};

type ExistingPractitionerAccountLink = {
  id: string;
};

type StatsRow = {
  profile_views: number;
  contact_clicks: number;
  booking_clicks: number;
};

function getParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function getAddressLine(practitioner: Practitioner): string {
  return [practitioner.adresse, practitioner.postal_code, practitioner.city]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(", ");
}

function isPublicPractitioner(practitioner: Practitioner): boolean {
  return isPublicPractitionerStatus(practitioner.status);
}

function getDashboardErrorMessage(error: string | null): string | null {
  switch (error) {
    case "invalid_profile":
      return "Renseignez votre prénom, votre nom, un SIRET valide et une adresse complète.";
    case "missing_mapbox_token":
      return "La géolocalisation d’adresse n’est pas configurée : le token Mapbox est manquant.";
    case "address_not_found":
      return "L’adresse n’a pas pu être géolocalisée. Vérifiez le numéro, la voie, le code postal et la ville.";
    case "invalid_address":
      return "Renseignez une adresse complète avec numéro et voie, code postal à 5 chiffres et ville.";
    case "missing_account":
      return "Votre compte praticien n’a pas pu être retrouvé. Reconnectez-vous.";
    case "lookup_failed":
      return "La vérification du SIRET n’a pas pu aboutir. Réessayez dans quelques instants.";
    case "email_already_used":
      return "Une fiche existe déjà avec cet email, mais le SIRET renseigné ne correspond pas.";
    case "conflicting_existing_profile":
      return "Le SIRET et l’email correspondent à deux fiches différentes. Contactez NaturoCarte pour rattacher la bonne fiche.";
    case "missing_siret_column":
      return "La base de données n’est pas encore prête : la colonne SIRET manque sur la table des praticiens.";
    case "profile_creation_failed":
      return "La fiche n’a pas pu être créée. L’erreur technique a été journalisée côté serveur.";
    case "duplicate_siret":
      return "Une fiche existe déjà avec ce SIRET. Elle doit être rattachée au compte avant de continuer.";
    case "profile_publish_failed":
      return "La fiche a été trouvée, mais elle n’a pas pu être publiée automatiquement.";
    case "account_update_failed":
      return "La fiche a été trouvée, mais elle n’a pas pu être rattachée au compte.";
    case "missing_photo":
      return "Sélectionnez une photo avant de lancer l’envoi.";
    case "invalid_photo":
      return "La photo doit être au format JPG, PNG ou WebP, avec un poids maximum de 5 Mo.";
    case "paid_required":
      return "L’ajout d’une photo est disponible avec le forfait Visibilité+.";
    case "photo_upload_failed":
      return "La photo n’a pas pu être envoyée. Vérifiez que le bucket Supabase Storage est bien créé.";
    case "photo_save_failed":
      return "La photo a été envoyée, mais elle n’a pas pu être rattachée à votre fiche.";
    case "stripe_not_configured":
      return "La souscription Visibilité+ n’est pas encore configurée côté paiement.";
    case "portal_failed":
      return "L’espace de gestion Stripe n’a pas pu être ouvert. Réessayez dans quelques instants.";
    case "plan_failed":
      return "La souscription n’a pas pu être initialisée. Réessayez dans quelques instants.";
    case "delete_confirmation_required":
      return "Pour supprimer votre fiche, saisissez exactement SUPPRIMER dans le champ de confirmation.";
    case "profile_delete_failed":
      return "La fiche n’a pas pu être supprimée. Réessayez dans quelques instants.";
    default:
      return error ? "Une action n’a pas pu être enregistrée. Vérifiez les informations puis réessayez." : null;
  }
}

function getDashboardSuccessMessage(saved: string | null): string | null {
  if (saved === "claimed") {
    return null;
  }

  if (saved === "profile_deleted") {
    return "Votre fiche a été retirée de la carte et de l’annuaire.";
  }

  return saved ? "Modifications enregistrées." : null;
}

async function getProfileStats(practitionerId: string): Promise<StatsRow> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("practitioner_profile_stats")
      .select("profile_views, contact_clicks, booking_clicks")
      .eq("practitioner_id", practitionerId)
      .gte("date", startDate.toISOString().slice(0, 10));

    if (error || !data) {
      return { profile_views: 0, contact_clicks: 0, booking_clicks: 0 };
    }

    return data.reduce(
      (total, row) => ({
        profile_views: total.profile_views + (row.profile_views ?? 0),
        contact_clicks: total.contact_clicks + (row.contact_clicks ?? 0),
        booking_clicks: total.booking_clicks + (row.booking_clicks ?? 0)
      }),
      { profile_views: 0, contact_clicks: 0, booking_clicks: 0 }
    );
  } catch {
    return { profile_views: 0, contact_clicks: 0, booking_clicks: 0 };
  }
}

export default async function PractitionerDashboardPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getCurrentPractitionerSession();
  if (!session) {
    redirect("/praticiens?auth=required");
  }

  const params = await searchParams;
  const saved = getParam(params.saved);
  const error = getParam(params.error);
  const plans = getParam(params.plans);
  const billing = getParam(params.billing);
  const errorMessage = getDashboardErrorMessage(error);
  const successMessage = getDashboardSuccessMessage(saved);
  const isClaimedSuccess = saved === "claimed";
  const supabase = getSupabaseAdminClient();
  const { data: account } = await supabase
    .from("practitioner_accounts")
    .select("id, auth_user_id, practitioner_id, email, plan, contact_slot, stripe_customer_id, stripe_subscription_status")
    .eq("auth_user_id", session.userId)
    .maybeSingle<PractitionerAccount>();

  const plan = getPractitionerPlan(account?.plan);
  const isPaid = plan.id === PRACTITIONER_PLAN_VISIBILITY;
  const contactSlot = account?.contact_slot ?? "phone";

  let practitionerId = account?.practitioner_id ?? null;

  if (account && !practitionerId) {
    const { data: matchingPractitioners, error: matchingPractitionersError } = await supabase
      .from("practitioners")
      .select("id")
      .ilike("email", account.email)
      .limit(2)
      .returns<ExistingPractitionerByEmail[]>();

    if (!matchingPractitionersError && matchingPractitioners?.length === 1) {
      const matchingPractitionerId = matchingPractitioners[0]?.id ?? null;

      if (matchingPractitionerId) {
        const { data: existingLink, error: existingLinkError } = await supabase
          .from("practitioner_accounts")
          .select("id")
          .eq("practitioner_id", matchingPractitionerId)
          .neq("id", account.id)
          .maybeSingle<ExistingPractitionerAccountLink>();

        if (!existingLinkError && !existingLink) {
          const { error: linkError } = await supabase
            .from("practitioner_accounts")
            .update({
              practitioner_id: matchingPractitionerId,
              updated_at: new Date().toISOString()
            })
            .eq("id", account.id);

          if (!linkError) {
            practitionerId = matchingPractitionerId;
          }
        }
      }
    }
  }

  let practitioner: Practitioner | null = null;
  if (practitionerId) {
    const { data } = await supabase
      .from("practitioners")
      .select("id, slug, first_name, last_name, siret, adresse, postal_code, city, lat, lng, phone, email, website, booking_url, photo_url, description, status")
      .eq("id", practitionerId)
      .maybeSingle<Practitioner>();

    practitioner = data ?? null;
  }

  const stats = practitioner
    ? await getProfileStats(practitioner.id)
    : { profile_views: 0, contact_clicks: 0, booking_clicks: 0 };
  const profileCompletion = getPractitionerProfileCompletion({
    practitioner,
    plan: plan.id,
    contactSlot
  });

  return (
    <article className="article-shell practitioner-dashboard-page">
      <section className="dashboard-header">
        <div>
          <p className="page-eyebrow">Dashboard praticien</p>
          <h1>Votre fiche NaturoCarte</h1>
          <p className="page-lead">
            Connecté avec {session.email}. Gérez les informations visibles par les visiteurs
            et choisissez l’offre adaptée à votre usage.
          </p>
        </div>
        <form action="/praticiens/logout" method="post">
          <button className="btn btn-secondary" type="submit">
            Déconnexion
          </button>
        </form>
      </section>

      {successMessage ? (
        <p className="practitioner-form-feedback practitioner-form-feedback--success">
          {successMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="practitioner-form-feedback practitioner-form-feedback--error">
          {errorMessage}
        </p>
      ) : null}

      {isClaimedSuccess ? (
        <div className="dashboard-modal-backdrop" role="presentation">
          <section
            className="dashboard-modal dashboard-claim-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="claim-success-title"
          >
            <Link
              className="dashboard-modal-close"
              href="/praticiens/dashboard"
              aria-label="Fermer la confirmation"
            >
              ×
            </Link>
            <div>
              <p className="section-eyebrow">Fiche rattachée</p>
              <h2 id="claim-success-title">Votre fiche est maintenant reliée à votre espace</h2>
            </div>
            <p>
              Vous pouvez à présent compléter ou modifier les informations visibles sur votre
              fiche. Si vous souhaitez ajouter plus de détails, une photo, plusieurs contacts
              et suivre les statistiques, vous pouvez aussi passer au forfait Visibilité+.
            </p>
            <div className="dashboard-modal-actions dashboard-subscription-actions">
              <Link className="btn" href="/praticiens/dashboard#edition">
                Compléter ma fiche
              </Link>
              <Link className="btn btn-secondary" href="/praticiens/dashboard?plans=open#forfaits">
                Découvrir Visibilité+
              </Link>
            </div>
          </section>
        </div>
      ) : null}

      {billing === "success" ? (
        <div className="dashboard-modal-backdrop" role="presentation">
          <section
            className="dashboard-modal dashboard-subscription-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="subscription-success-title"
          >
            <Link
              className="dashboard-modal-close"
              href="/praticiens/dashboard"
              aria-label="Fermer la confirmation"
            >
              ×
            </Link>
            <div>
              <p className="section-eyebrow">Abonnement activé</p>
              <h2 id="subscription-success-title">Bienvenue dans Visibilité+</h2>
            </div>
            <p>
              Votre abonnement est bien pris en compte. Profitez maintenant des possibilités
              offertes par Visibilité+ : photo de profil, description enrichie, contacts
              complets et statistiques de consultation.
            </p>
            <div className="dashboard-modal-actions dashboard-subscription-actions">
              <Link className="btn" href="/praticiens/dashboard#edition">
                Enrichir ma fiche
              </Link>
              <Link className="btn btn-secondary" href="/praticiens/dashboard">
                Revenir au dashboard
              </Link>
            </div>
          </section>
        </div>
      ) : null}

      {!practitioner ? <PractitionerWrongAccountNotice completeHref="#finalisation-fiche" /> : null}

      {!practitioner ? (
        <section className="dashboard-empty-state" id="finalisation-fiche">
          <p className="section-eyebrow">Initialisation</p>
          <h2>Finalisez la création de votre fiche</h2>
          <p>
            Votre compte existe. Il manque seulement les informations professionnelles nécessaires
            pour créer et rattacher votre fiche NaturoCarte.
          </p>
          <PractitionerOnboardingForm />
        </section>
      ) : (
        <>
          <section className="dashboard-profile-summary">
            <div className="dashboard-profile-photo-card">
              <div className="dashboard-profile-avatar" aria-hidden="true">
                {practitioner.photo_url?.trim() ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={practitioner.photo_url.trim()} alt="" />
                ) : (
                  <>
                    {practitioner.first_name.slice(0, 1)}
                    {practitioner.last_name.slice(0, 1)}
                  </>
                )}
              </div>
              {isPaid ? (
                <form
                  className="dashboard-profile-photo-form"
                  action="/api/practitioner-dashboard/photo"
                  method="post"
                  encType="multipart/form-data"
                >
                  <label className="dashboard-photo-file">
                    <span>Changer la photo</span>
                    <input name="photo" type="file" accept="image/png,image/jpeg,image/webp" />
                  </label>
                  <button className="btn btn-secondary dashboard-photo-submit" type="submit">
                    Envoyer
                  </button>
                </form>
              ) : (
                <a className="dashboard-avatar-upgrade" href="/praticiens/dashboard?plans=open#forfaits">
                  <span className="dashboard-lock-icon" aria-hidden="true" />
                  Photo avec Visibilité+
                </a>
              )}
            </div>
            <div className="dashboard-edit-heading">
              <div>
                <p className="section-eyebrow">Fiche praticien</p>
                <h2>
                  {practitioner.first_name} {practitioner.last_name}
                </h2>
                <p>{getAddressLine(practitioner) || "Adresse à compléter pour apparaître correctement sur la carte."}</p>
                <a className="dashboard-inline-link" href="#adresse">
                  Modifier l’adresse du cabinet
                </a>
                <div className="dashboard-profile-badges">
                  <span>{isPublicPractitioner(practitioner) ? "Fiche publiée" : "Fiche à compléter"}</span>
                  {practitioner.siret ? <span>SIRET {practitioner.siret}</span> : null}
                  <span>Le forfait {plan.name}</span>
                </div>
              </div>
              {isPublicPractitioner(practitioner) ? (
                <Link className="btn btn-secondary" href={`/naturopathe/${practitioner.slug}`}>
                  Voir la fiche publique
                </Link>
              ) : (
                <a className="btn btn-secondary" href="#edition">
                  Compléter ma fiche
                </a>
              )}
            </div>
          </section>

          {!profileCompletion.isComplete ? (
            <section className="dashboard-completion-card" aria-labelledby="profile-completion-title">
              <div className="dashboard-completion-head">
                <div>
                  <p className="section-eyebrow">Complétion de la fiche</p>
                  <h2 id="profile-completion-title">
                    Votre fiche est complétée à {profileCompletion.percent} %
                  </h2>
                </div>
                <strong>{profileCompletion.percent} %</strong>
              </div>
              <div
                className="dashboard-completion-track"
                role="progressbar"
                aria-valuenow={profileCompletion.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Fiche complétée à ${profileCompletion.percent} %`}
              >
                <span style={{ width: `${profileCompletion.percent}%` }} />
              </div>
              <div className="dashboard-completion-missing">
                <p>À compléter pour atteindre 100 % avec le forfait {plan.name} :</p>
                <ul>
                  {profileCompletion.missingItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}

          <section className="dashboard-edit-section" id="edition">
            <form className="dashboard-profile-form" action="/api/practitioner-dashboard/profile" method="post">
              <fieldset className="dashboard-fieldset" id="adresse">
                <legend>Adresse du cabinet</legend>
                <p className="dashboard-help">
                  Cette adresse positionne votre fiche sur la carte. En cas de modification,
                  NaturoCarte recalcule automatiquement les coordonnées.
                </p>
                <div className="dashboard-address-grid">
                  <label className="practitioner-form-label">
                    Adresse
                    <input
                      className="practitioner-form-input"
                      name="adresse"
                      defaultValue={practitioner.adresse ?? ""}
                      placeholder="12 rue de la Paix"
                      required
                    />
                  </label>
                  <label className="practitioner-form-label">
                    Code postal
                    <input
                      className="practitioner-form-input"
                      name="postal_code"
                      defaultValue={practitioner.postal_code ?? ""}
                      inputMode="numeric"
                      pattern="[0-9]{5}"
                      placeholder="75001"
                      required
                    />
                  </label>
                  <label className="practitioner-form-label">
                    Ville
                    <input
                      className="practitioner-form-input"
                      name="city"
                      defaultValue={practitioner.city ?? ""}
                      placeholder="Paris"
                      required
                    />
                  </label>
                </div>
              </fieldset>

              <fieldset className="dashboard-fieldset">
                <legend>Contact public</legend>
                {!isPaid ? (
                  <p className="dashboard-help">
                    Avec le forfait Présence, un seul contact est affiché. Vous pouvez changer ce
                    choix quand vous le souhaitez.
                  </p>
                ) : null}

                <div className="dashboard-contact-choice">
                  {[
                    { id: "phone", label: "Téléphone", value: practitioner.phone ?? "" },
                    { id: "email", label: "Email", value: practitioner.email ?? "" },
                    { id: "booking_url", label: "Lien de réservation", value: practitioner.booking_url ?? "" }
                  ].map((field) => (
                    <label key={field.id} className="dashboard-contact-row">
                      {!isPaid ? (
                        <input
                          type="radio"
                          name="contact_slot"
                          value={field.id}
                          defaultChecked={contactSlot === field.id}
                        />
                      ) : (
                        <span className="dashboard-contact-dot" aria-hidden="true" />
                      )}
                      <span>{field.label}</span>
                      <input
                        className="practitioner-form-input"
                        name={field.id}
                        defaultValue={field.value}
                        placeholder={field.label}
                      />
                    </label>
                  ))}
                </div>
              </fieldset>

              {!isPaid ? (
                <section className="dashboard-fieldset dashboard-fieldset--enriched dashboard-fieldset--collapsed is-locked">
                  <div>
                    <p className="dashboard-fieldset-title">Informations enrichies</p>
                    <p className="dashboard-help">
                      Ajoutez une photo, un site web et une présentation plus complète de votre
                      approche lorsque vous activez le forfait Visibilité+.
                    </p>
                  </div>
                  <a className="dashboard-lock-callout dashboard-lock-callout--link" href="/praticiens/dashboard?plans=open#forfaits">
                    <span className="dashboard-lock-icon" aria-hidden="true" />
                    <strong>Disponible avec Visibilité+</strong>
                  </a>
                </section>
              ) : (
                <fieldset className="dashboard-fieldset dashboard-fieldset--enriched">
                  <legend>Informations enrichies</legend>
                  <p className="dashboard-help">
                    Ajoutez un site web et une présentation plus complète de votre approche.
                    La photo se gère directement depuis l’encadré de votre avatar.
                  </p>
                  <input
                    className="practitioner-form-input"
                    name="website"
                    defaultValue={practitioner.website ?? ""}
                    placeholder="Site web"
                  />
                  <textarea
                    className="practitioner-form-input"
                    name="description"
                    rows={5}
                    defaultValue={practitioner.description ?? ""}
                    placeholder="Description de votre approche"
                  />
                </fieldset>
              )}

              <button className="btn dashboard-save-btn" type="submit">
                Enregistrer ma fiche
              </button>
            </form>
          </section>

          <section className="dashboard-stats-section">
            <div className="dashboard-stats-heading">
              <div>
                <p className="section-eyebrow">Statistiques</p>
                <h2>Consultation de votre fiche</h2>
              </div>
              {!isPaid ? (
                <a className="btn" href="/praticiens/dashboard?plans=open#forfaits">
                  Passer à Visibilité+
                </a>
              ) : null}
            </div>

            <div className={`dashboard-stats-grid${isPaid ? "" : " is-locked"}`}>
              <div>
                <strong>{isPaid ? stats.profile_views : "128"}</strong>
                <span>vues sur 30 jours</span>
              </div>
              <div>
                <strong>{isPaid ? stats.contact_clicks : "24"}</strong>
                <span>clics contact</span>
              </div>
              <div>
                <strong>{isPaid ? stats.booking_clicks : "11"}</strong>
                <span>clics réservation</span>
              </div>
            </div>
            {!isPaid ? (
              <p className="dashboard-locked-note">
                Les données détaillées sont disponibles avec Visibilité+.
              </p>
            ) : null}
          </section>
        </>
      )}

      <details className="dashboard-plans-section" id="forfaits" open={plans === "open"}>
        <summary>Comparer les forfaits disponibles</summary>
        <div className="practitioner-plan-grid dashboard-plan-grid">
          {PRACTITIONER_PLANS.map((availablePlan) => (
            <article key={availablePlan.id} className="practitioner-plan-card">
              <div>
                <p className="practitioner-workspace-label">Le forfait {availablePlan.name}</p>
                <h3>{availablePlan.price}</h3>
                <p>{availablePlan.summary}</p>
              </div>
              <ul>
                {availablePlan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <form action="/api/practitioner-dashboard/plan" method="post">
                <input type="hidden" name="plan" value={availablePlan.id} />
                <button
                  className={availablePlan.id === plan.id ? "btn btn-secondary" : "btn"}
                  type="submit"
                  disabled={availablePlan.id === plan.id}
                >
                  {availablePlan.id === plan.id
                    ? "Forfait actuel"
                    : availablePlan.id === PRACTITIONER_PLAN_VISIBILITY
                      ? "Souscrire à Visibilité+"
                      : account?.stripe_customer_id
                        ? "Gérer mon abonnement"
                        : "Choisir ce forfait"}
                </button>
              </form>
            </article>
          ))}
        </div>
      </details>

      {practitioner ? (
        <section className="dashboard-danger-zone" aria-labelledby="delete-profile-title">
          <div>
            <p className="section-eyebrow">Zone sensible</p>
            <h2 id="delete-profile-title">Supprimer ma fiche NaturoCarte</h2>
            <p>
              Cette action retire votre fiche de la carte, de l’annuaire, des pages locales et de
              la recherche. Votre espace praticien reste accessible si vous souhaitez recréer une
              fiche plus tard.
            </p>
            {isPaid ? (
              <p>
                Si vous avez un abonnement Visibilité+, la suppression de la fiche ne résilie pas
                automatiquement l’abonnement. Utilisez le portail Stripe dans les forfaits pour le
                gérer.
              </p>
            ) : null}
          </div>
          <form className="dashboard-delete-profile-form" action="/api/practitioner-dashboard/delete-profile" method="post">
            <label className="practitioner-form-label">
              Saisissez SUPPRIMER pour confirmer
              <input
                className="practitioner-form-input"
                name="confirmation"
                autoComplete="off"
                placeholder="SUPPRIMER"
                required
              />
            </label>
            <button className="btn btn-secondary dashboard-danger-btn" type="submit">
              Supprimer ma fiche
            </button>
          </form>
        </section>
      ) : null}
    </article>
  );
}
