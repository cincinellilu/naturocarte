import type { Metadata } from "next";
import AdminAuthGate from "@/components/admin/AdminAuthGate";
import AdminShell from "@/components/admin/AdminShell";
import AdminSparkline from "@/components/admin/AdminSparkline";
import {
  hasAdminProspectsAccess,
  isAdminProspectsConfigured
} from "@/lib/admin-prospects-auth";
import {
  ADMIN_EMAIL_AUDIENCES,
  loadMarketingEmailDashboardData,
  type MarketingEmailDashboardData
} from "@/lib/admin-emailing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Emailing NaturoCarte | Admin",
  robots: {
    index: false,
    follow: false
  }
};

function getErrorMessage(error: string | undefined, rawMessage: string | undefined): string | null {
  if (error === "invalid_password") return "Mot de passe incorrect.";
  if (error === "missing_config") return "Aucun mot de passe admin n’est configuré.";
  if (error === "unauthorized") return "Session admin expirée. Reconnecte-toi.";
  if (error === "send_failed") return rawMessage || "L’envoi de campagne a échoué.";
  return null;
}

function getNoticeMessage(notice: string | undefined): string | null {
  if (notice === "campaign_sent") {
    return "La campagne a été créée et envoyée via Resend.";
  }

  return null;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatRate(numerator: number, denominator: number): string {
  if (!denominator) return "0%";
  return `${Math.round((numerator / denominator) * 1000) / 10}%`;
}

export default async function AdminEmailingPage({
  searchParams
}: {
  searchParams: Promise<{
    error?: string | string[];
    message?: string | string[];
    notice?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const errorCode = Array.isArray(params.error) ? params.error[0] : params.error;
  const rawMessage = Array.isArray(params.message) ? params.message[0] : params.message;
  const noticeCode = Array.isArray(params.notice) ? params.notice[0] : params.notice;
  const errorMessage = getErrorMessage(errorCode, rawMessage);
  const noticeMessage = getNoticeMessage(noticeCode);

  if (!isAdminProspectsConfigured()) {
    return (
      <AdminAuthGate
        eyebrow="Admin emailing"
        title="Accès protégé"
        description="Connectez-vous pour gérer les audiences NaturoCarte, envoyer des campagnes et suivre les événements Resend."
        nextPath="/admin/emailing"
        errorMessage="Aucun mot de passe admin n’est configuré."
      />
    );
  }

  const hasAccess = await hasAdminProspectsAccess();
  if (!hasAccess) {
    return (
      <AdminAuthGate
        eyebrow="Admin emailing"
        title="Accès protégé"
        description="Connectez-vous pour gérer les audiences NaturoCarte, envoyer des campagnes et suivre les événements Resend."
        nextPath="/admin/emailing"
        errorMessage={errorMessage}
      />
    );
  }

  let data: MarketingEmailDashboardData | null = null;
  let loadError = false;

  try {
    data = await loadMarketingEmailDashboardData();
  } catch (error) {
    console.error("admin emailing fetch error", error);
    loadError = true;
  }

  if (loadError || !data) {
    return (
      <AdminShell
        section="emailing"
        eyebrow="Admin emailing"
        title="Emailing NaturoCarte"
        description="Audiences gérées dans NaturoCarte, envoi via l’API Resend et suivi des statuts directement dans la base."
        headerMeta={["Resend", "Migration requise"]}
      >
        <div className="admin-page">
          <p className="page-alert">
            Les tables `marketing_email_*` ne sont pas encore disponibles ou ne peuvent pas être
            lues. Applique d’abord la migration Supabase dédiée.
          </p>
        </div>
      </AdminShell>
    );
  }

  const totalRecipients = data.audiences.reduce(
    (sum, audience) => sum + audience.recipientCount,
    0
  );
  const totalSuppressed = data.audiences.reduce(
    (sum, audience) => sum + audience.suppressedCount,
    0
  );
  const totalDuplicates = data.audiences.reduce(
    (sum, audience) => sum + audience.duplicateEmailCount,
    0
  );
  const campaignTrend = data.campaigns
    .slice(0, 8)
    .map((campaign) => [campaign.name.slice(0, 12), campaign.sentCount] as const);
  const clickTrend = data.campaigns
    .slice(0, 8)
    .map((campaign) => [campaign.name.slice(0, 12), campaign.clickedCount] as const);

  return (
    <AdminShell
      section="emailing"
      eyebrow="Admin emailing"
      title="Emailing NaturoCarte"
      description="Audiences gérées dans NaturoCarte, envoi via l’API Resend, et suivi des statuts directement dans la base."
      headerMeta={["Resend", `${data.campaigns.length.toLocaleString("fr-FR")} campagnes suivies`]}
    >
      <div className="admin-page">
        {errorMessage ? <p className="page-alert">{errorMessage}</p> : null}
        {noticeMessage ? <p className="admin-flash admin-flash--success">{noticeMessage}</p> : null}

        {!data.resendConfigured ? (
          <p className="page-alert">
            `RESEND_API_KEY` est absent. L’outil est visible mais aucun envoi n’est possible.
          </p>
        ) : null}

        {!data.webhookConfigured ? (
          <p className="admin-flash admin-flash--warning">
            `RESEND_WEBHOOK_SECRET` n’est pas configuré. Les envois partiront, mais le suivi
            opened / clicked / bounced / delivered restera incomplet.
          </p>
        ) : null}

        <section className="admin-kpi-grid" aria-label="Résumé emailing">
          <div className="admin-kpi-card">
            <strong>{totalRecipients.toLocaleString("fr-FR")}</strong>
            <span>destinataires activables</span>
          </div>
          <div className="admin-kpi-card">
            <strong>{data.campaigns.length.toLocaleString("fr-FR")}</strong>
            <span>campagnes suivies</span>
          </div>
          <div className="admin-kpi-card">
            <strong>{totalSuppressed.toLocaleString("fr-FR")}</strong>
            <span>emails supprimés</span>
          </div>
          <div className="admin-kpi-card">
            <strong>{totalDuplicates.toLocaleString("fr-FR")}</strong>
            <span>doublons email neutralisés</span>
          </div>
        </section>

        <section className="admin-insight-grid">
          <section className="admin-panel">
            <div>
              <h2>Envois récents</h2>
              <p>Volume d’envoi par campagne pour repérer les variations de cadence.</p>
            </div>
            <AdminSparkline items={campaignTrend} valueLabel="volume des campagnes" />
          </section>

          <section className="admin-panel">
            <div>
              <h2>Clics récents</h2>
              <p>Signal d’engagement visible rapidement, même sur mobile.</p>
            </div>
            <AdminSparkline
              items={clickTrend}
              tone="blue"
              valueLabel="clics des campagnes"
            />
          </section>
        </section>

        <section className="admin-panel">
          <div>
            <h2>Audiences disponibles</h2>
            <p>
              Ces audiences sont dynamiques. Elles partent des statuts Supabase et
              excluent automatiquement les emails supprimés ou désinscrits.
            </p>
          </div>

          <div className="admin-audience-grid">
            {data.audiences.map((audience) => (
              <article className="admin-audience-card" key={audience.key}>
                <div className="admin-audience-head">
                  <h3>{audience.label}</h3>
                  <strong>{audience.recipientCount.toLocaleString("fr-FR")}</strong>
                </div>
                <p>{audience.description}</p>
                <dl className="admin-audience-meta">
                  <div>
                    <dt>Supprimés</dt>
                    <dd>{audience.suppressedCount}</dd>
                  </div>
                  <div>
                    <dt>Doublons</dt>
                    <dd>{audience.duplicateEmailCount}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-panel">
          <div>
            <h2>Nouvelle campagne</h2>
            <p>
              Variables disponibles: `{"{{first_name}}"}`, `{"{{last_name}}"}`, `{"{{email}}"}`,{" "}
              `{"{{city}}"}`, `{"{{profile_url}}"}`, `{"{{unsubscribe_url}}"}`.
            </p>
          </div>

          <form className="admin-form" action="/api/admin/emailing" method="post">
            <div className="admin-form-grid">
            <label className="admin-form-field">
              <span>Audience</span>
              <select name="audience_key" defaultValue={ADMIN_EMAIL_AUDIENCES[0].key} required>
                {data.audiences.map((audience) => (
                  <option key={audience.key} value={audience.key}>
                    {audience.label} ({audience.recipientCount})
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-form-field">
              <span>Nom interne</span>
              <input
                name="name"
                type="text"
                defaultValue="Prospection NaturoCarte"
                required
              />
            </label>

            <label className="admin-form-field admin-form-field--full">
              <span>Expéditeur</span>
              <input
                name="from_email"
                type="text"
                defaultValue={data.defaultFromEmail}
                required
              />
            </label>

            <label className="admin-form-field admin-form-field--full">
              <span>Objet</span>
              <input
                name="subject_template"
                type="text"
                placeholder="Exemple: Votre fiche NaturoCarte est déjà en ligne"
                required
              />
            </label>

            <label className="admin-form-field admin-form-field--full">
              <span>HTML</span>
              <textarea
                className="admin-textarea"
                name="html_template"
                rows={16}
                placeholder="<p>Bonjour {{first_name}},</p><p>...</p>"
                required
              />
            </label>

            <label className="admin-form-field admin-form-field--full">
              <span>Texte brut</span>
              <textarea
                className="admin-textarea"
                name="text_template"
                rows={10}
                placeholder={"Bonjour {{first_name}},\n\n..."}
              />
            </label>
            </div>

            <div className="admin-form-actions">
              <button className="btn" type="submit" disabled={!data.resendConfigured}>
                Envoyer la campagne
              </button>
              <p className="admin-inline-note">
                Resend limite le batch à 100 emails par requête. NaturoCarte découpe donc
                automatiquement la campagne en lots.
              </p>
            </div>
          </form>
        </section>

        <section className="admin-panel">
          <div>
            <h2>Historique des campagnes</h2>
            <p>
              Les ouvertures et clics exigent que le tracking Resend soit activé sur ton
              domaine d’envoi.
            </p>
          </div>

          {data.campaigns.length === 0 ? (
            <p className="admin-empty">Aucune campagne NaturoCarte envoyée pour le moment.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Campagne</th>
                    <th>Audience</th>
                    <th>Statut</th>
                    <th>Créée</th>
                    <th>Total</th>
                    <th>Envoyés</th>
                    <th>Délivrés</th>
                    <th>Ouverts</th>
                    <th>Clics</th>
                    <th>Bounces</th>
                    <th>Spam</th>
                    <th>Désinscrits</th>
                  </tr>
                </thead>
                <tbody>
                  {data.campaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td>
                        <strong>{campaign.name}</strong>
                        <div className="admin-microcopy">{campaign.subject}</div>
                      </td>
                      <td>{campaign.audienceLabel}</td>
                      <td>
                        <span className={`admin-status-badge status-${campaign.status}`}>
                          {campaign.status}
                        </span>
                        {campaign.lastError ? (
                          <div className="admin-microcopy">{campaign.lastError}</div>
                        ) : null}
                      </td>
                      <td>{formatDate(campaign.createdAt)}</td>
                      <td>{campaign.totalRecipients}</td>
                      <td>{campaign.sentCount}</td>
                      <td>
                        {campaign.deliveredCount}
                        <div className="admin-microcopy">
                          {formatRate(campaign.deliveredCount, campaign.sentCount)}
                        </div>
                      </td>
                      <td>
                        {campaign.openedCount}
                        <div className="admin-microcopy">
                          {formatRate(campaign.openedCount, campaign.sentCount)}
                        </div>
                      </td>
                      <td>
                        {campaign.clickedCount}
                        <div className="admin-microcopy">
                          {formatRate(campaign.clickedCount, campaign.sentCount)}
                        </div>
                      </td>
                      <td>{campaign.bouncedCount}</td>
                      <td>{campaign.complainedCount}</td>
                      <td>{campaign.unsubscribedCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
