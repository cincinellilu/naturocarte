import type { Metadata } from "next";
import Link from "next/link";
import AdminAuthGate from "@/components/admin/AdminAuthGate";
import AdminShell from "@/components/admin/AdminShell";
import {
  hasAdminProspectsAccess,
  isAdminProspectsConfigured
} from "@/lib/admin-prospects-auth";
import { fetchAllSupabaseRows } from "@/lib/fetch-all-supabase-rows";
import {
  getPractitionerPlan,
  PRACTITIONER_PLAN_PRESENCE,
  PRACTITIONER_PLAN_VISIBILITY,
  type PractitionerPlanId
} from "@/lib/practitioner-plans";
import { getPractitionerProfileCompletion } from "@/lib/practitioner-profile-completion";
import { isPublicPractitionerStatus } from "@/lib/practitioner-status";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Praticiens actifs | Admin NaturoCarte",
  robots: {
    index: false,
    follow: false
  }
};

type PlanFilter = "all" | PractitionerPlanId;

type PractitionerRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  slug: string | null;
  status: string | null;
  adresse: string | null;
  postal_code: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  email: string | null;
  booking_url: string | null;
  website: string | null;
  photo_url: string | null;
  description: string | null;
};

type PractitionerAccountRow = {
  id: string;
  email: string;
  plan: string | null;
  contact_slot: string | null;
  created_at: string | null;
  last_login_at: string | null;
  login_count: number | null;
  stripe_subscription_status: string | null;
  practitioners: PractitionerRow | PractitionerRow[] | null;
};

type ActivePractitionerRow = PractitionerAccountRow & {
  completionPercent: number;
  missingItems: string[];
};

type SearchParams = {
  plan?: string | string[];
  error?: string | string[];
};

function getErrorMessage(error: string | undefined): string | null {
  if (error === "invalid_password") return "Mot de passe incorrect.";
  if (error === "missing_config") return "Aucun mot de passe admin n’est configuré.";
  return null;
}

function getPlanFilter(value: string | string[] | undefined): PlanFilter {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === PRACTITIONER_PLAN_PRESENCE || raw === PRACTITIONER_PLAN_VISIBILITY) return raw;
  return "all";
}

function getPractitioner(account: PractitionerAccountRow): PractitionerRow | null {
  return Array.isArray(account.practitioners)
    ? account.practitioners[0] ?? null
    : account.practitioners;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Jamais";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function getSubscriptionLabel(account: PractitionerAccountRow) {
  if (account.plan !== PRACTITIONER_PLAN_VISIBILITY) return "Forfait gratuit";
  return "Forfait Visibilité+";
}

function isPublishedPractitionerAccount(account: PractitionerAccountRow): boolean {
  const practitioner = getPractitioner(account);
  return practitioner?.status ? isPublicPractitionerStatus(practitioner.status) : false;
}

function isPractitionerCreationStarted(account: PractitionerAccountRow): boolean {
  if (isPublishedPractitionerAccount(account)) return false;
  return Boolean(account.last_login_at) || Number(account.login_count ?? 0) > 0;
}

async function loadActivePractitioners(planFilter: PlanFilter): Promise<ActivePractitionerRow[]> {
  const supabase = getSupabaseAdminClient();
  const rows = await fetchAllSupabaseRows<PractitionerAccountRow>((from, to) => {
    let query = supabase
      .from("practitioner_accounts")
      .select(
        "id, email, plan, contact_slot, created_at, last_login_at, login_count, stripe_subscription_status, practitioners(id, first_name, last_name, slug, status, adresse, postal_code, city, lat, lng, phone, email, booking_url, website, photo_url, description)"
      )
      .order("last_login_at", { ascending: false, nullsFirst: false })
      .range(from, to);

    if (planFilter !== "all") {
      query = query.eq("plan", planFilter);
    }

    return query;
  });

  return rows.map((account) => {
    const practitioner = getPractitioner(account);
    const completion = getPractitionerProfileCompletion({
      practitioner,
      plan: account.plan,
      contactSlot: account.contact_slot
    });

    return {
      ...account,
      completionPercent: completion.percent,
      missingItems: completion.missingItems
    };
  });
}

export default async function ActivePractitionersAdminPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const errorCode = Array.isArray(params.error) ? params.error[0] : params.error;
  const errorMessage = getErrorMessage(errorCode);
  const planFilter = getPlanFilter(params.plan);

  if (!isAdminProspectsConfigured()) {
    return (
      <AdminAuthGate
        eyebrow="Admin praticiens"
        title="Accès protégé"
        description="Connectez-vous pour suivre l’activité des praticiens et les comptes à relancer."
        nextPath="/admin/praticiens-actifs"
        errorMessage="Aucun mot de passe admin n’est configuré."
      />
    );
  }

  const hasAccess = await hasAdminProspectsAccess();
  if (!hasAccess) {
    return (
      <AdminAuthGate
        eyebrow="Admin praticiens"
        title="Accès protégé"
        description="Connectez-vous pour suivre l’activité des praticiens et les comptes à relancer."
        nextPath="/admin/praticiens-actifs"
        errorMessage={errorMessage}
      />
    );
  }

  let practitioners: ActivePractitionerRow[] | null = null;
  try {
    practitioners = await loadActivePractitioners(planFilter);
  } catch (error) {
    console.error("admin active practitioners fetch error", error);
  }

  const rows = practitioners ?? [];
  const publishedRows = rows.filter(isPublishedPractitionerAccount);
  const unpublishedRows = rows.filter((row) => !isPublishedPractitionerAccount(row));
  const startedCreationRows = unpublishedRows.filter(isPractitionerCreationStarted);
  const visibilityRows = publishedRows.filter((row) => row.plan === PRACTITIONER_PLAN_VISIBILITY);
  const freeRows = publishedRows.filter((row) => row.plan !== PRACTITIONER_PLAN_VISIBILITY);
  const neverLoggedRows = publishedRows.filter((row) => !row.last_login_at);
  const completeRows = publishedRows.filter((row) => row.completionPercent === 100);

  return (
    <AdminShell
      section="practitioners"
      eyebrow="Admin praticiens"
      title="Praticiens actifs"
      description="Vue des comptes praticiens, de leur activité de connexion et de la complétion de leur fiche."
      headerMeta={["Mobile, tablette, desktop", `${publishedRows.length.toLocaleString("fr-FR")} fiches publiées`]}
    >
      <div className="admin-page">
        <nav className="admin-tabs" aria-label="Filtres praticiens actifs">
          <Link className={planFilter === "all" ? "admin-tab is-active" : "admin-tab"} href="/admin/praticiens-actifs">
            Tous
          </Link>
          <Link
            className={planFilter === PRACTITIONER_PLAN_PRESENCE ? "admin-tab is-active" : "admin-tab"}
            href="/admin/praticiens-actifs?plan=presence"
          >
            Forfait gratuit
          </Link>
          <Link
            className={planFilter === PRACTITIONER_PLAN_VISIBILITY ? "admin-tab is-active" : "admin-tab"}
            href="/admin/praticiens-actifs?plan=visibilite_plus"
          >
            Visibilité+
          </Link>
        </nav>

        {practitioners ? (
          <>
            <section className="admin-kpi-grid" aria-label="Indicateurs praticiens actifs">
              <div className="admin-kpi-card">
                <strong>{publishedRows.length.toLocaleString("fr-FR")}</strong>
                <span>Comptes affichés</span>
              </div>
              <div className="admin-kpi-card">
                <strong>{freeRows.length.toLocaleString("fr-FR")}</strong>
                <span>Forfait gratuit</span>
              </div>
              <div className="admin-kpi-card">
                <strong>{visibilityRows.length.toLocaleString("fr-FR")}</strong>
                <span>Visibilité+</span>
              </div>
              <div className="admin-kpi-card">
                <strong>{unpublishedRows.length.toLocaleString("fr-FR")}</strong>
                <span>Fiches non publiées</span>
              </div>
              <div className="admin-kpi-card">
                <strong>{startedCreationRows.length.toLocaleString("fr-FR")}</strong>
                <span>Fiches en cours de création</span>
              </div>
              <div className="admin-kpi-card">
                <strong>{neverLoggedRows.length.toLocaleString("fr-FR")}</strong>
                <span>Jamais reconnectés</span>
              </div>
              <div className="admin-kpi-card">
                <strong>{completeRows.length.toLocaleString("fr-FR")}</strong>
                <span>Fiches complètes</span>
              </div>
            </section>

            <section className="admin-panel admin-active-practitioners-panel">
              <div>
                <h2>Comptes praticiens publiés</h2>
                <p>
                  Cette liste n’affiche que les fiches publiées. Les fiches non publiées et les
                  créations commencées sont décomptées séparément ci-dessus.
                </p>
              </div>

              <div className="admin-active-practitioners-list">
                {publishedRows.length > 0 ? (
                  publishedRows.map((account) => (
                    <ActivePractitionerCard key={account.id} account={account} />
                  ))
                ) : (
                  <p className="admin-empty">Aucun praticien dans cette vue.</p>
                )}
              </div>
            </section>
          </>
        ) : (
          <p className="page-alert">
            Impossible de charger les praticiens actifs. Vérifiez que la migration d’activité
            praticien a bien été exécutée.
          </p>
        )}
      </div>
    </AdminShell>
  );
}

function ActivePractitionerCard({ account }: { account: ActivePractitionerRow }) {
  const practitioner = getPractitioner(account);
  const plan = getPractitionerPlan(account.plan);
  const displayName = practitioner
    ? `${practitioner.first_name ?? ""} ${practitioner.last_name ?? ""}`.trim() || "Nom incomplet"
    : "Fiche non reliée";

  return (
    <article className="admin-client-card admin-active-practitioner-card">
      <div className="admin-client-main">
        <div>
          <p className="admin-client-plan">Le forfait {plan.name}</p>
          <h3>{displayName}</h3>
          <p>{account.email}</p>
          {practitioner?.slug ? (
            <p>
              Fiche{" "}
              <Link href={`/naturopathe/${practitioner.slug}`}>
                /naturopathe/{practitioner.slug}
              </Link>
            </p>
          ) : null}
        </div>

        <div className="admin-client-statuses">
          <span className="admin-status-pill">{getSubscriptionLabel(account)}</span>
          <span className="admin-status-pill">Dernière connexion: {formatDate(account.last_login_at)}</span>
          <span className="admin-status-pill">
            {Number(account.login_count ?? 0).toLocaleString("fr-FR")} connexion(s)
          </span>
        </div>
      </div>

      <div className="admin-completion-row">
        <div>
          <strong>Complétion fiche</strong>
          <span>{account.completionPercent} %</span>
        </div>
        <div
          className="admin-completion-track"
          role="progressbar"
          aria-valuenow={account.completionPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${account.completionPercent}%` }} />
        </div>
      </div>

      {account.missingItems.length > 0 ? (
        <div className="admin-client-meta">
          <span>Manquants: {account.missingItems.join(", ")}</span>
        </div>
      ) : (
        <div className="admin-client-meta">
          <span>Fiche complète selon le forfait actuel.</span>
        </div>
      )}
    </article>
  );
}
