import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUserSession } from "@/lib/user-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mon compte",
  robots: {
    index: false,
    follow: false
  }
};

type SearchParams = {
  auth?: string | string[];
  error?: string | string[];
  saved?: string | string[];
  next?: string | string[];
  favorite?: string | string[];
};

type UserAccount = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_seed: string | null;
};

type FavoriteRow = {
  id: string;
  created_at: string;
  practitioners: {
    slug: string;
    first_name: string;
    last_name: string;
    city: string | null;
    postal_code: string | null;
  } | null;
};

function getParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function getSafeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/compte";
  return value;
}

function getAccountErrorMessage(error: string | null): string | null {
  switch (error) {
    case "invalid_email":
      return "Renseignez un email valide.";
    case "email_provider_missing":
      return "Le lien de connexion n’a pas pu être envoyé pour le moment.";
    case "email_rate_limited":
      return "Trop de demandes d’envoi ont été faites. Attendez un peu puis réessayez.";
    case "email_failed":
      return "Le lien de connexion n’a pas pu être envoyé. Réessayez dans quelques instants.";
    case "auth_failed":
      return "Le lien n’a pas pu être validé. Demandez un nouveau lien de connexion.";
    case "account_failed":
      return "Le compte n’a pas pu être initialisé.";
    case "invalid_profile":
      return "Renseignez votre prénom, votre nom et un email valide.";
    case "email_update_failed":
      return "L’email n’a pas pu être mis à jour.";
    case "save_failed":
      return "Les informations n’ont pas pu être enregistrées.";
    default:
      return error ? "Une erreur est survenue. Réessayez." : null;
  }
}

function getInitials(account: UserAccount | null, email: string): string {
  const first = account?.first_name?.trim().charAt(0) ?? "";
  const last = account?.last_name?.trim().charAt(0) ?? "";
  const initials = `${first}${last}`.trim();
  return initials ? initials.toUpperCase() : email.charAt(0).toUpperCase();
}

export default async function AccountPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const session = await getCurrentUserSession();
  const auth = getParam(params.auth);
  const error = getParam(params.error);
  const saved = getParam(params.saved);
  const favorite = getParam(params.favorite);
  const nextPath = getSafeNextPath(getParam(params.next));
  const errorMessage = getAccountErrorMessage(error);

  let account: UserAccount | null = null;
  let favorites: FavoriteRow[] = [];

  if (session) {
    const supabase = getSupabaseAdminClient();
    const { data } = await supabase
      .from("user_accounts")
      .select("id, email, first_name, last_name, avatar_seed")
      .eq("auth_user_id", session.userId)
      .maybeSingle<UserAccount>();

    account = data ?? null;

    if (account) {
      const { data: favoriteRows } = await supabase
        .from("user_favorite_practitioners")
        .select("id, created_at, practitioners(slug, first_name, last_name, city, postal_code)")
        .eq("user_account_id", account.id)
        .order("created_at", { ascending: false })
        .returns<FavoriteRow[]>();

      favorites = favoriteRows ?? [];
    }
  }

  return (
    <article className="article-shell account-page">
      <nav className="breadcrumb-nav" aria-label="Fil d’Ariane">
        <ol>
          <li>
            <Link href="/">Accueil</Link>
          </li>
          <li aria-hidden="true">›</li>
          <li aria-current="page">Mon compte</li>
        </ol>
      </nav>

      {!session ? (
        <section className="account-auth-shell">
          <div className="account-auth-copy">
            <p className="section-eyebrow">Compte utilisateur</p>
            <h1>Connectez-vous à votre compte NaturoCarte.</h1>
            <p className="section-intro">
              Recevez un lien sécurisé par email pour retrouver vos naturopathes favoris,
              laisser un avis et gérer vos informations. Si votre compte n’existe pas encore,
              il sera créé automatiquement.
            </p>
          </div>

          {auth === "sent" ? (
            <p className="practitioner-form-feedback practitioner-form-feedback--success">
              Lien envoyé. Vérifiez votre boîte email pour ouvrir votre compte.
            </p>
          ) : null}
          {auth === "required" ? (
            <p className="practitioner-form-feedback practitioner-form-feedback--error">
              Connectez-vous pour continuer cette action.
            </p>
          ) : null}
          {errorMessage ? (
            <p className="practitioner-form-feedback practitioner-form-feedback--error">
              {errorMessage}
            </p>
          ) : null}

          <div className="account-auth-choice">
            <form className="account-login-form" action="/api/user-auth/magic-link" method="post">
              <input type="hidden" name="next" value={nextPath} />
              <div className="account-login-single">
                <label className="practitioner-form-label account-login-email">
                  Email
                  <input className="practitioner-form-input" name="email" type="email" autoComplete="email" required />
                </label>
                <button className="btn" type="submit">
                  Recevoir mon lien de connexion
                </button>
              </div>
            </form>

            <aside className="account-practitioner-access">
              <div>
                <p className="account-practitioner-title">Vous êtes naturopathe ?</p>
                <p>
                  Accédez à l’espace praticien pour créer, compléter ou suivre votre fiche NaturoCarte.
                </p>
              </div>
              <Link className="btn btn-secondary" href="/praticiens">
                Ouvrir l’espace praticien
              </Link>
            </aside>
          </div>
        </section>
      ) : (
        <>
          <section className="account-dashboard-shell">
            <div className="account-dashboard-head">
              <div className="account-avatar" aria-hidden="true">
                {getInitials(account, session.email)}
              </div>
              <div>
                <p className="section-eyebrow">Mon compte</p>
                <h1>
                  {account?.first_name || account?.last_name
                    ? `${account?.first_name ?? ""} ${account?.last_name ?? ""}`.trim()
                    : "Complétez votre profil"}
                </h1>
                <p className="section-intro">
                  Gérez vos informations et retrouvez les naturopathes ajoutés en favori.
                </p>
              </div>
              <form action="/compte/logout" method="post">
                <button className="btn btn-secondary" type="submit">
                  Déconnexion
                </button>
              </form>
            </div>

            {saved ? (
              <p className="practitioner-form-feedback practitioner-form-feedback--success">
                Modifications enregistrées.
              </p>
            ) : null}
            {favorite === "added" ? (
              <p className="practitioner-form-feedback practitioner-form-feedback--success">
                Praticien ajouté à vos favoris.
              </p>
            ) : null}
            {favorite === "removed" ? (
              <p className="practitioner-form-feedback practitioner-form-feedback--success">
                Praticien retiré de vos favoris.
              </p>
            ) : null}
            {errorMessage ? (
              <p className="practitioner-form-feedback practitioner-form-feedback--error">
                {errorMessage}
              </p>
            ) : null}

            <form className="account-profile-form" action="/api/user-profile" method="post">
              <label className="practitioner-form-label">
                Prénom
                <input
                  className="practitioner-form-input"
                  name="first_name"
                  defaultValue={account?.first_name ?? ""}
                  autoComplete="given-name"
                  required
                />
              </label>
              <label className="practitioner-form-label">
                Nom
                <input
                  className="practitioner-form-input"
                  name="last_name"
                  defaultValue={account?.last_name ?? ""}
                  autoComplete="family-name"
                  required
                />
              </label>
              <label className="practitioner-form-label account-profile-email">
                Email
                <input
                  className="practitioner-form-input"
                  name="email"
                  type="email"
                  defaultValue={account?.email ?? session.email}
                  autoComplete="email"
                  required
                />
              </label>
              <button className="btn account-save-btn" type="submit">
                Enregistrer mon profil
              </button>
            </form>
          </section>

          <section className="account-favorites-shell">
            <div className="account-section-head">
              <p className="section-eyebrow">Favoris</p>
              <h2>Naturopathes sauvegardés</h2>
            </div>

            {favorites.length > 0 ? (
              <ul className="account-favorite-list">
                {favorites.map((favoriteItem) => {
                  const practitioner = favoriteItem.practitioners;
                  if (!practitioner) return null;

                  return (
                    <li key={favoriteItem.id} className="account-favorite-item">
                      <div>
                        <strong>
                          {practitioner.first_name} {practitioner.last_name}
                        </strong>
                        <span>{[practitioner.city, practitioner.postal_code].filter(Boolean).join(" · ")}</span>
                      </div>
                      <div className="account-favorite-actions">
                        <Link className="btn btn-secondary" href={`/naturopathe/${practitioner.slug}`}>
                          Voir la fiche
                        </Link>
                        <form action="/api/user-favorites" method="post">
                          <input type="hidden" name="practitioner_slug" value={practitioner.slug} />
                          <input type="hidden" name="intent" value="remove" />
                          <input type="hidden" name="redirect" value="/compte" />
                          <button className="account-favorite-remove" type="submit">
                            Retirer
                          </button>
                        </form>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="account-empty-note">
                Aucun favori pour le moment. Ajoutez un naturopathe depuis une fiche ou depuis la carte.
              </p>
            )}
          </section>
        </>
      )}
    </article>
  );
}
