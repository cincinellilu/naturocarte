import Link from "next/link";
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
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  isStripeBillingConfigured,
  listStripeCustomerInvoices,
  type StripeInvoiceSummary
} from "@/lib/stripe";

type PlanFilter = "all" | PractitionerPlanId;

type PractitionerAccountRow = {
  id: string;
  email: string;
  plan: string;
  created_at: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_subscription_status: string | null;
  stripe_current_period_end: string | null;
  practitioners:
    | {
        id: string;
        first_name: string;
        last_name: string;
        slug: string;
        status: string | null;
        city: string | null;
        postal_code: string | null;
      }
    | Array<{
        id: string;
        first_name: string;
        last_name: string;
        slug: string;
        status: string | null;
        city: string | null;
        postal_code: string | null;
      }>
    | null;
};

type ClientBillingSummary = {
  invoices: StripeInvoiceSummary[];
  currentMonthPaid: boolean | null;
  error: boolean;
};

type ClientRow = PractitionerAccountRow & {
  billing: ClientBillingSummary;
};

function getErrorMessage(error: string | undefined): string | null {
  if (error === "invalid_password") return "Mot de passe incorrect.";
  if (error === "missing_config") return "Aucun mot de passe admin n’est configuré.";
  return null;
}

function getPractitioner(account: PractitionerAccountRow) {
  return Array.isArray(account.practitioners)
    ? account.practitioners[0] ?? null
    : account.practitioners;
}

function getPlanFilterTitle(planFilter: PlanFilter) {
  if (planFilter === PRACTITIONER_PLAN_PRESENCE) return "Clients avec le forfait Présence";
  if (planFilter === PRACTITIONER_PLAN_VISIBILITY) return "Clients avec le forfait Visibilité+";
  return "Clients actifs";
}

function getPlanFilterIntro(planFilter: PlanFilter) {
  if (planFilter === PRACTITIONER_PLAN_PRESENCE) {
    return "Comptes praticiens gratuits, sans facturation Stripe active attendue.";
  }

  if (planFilter === PRACTITIONER_PLAN_VISIBILITY) {
    return "Comptes praticiens payants, avec statut d’abonnement et factures Stripe quand disponibles.";
  }

  return "Vue commerciale de tous les comptes praticiens créés sur NaturoCarte.";
}

function isPaidInvoiceForCurrentMonth(invoice: StripeInvoiceSummary, now = new Date()) {
  if (invoice.status !== "paid") return false;

  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const periodStart = invoice.periodStart ? new Date(invoice.periodStart) : null;
  const periodEnd = invoice.periodEnd ? new Date(invoice.periodEnd) : null;
  const createdAt = invoice.createdAt ? new Date(invoice.createdAt) : null;

  if (periodStart && periodEnd) {
    return periodStart < monthEnd && periodEnd > monthStart;
  }

  return Boolean(createdAt && createdAt >= monthStart && createdAt < monthEnd);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Non renseigné";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function formatAmount(amount: number, currency: string | null) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: (currency ?? "eur").toUpperCase()
  }).format(amount / 100);
}

async function loadBilling(account: PractitionerAccountRow): Promise<ClientBillingSummary> {
  if (
    account.plan !== PRACTITIONER_PLAN_VISIBILITY ||
    !account.stripe_customer_id ||
    !isStripeBillingConfigured()
  ) {
    return {
      invoices: [],
      currentMonthPaid: account.plan === PRACTITIONER_PLAN_VISIBILITY ? null : false,
      error: false
    };
  }

  try {
    const invoices = await listStripeCustomerInvoices({
      customerId: account.stripe_customer_id,
      subscriptionId: account.stripe_subscription_id,
      limit: 8
    });

    return {
      invoices,
      currentMonthPaid: invoices.some((invoice) => isPaidInvoiceForCurrentMonth(invoice)),
      error: false
    };
  } catch (error) {
    console.error("admin client invoices fetch error", account.id, error);
    return {
      invoices: [],
      currentMonthPaid: null,
      error: true
    };
  }
}

async function loadClients(planFilter: PlanFilter): Promise<ClientRow[] | null> {
  const supabase = getSupabaseAdminClient();
  const rows = await fetchAllSupabaseRows<PractitionerAccountRow>((from, to) => {
    let query = supabase
      .from("practitioner_accounts")
      .select(
        "id, email, plan, created_at, stripe_customer_id, stripe_subscription_id, stripe_subscription_status, stripe_current_period_end, practitioners(id, first_name, last_name, slug, status, city, postal_code)"
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (planFilter !== "all") {
      query = query.eq("plan", planFilter);
    }

    return query;
  });

  return Promise.all(
    rows.map(async (account) => ({
      ...account,
      billing: await loadBilling(account)
    }))
  );
}

function AdminGate({ errorMessage }: { errorMessage: string | null }) {
  return (
    <article className="article-shell admin-page">
      <section className="admin-gate">
        <p className="page-eyebrow">Admin commercial</p>
        <h1>Accès protégé</h1>
        <p className="page-lead">
          Connectez-vous pour suivre les clients, les forfaits et les abonnements.
        </p>

        {errorMessage ? <p className="page-alert">{errorMessage}</p> : null}

        <form className="admin-login-form" action="/admin/prospects/login" method="post">
          <input type="hidden" name="next" value="/admin/clients" />
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

export default async function AdminClientsView({
  planFilter,
  errorCode
}: {
  planFilter: PlanFilter;
  errorCode?: string;
}) {
  const errorMessage = getErrorMessage(errorCode);

  if (!isAdminProspectsConfigured()) {
    return <AdminGate errorMessage="Aucun mot de passe admin n’est configuré." />;
  }

  const hasAccess = await hasAdminProspectsAccess();
  if (!hasAccess) {
    return <AdminGate errorMessage={errorMessage} />;
  }

  let clients: ClientRow[] | null = null;
  try {
    clients = await loadClients(planFilter);
  } catch (error) {
    console.error("admin clients fetch error", error);
  }

  const visibilityClients = clients?.filter((client) => client.plan === PRACTITIONER_PLAN_VISIBILITY) ?? [];
  const presenceClients = clients?.filter((client) => client.plan === PRACTITIONER_PLAN_PRESENCE) ?? [];
  const paidThisMonth = visibilityClients.filter((client) => client.billing.currentMonthPaid === true).length;
  const unpaidOrUnknown = visibilityClients.filter((client) => client.billing.currentMonthPaid !== true).length;

  return (
    <article className="article-shell admin-page">
      <section className="admin-page-header">
        <div>
          <p className="page-eyebrow">Admin commercial</p>
          <h1>{getPlanFilterTitle(planFilter)}</h1>
          <p className="page-lead">{getPlanFilterIntro(planFilter)}</p>
        </div>
        <div className="admin-links">
          <Link className="btn btn-secondary" href="/admin">
            Pilotage
          </Link>
          <Link className="btn btn-secondary" href="/admin/prospects">
            Prospects
          </Link>
          <Link className="btn btn-secondary" href="/admin/praticiens-actifs">
            Praticiens actifs
          </Link>
          <form action="/admin/prospects/logout" method="post">
            <button className="btn btn-secondary" type="submit">
              Déconnexion
            </button>
          </form>
        </div>
      </section>

      <nav className="admin-tabs" aria-label="Vues clients">
        <Link className={planFilter === "all" ? "admin-tab is-active" : "admin-tab"} href="/admin/clients">
          Tous les clients
        </Link>
        <Link
          className={planFilter === PRACTITIONER_PLAN_PRESENCE ? "admin-tab is-active" : "admin-tab"}
          href="/admin/clients/presence"
        >
          Forfait Présence
        </Link>
        <Link
          className={planFilter === PRACTITIONER_PLAN_VISIBILITY ? "admin-tab is-active" : "admin-tab"}
          href="/admin/clients/visibilite-plus"
        >
          Visibilité+
        </Link>
      </nav>

      {clients ? (
        <>
          <section className="admin-kpi-grid" aria-label="Indicateurs clients">
            <div className="admin-kpi-card">
              <strong>{clients.length.toLocaleString("fr-FR")}</strong>
              <span>Clients affichés</span>
            </div>
            <div className="admin-kpi-card">
              <strong>{presenceClients.length.toLocaleString("fr-FR")}</strong>
              <span>Forfait Présence</span>
            </div>
            <div className="admin-kpi-card">
              <strong>{visibilityClients.length.toLocaleString("fr-FR")}</strong>
              <span>Visibilité+</span>
            </div>
            <div className="admin-kpi-card">
              <strong>{paidThisMonth.toLocaleString("fr-FR")}</strong>
              <span>Visibilité+ payé ce mois</span>
            </div>
          </section>

          {unpaidOrUnknown > 0 && planFilter !== PRACTITIONER_PLAN_PRESENCE ? (
            <p className="admin-warning">
              {unpaidOrUnknown.toLocaleString("fr-FR")} compte(s) Visibilité+ n’ont pas de
              facture payée détectée pour le mois courant ou doivent être vérifiés dans Stripe.
            </p>
          ) : null}

          <section className="admin-panel admin-clients-panel">
            <div>
              <h2>Liste clients</h2>
              <p>
                Les factures sont lues depuis Stripe lorsque le compte possède un customer Stripe.
              </p>
            </div>

            <div className="admin-clients-list">
              {clients.length > 0 ? (
                clients.map((client) => <ClientCard key={client.id} client={client} />)
              ) : (
                <p className="admin-empty">Aucun client dans cette vue.</p>
              )}
            </div>
          </section>
        </>
      ) : (
        <p className="page-alert">Impossible de charger les clients pour le moment.</p>
      )}
    </article>
  );
}

function ClientCard({ client }: { client: ClientRow }) {
  const practitioner = getPractitioner(client);
  const plan = getPractitionerPlan(client.plan);
  const billingLabel =
    client.plan === PRACTITIONER_PLAN_PRESENCE
      ? "Sans facturation"
      : client.billing.currentMonthPaid === true
        ? "Payé ce mois"
        : client.billing.currentMonthPaid === false
          ? "Non payé ce mois"
          : "À vérifier";

  return (
    <article className="admin-client-card">
      <div className="admin-client-main">
        <div>
          <p className="admin-client-plan">Le forfait {plan.name}</p>
          <h3>
            {practitioner
              ? `${practitioner.first_name} ${practitioner.last_name}`
              : "Fiche non reliée"}
          </h3>
          <p>{client.email}</p>
          {practitioner ? (
            <p>
              {practitioner.city ?? "Ville non renseignée"} · fiche{" "}
              <Link href={`/naturopathe/${practitioner.slug}`}>/{practitioner.slug}</Link>
            </p>
          ) : null}
        </div>

        <div className="admin-client-statuses">
          <span className="admin-status-pill">{billingLabel}</span>
          <span className="admin-status-pill">
            Stripe: {client.stripe_subscription_status ?? "non relié"}
          </span>
          <span className="admin-status-pill">
            Renouvellement: {formatDate(client.stripe_current_period_end)}
          </span>
        </div>
      </div>

      <div className="admin-client-meta">
        <span>Compte créé le {formatDate(client.created_at)}</span>
        <span>Customer: {client.stripe_customer_id ?? "Non créé"}</span>
        <span>Subscription: {client.stripe_subscription_id ?? "Non créée"}</span>
      </div>

      {client.billing.error ? (
        <p className="admin-warning">Les factures Stripe n’ont pas pu être chargées.</p>
      ) : null}

      {client.billing.invoices.length > 0 ? (
        <div className="admin-invoice-list">
          {client.billing.invoices.slice(0, 4).map((invoice) => (
            <div className="admin-invoice-row" key={invoice.id}>
              <div>
                <strong>{invoice.number ?? invoice.id}</strong>
                <span>
                  {invoice.status ?? "statut inconnu"} · {formatAmount(invoice.amountPaid, invoice.currency)} ·{" "}
                  {formatDate(invoice.createdAt)}
                </span>
              </div>
              <div className="admin-invoice-actions">
                {invoice.hostedInvoiceUrl ? (
                  <a className="btn btn-secondary" href={invoice.hostedInvoiceUrl} target="_blank" rel="noreferrer">
                    Ouvrir
                  </a>
                ) : null}
                {invoice.invoicePdf ? (
                  <a className="btn btn-secondary" href={invoice.invoicePdf} target="_blank" rel="noreferrer">
                    PDF
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : client.plan === PRACTITIONER_PLAN_VISIBILITY ? (
        <p className="admin-empty">Aucune facture Stripe trouvée pour ce compte.</p>
      ) : null}
    </article>
  );
}
