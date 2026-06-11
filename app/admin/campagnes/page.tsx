import type { Metadata } from "next";
import AdminAuthGate from "@/components/admin/AdminAuthGate";
import AdminShell from "@/components/admin/AdminShell";
import AdminSparkline from "@/components/admin/AdminSparkline";
import {
  hasAdminProspectsAccess,
  isAdminProspectsConfigured
} from "@/lib/admin-prospects-auth";
import {
  getPractitionerClaimCampaignDefinition,
  PRACTITIONER_CLAIM_CAMPAIGN_IDS
} from "@/lib/practitioner-claim-campaigns";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Campagnes email | Admin NaturoCarte",
  robots: {
    index: false,
    follow: false
  }
};

type CampaignEmailRow = {
  campaign_id: string;
  sent_at: string;
  clicked_at: string | null;
  claimed_at: string | null;
  status: string;
};

function formatRate(value: number): string {
  return `${Math.round(value * 1000) / 10}%`;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function getErrorMessage(error: string | undefined): string | null {
  if (error === "invalid_password") return "Mot de passe incorrect.";
  if (error === "missing_config") return "Aucun mot de passe admin n’est configuré.";
  return null;
}

async function loadCampaignRows() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("practitioner_claim_campaign_emails")
    .select("campaign_id, sent_at, clicked_at, claimed_at, status")
    .order("campaign_id", { ascending: true })
    .order("sent_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as CampaignEmailRow[];
}

export default async function AdminCampaignsPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const params = await searchParams;
  const errorCode = Array.isArray(params.error) ? params.error[0] : params.error;
  const errorMessage = getErrorMessage(errorCode);

  if (!isAdminProspectsConfigured()) {
    return (
      <AdminAuthGate
        eyebrow="Admin campagnes"
        title="Accès protégé"
        description="Connectez-vous pour suivre les campagnes de revendication."
        nextPath="/admin/campagnes"
        errorMessage="Aucun mot de passe admin n’est configuré."
      />
    );
  }

  const hasAccess = await hasAdminProspectsAccess();
  if (!hasAccess) {
    return (
      <AdminAuthGate
        eyebrow="Admin campagnes"
        title="Accès protégé"
        description="Connectez-vous pour suivre les campagnes de revendication."
        nextPath="/admin/campagnes"
        errorMessage={errorMessage}
      />
    );
  }

  let rows: CampaignEmailRow[] = [];
  let hasError = false;

  try {
    rows = await loadCampaignRows();
  } catch (error) {
    console.error("admin campaigns fetch error", error);
    hasError = true;
  }

  const campaignStats = PRACTITIONER_CLAIM_CAMPAIGN_IDS.map((campaignId) => {
    const definition = getPractitionerClaimCampaignDefinition(campaignId);
    const campaignRows = rows.filter((row) => row.campaign_id === campaignId);
    const sentCount = campaignRows.length;
    const clickCount = campaignRows.filter((row) => row.clicked_at).length;
    const claimedCount = campaignRows.filter((row) => row.claimed_at).length;
    const firstSentAt = campaignRows[0]?.sent_at ?? null;
    const firstClickAt = campaignRows.find((row) => row.clicked_at)?.clicked_at ?? null;
    const firstClaimAt = campaignRows.find((row) => row.claimed_at)?.claimed_at ?? null;

    return {
      campaignId,
      version: definition?.version ?? campaignId[0],
      subjectVariant: definition?.subjectVariant ?? Number(campaignId[1]),
      sentCount,
      clickCount,
      claimedCount,
      clickRate: sentCount ? clickCount / sentCount : 0,
      claimRate: sentCount ? claimedCount / sentCount : 0,
      firstSentAt,
      firstClickAt,
      firstClaimAt
    };
  });

  const totals = campaignStats.reduce(
    (acc, stat) => {
      acc.sent += stat.sentCount;
      acc.clicked += stat.clickCount;
      acc.claimed += stat.claimedCount;
      return acc;
    },
    { sent: 0, clicked: 0, claimed: 0 }
  );

  return (
    <AdminShell
      section="campaigns"
      eyebrow="Admin campagnes"
      title="Campagnes de revendication"
      description="Suivi des envois, clics et fiches revendiquées par campagne."
      headerMeta={["15 variantes", `${totals.sent.toLocaleString("fr-FR")} envois suivis`]}
    >
      <div className="admin-page">
        {hasError ? (
          <p className="page-alert">Impossible de charger les campagnes pour le moment.</p>
        ) : (
          <>
            <section className="admin-kpi-grid" aria-label="Indicateurs campagnes">
              <div className="admin-kpi-card">
                <strong>{totals.sent.toLocaleString("fr-FR")}</strong>
                <span>Emails envoyés</span>
              </div>
              <div className="admin-kpi-card">
                <strong>{totals.clicked.toLocaleString("fr-FR")}</strong>
                <span>Clics uniques</span>
              </div>
              <div className="admin-kpi-card">
                <strong>{totals.claimed.toLocaleString("fr-FR")}</strong>
                <span>Fiches revendiquées</span>
              </div>
              <div className="admin-kpi-card">
                <strong>{formatRate(totals.sent ? totals.clicked / totals.sent : 0)}</strong>
                <span>Taux de clic global</span>
              </div>
            </section>

            <section className="admin-insight-grid">
              <section className="admin-panel">
                <div>
                  <h2>Volume par campagne</h2>
                  <p>Courbe des envois pour comparer rapidement les variantes.</p>
                </div>
                <AdminSparkline
                  items={campaignStats.map((stat) => [stat.campaignId, stat.sentCount] as const)}
                  valueLabel="volume par campagne"
                />
              </section>

              <section className="admin-panel">
                <div>
                  <h2>Revendications obtenues</h2>
                  <p>Nombre de fiches réellement revendiquées par variante.</p>
                </div>
                <AdminSparkline
                  items={campaignStats.map((stat) => [stat.campaignId, stat.claimedCount] as const)}
                  tone="amber"
                  valueLabel="revendications par campagne"
                />
              </section>
            </section>

            <section className="admin-panel">
              <div>
                <h2>Suivi par campagne</h2>
                <p>15 variantes, une ligne par combinaison A/B/C × objet 1 à 5.</p>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Campagne</th>
                      <th>Version</th>
                      <th>Objet</th>
                      <th>Envoyés</th>
                      <th>Clics</th>
                      <th>Revendiqués</th>
                      <th>Taux clic</th>
                      <th>Taux revendication</th>
                      <th>Premier envoi</th>
                      <th>Premier clic</th>
                      <th>Première revendication</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaignStats.map((stat) => (
                      <tr key={stat.campaignId}>
                        <td>
                          <strong>{stat.campaignId}</strong>
                        </td>
                        <td>{stat.version}</td>
                        <td>{stat.subjectVariant}</td>
                        <td>{stat.sentCount}</td>
                        <td>{stat.clickCount}</td>
                        <td>{stat.claimedCount}</td>
                        <td>{formatRate(stat.clickRate)}</td>
                        <td>{formatRate(stat.claimRate)}</td>
                        <td>{formatDate(stat.firstSentAt)}</td>
                        <td>{formatDate(stat.firstClickAt)}</td>
                        <td>{formatDate(stat.firstClaimAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </AdminShell>
  );
}
