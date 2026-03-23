import type { Metadata } from "next";
import AdminProspectsDashboard, {
  type AdminProspect
} from "@/components/AdminProspectsDashboard";
import {
  hasAdminProspectsAccess,
  isAdminProspectsConfigured
} from "@/lib/admin-prospects-auth";
import { MANAGED_PROSPECT_STATUSES } from "@/lib/practitioner-status";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin prospects",
  robots: {
    index: false,
    follow: false
  }
};

function getErrorMessage(error: string | undefined): string | null {
  if (error === "invalid_password") {
    return "Mot de passe incorrect.";
  }

  if (error === "missing_config") {
    return "Ajoutez ADMIN_PROSPECTS_PASSWORD dans l’environnement avant d’utiliser cet admin.";
  }

  return null;
}

export default async function AdminProspectsPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const params = await searchParams;
  const errorCode = Array.isArray(params.error) ? params.error[0] : params.error;
  const errorMessage = getErrorMessage(errorCode);
  const isConfigured = isAdminProspectsConfigured();

  if (!isConfigured) {
    return (
      <article className="article-shell admin-page">
        <section className="admin-gate">
          <p className="page-eyebrow">Admin prospects</p>
          <h1>Configuration manquante</h1>
          <p className="page-lead">
            Définissez <code>ADMIN_PROSPECTS_PASSWORD</code> dans l’environnement pour
            activer cet espace.
          </p>
        </section>
      </article>
    );
  }

  const hasAccess = await hasAdminProspectsAccess();

  if (!hasAccess) {
    return (
      <article className="article-shell admin-page">
        <section className="admin-gate">
          <p className="page-eyebrow">Admin prospects</p>
          <h1>Accès protégé</h1>
          <p className="page-lead">
            Connectez-vous pour gérer les naturopathes à contacter et les retirer
            temporairement du site si nécessaire.
          </p>

          {errorMessage ? <p className="page-alert">{errorMessage}</p> : null}

          <form className="admin-login-form" action="/admin/prospects/login" method="post">
            <label className="admin-prospects-label" htmlFor="admin-password">
              Mot de passe admin
            </label>
            <input
              id="admin-password"
              className="admin-prospects-input"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
            <button className="btn" type="submit">
              Ouvrir l’admin
            </button>
          </form>
        </section>
      </article>
    );
  }

  let practitioners: AdminProspect[] = [];
  let hasError = false;

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("practitioners")
      .select("slug, first_name, last_name, adresse, postal_code, city, phone, email, website, status")
      .in("status", [...MANAGED_PROSPECT_STATUSES])
      .order("city", { ascending: true })
      .order("last_name", { ascending: true });

    if (error) {
      hasError = true;
    } else {
      practitioners = (data ?? []) as AdminProspect[];
    }
  } catch {
    hasError = true;
  }

  return (
    <article className="article-shell admin-page">
      <section className="admin-page-header">
        <div>
          <p className="page-eyebrow">Admin prospects</p>
          <h1>Suivi des naturopathes</h1>
          <p className="page-lead">
            Cochez <strong>Contacté</strong> quand la prise de contact est faite, et
            cochez <strong>Retiré du site</strong> pour masquer complètement une fiche
            pendant le suivi.
          </p>
        </div>

        <form action="/admin/prospects/logout" method="post">
          <button className="btn btn-secondary" type="submit">
            Déconnexion
          </button>
        </form>
      </section>

      {hasError ? (
        <p className="page-alert">
          Impossible de charger les praticiens pour le moment.
        </p>
      ) : (
        <AdminProspectsDashboard practitioners={practitioners} />
      )}
    </article>
  );
}
