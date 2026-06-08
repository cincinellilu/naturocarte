import { randomUUID } from "node:crypto";
import { createAppUrl } from "@/lib/app-url";
import { fetchAllSupabaseRows } from "@/lib/fetch-all-supabase-rows";
import {
  MANAGED_PROSPECT_STATUSES,
  PRACTITIONER_STATUS_BOUNCED,
  PRACTITIONER_STATUS_HIDDEN_CONTACTED,
  PRACTITIONER_STATUS_HIDDEN_PENDING_CONTACT,
  PRACTITIONER_STATUS_PUBLISHED,
  PRACTITIONER_STATUS_PUBLISHED_CONTACTED,
  PRACTITIONER_STATUS_PUBLISHED_CONTACTED_CLAIMED,
  PRACTITIONER_STATUS_PUBLISHED_CONTACTED_CLICKED,
  PRACTITIONER_STATUS_PUBLISHED_CONTACTED_NOT_CLAIMED
} from "@/lib/practitioner-status";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

const DEFAULT_FROM_EMAIL = "NaturoCarte <onboarding@resend.dev>";
const RESEND_BATCH_SIZE = 100;

export type AdminEmailAudienceKey =
  | "published_uncontacted"
  | "published_contacted"
  | "published_claimed"
  | "hidden_pending"
  | "hidden_contacted"
  | "all_managed";

export type AdminEmailAudienceDefinition = {
  key: AdminEmailAudienceKey;
  label: string;
  description: string;
  statuses: readonly string[];
};

export const ADMIN_EMAIL_AUDIENCES: readonly AdminEmailAudienceDefinition[] = [
  {
    key: "published_uncontacted",
    label: "Publiés, pas encore contactés",
    description: "Fiches visibles qui ont un email et n’ont encore reçu aucun email de prospection.",
    statuses: [PRACTITIONER_STATUS_PUBLISHED]
  },
  {
    key: "published_contacted",
    label: "Publiés, déjà contactés",
    description: "Fiches visibles déjà sollicitées par email.",
    statuses: [
      PRACTITIONER_STATUS_PUBLISHED_CONTACTED,
      PRACTITIONER_STATUS_PUBLISHED_CONTACTED_CLICKED,
      PRACTITIONER_STATUS_PUBLISHED_CONTACTED_NOT_CLAIMED
    ]
  },
  {
    key: "published_claimed",
    label: "Publiés, revendiqués",
    description: "Praticiens visibles qui ont déjà revendiqué leur fiche.",
    statuses: [PRACTITIONER_STATUS_PUBLISHED_CONTACTED_CLAIMED]
  },
  {
    key: "hidden_pending",
    label: "Masqués, pas encore contactés",
    description: "Fiches masquées en attente d’un premier contact.",
    statuses: [PRACTITIONER_STATUS_HIDDEN_PENDING_CONTACT]
  },
  {
    key: "hidden_contacted",
    label: "Masqués, déjà contactés",
    description: "Fiches masquées déjà contactées ou classées bounce.",
    statuses: [PRACTITIONER_STATUS_HIDDEN_CONTACTED, PRACTITIONER_STATUS_BOUNCED]
  },
  {
    key: "all_managed",
    label: "Tous les praticiens gérés",
    description: "Toutes les fiches du workflow NaturoCarte avec email exploitable.",
    statuses: [...MANAGED_PROSPECT_STATUSES]
  }
] as const;

export type AdminEmailAudienceSummary = {
  key: AdminEmailAudienceKey;
  label: string;
  description: string;
  recipientCount: number;
  suppressedCount: number;
  duplicateEmailCount: number;
};

type EmailablePractitionerRow = {
  id: string;
  slug: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  city: string | null;
  status: string;
};

export type AdminEmailRecipient = {
  practitionerId: string;
  slug: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  status: string;
};

type MarketingEmailCampaignRow = {
  id: string;
  audience_key: string;
  audience_label: string;
  name: string;
  from_email: string;
  subject_template: string;
  status: string;
  total_recipients: number;
  last_error: string | null;
  send_started_at: string | null;
  send_completed_at: string | null;
  sent_at: string | null;
  created_at: string;
};

type MarketingEmailRecipientRow = {
  campaign_id: string;
  status: string;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  complained_at: string | null;
  failed_at: string | null;
  unsubscribed_at: string | null;
};

type MarketingEmailWebhookRecipientRow = {
  id: string;
  campaign_id: string;
  practitioner_id: string | null;
  recipient_email: string;
  status: string;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  complained_at: string | null;
  failed_at: string | null;
  unsubscribed_at: string | null;
};

export type AdminEmailCampaignSummary = {
  id: string;
  audienceKey: string;
  audienceLabel: string;
  name: string;
  fromEmail: string;
  subject: string;
  status: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  complainedCount: number;
  failedCount: number;
  unsubscribedCount: number;
  lastError: string | null;
  createdAt: string;
  sendStartedAt: string | null;
  sendCompletedAt: string | null;
  sentAt: string | null;
};

export type MarketingEmailDashboardData = {
  audiences: AdminEmailAudienceSummary[];
  campaigns: AdminEmailCampaignSummary[];
  resendConfigured: boolean;
  webhookConfigured: boolean;
  defaultFromEmail: string;
};

type MarketingEmailCampaignStatus =
  | "draft"
  | "sending"
  | "sent"
  | "partially_failed"
  | "failed";

type MarketingEmailRecipientStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "delivery_delayed"
  | "bounced"
  | "complained"
  | "failed"
  | "suppressed"
  | "unsubscribed";

type ResendWebhookEvent = {
  type: string;
  created_at: string;
  data?: {
    email_id?: string;
    to?: string[];
    tags?: Record<string, string>;
    click?: { link?: string; timestamp?: string };
    bounce?: { message?: string; type?: string; subType?: string };
    subject?: string;
  };
};

const RECIPIENT_STATUS_PRIORITY: Record<MarketingEmailRecipientStatus, number> = {
  pending: 0,
  delivery_delayed: 1,
  sent: 2,
  delivered: 3,
  opened: 4,
  clicked: 5,
  failed: 6,
  suppressed: 7,
  bounced: 8,
  complained: 9,
  unsubscribed: 10
};

function normalizeText(value: string | null | undefined): string {
  return value?.trim() || "";
}

function normalizeEmail(value: string | null | undefined): string {
  return normalizeText(value).toLowerCase();
}

function getDefaultFromEmail(): string {
  return normalizeText(process.env.CONTACT_FROM_EMAIL) || DEFAULT_FROM_EMAIL;
}

function isAsciiSafeTagValue(value: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(value);
}

function sanitizeTagValue(value: string): string {
  const trimmed = normalizeText(value);
  if (isAsciiSafeTagValue(trimmed)) return trimmed;
  return trimmed.replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "na";
}

function getAudienceDefinition(key: string): AdminEmailAudienceDefinition {
  const definition = ADMIN_EMAIL_AUDIENCES.find((item) => item.key === key);
  if (!definition) {
    throw new Error(`Audience email inconnue: ${key}`);
  }

  return definition;
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function renderTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, rawKey) => {
    const key = rawKey.toLowerCase();
    return variables[key] ?? "";
  });
}

function ensureHtmlUnsubscribeFooter(html: string, unsubscribeUrl: string): string {
  if (html.toLowerCase().includes("unsubscribe_url")) {
    return html;
  }

  return `${html}
    <hr style="margin: 28px 0; border: 0; border-top: 1px solid #d6e2dd;" />
    <p style="font-size: 12px; color: #51625b;">
      Vous ne souhaitez plus recevoir d’emails NaturoCarte ?
      <a href="${unsubscribeUrl}" style="color: #0f766e;">Se désinscrire</a>
    </p>`;
}

function ensureTextUnsubscribeFooter(text: string, unsubscribeUrl: string): string {
  if (text.toLowerCase().includes("unsubscribe_url")) {
    return text;
  }

  return `${text.trim()}\n\nVous ne souhaitez plus recevoir d’emails NaturoCarte ?\n${unsubscribeUrl}`.trim();
}

function buildTemplateVariables(params: {
  request: Request;
  recipient: {
    firstName: string;
    lastName: string;
    email: string;
    city: string;
    slug: string;
    unsubscribeToken: string;
  };
}) {
  const profileUrl = createAppUrl(`/naturopathe/${params.recipient.slug}`, params.request).toString();
  const unsubscribeUrl = createAppUrl(
    `/desinscription?token=${encodeURIComponent(params.recipient.unsubscribeToken)}`,
    params.request
  ).toString();

  return {
    first_name: params.recipient.firstName,
    last_name: params.recipient.lastName,
    email: params.recipient.email,
    city: params.recipient.city,
    slug: params.recipient.slug,
    profile_url: profileUrl,
    unsubscribe_url: unsubscribeUrl
  };
}

async function loadEmailablePractitioners(): Promise<EmailablePractitionerRow[]> {
  const supabase = getSupabaseAdminClient();
  const rows = await fetchAllSupabaseRows<EmailablePractitionerRow>((from, to) =>
    supabase
      .from("practitioners")
      .select("id, slug, first_name, last_name, email, city, status")
      .in("status", [...MANAGED_PROSPECT_STATUSES])
      .not("email", "is", null)
      .order("slug", { ascending: true })
      .range(from, to)
  );

  return rows.filter((row) => Boolean(normalizeEmail(row.email)));
}

async function loadSuppressions(): Promise<Set<string>> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("marketing_email_suppressions")
    .select("email");

  if (error) {
    throw error;
  }

  return new Set((data ?? []).map((row) => normalizeEmail(row.email)).filter(Boolean));
}

function summarizeAudience(
  definition: AdminEmailAudienceDefinition,
  practitioners: EmailablePractitionerRow[],
  suppressions: Set<string>
): AdminEmailAudienceSummary {
  const seenEmails = new Set<string>();
  let recipientCount = 0;
  let duplicateEmailCount = 0;
  let suppressedCount = 0;

  for (const practitioner of practitioners) {
    if (!definition.statuses.includes(practitioner.status)) continue;

    const email = normalizeEmail(practitioner.email);
    if (!email) continue;

    if (suppressions.has(email)) {
      suppressedCount += 1;
      continue;
    }

    if (seenEmails.has(email)) {
      duplicateEmailCount += 1;
      continue;
    }

    seenEmails.add(email);
    recipientCount += 1;
  }

  return {
    key: definition.key,
    label: definition.label,
    description: definition.description,
    recipientCount,
    suppressedCount,
    duplicateEmailCount
  };
}

export async function listAdminEmailAudienceSummaries(): Promise<AdminEmailAudienceSummary[]> {
  const [practitioners, suppressions] = await Promise.all([
    loadEmailablePractitioners(),
    loadSuppressions()
  ]);

  return ADMIN_EMAIL_AUDIENCES.map((definition) =>
    summarizeAudience(definition, practitioners, suppressions)
  );
}

export async function resolveAdminEmailAudienceRecipients(
  audienceKey: string
): Promise<{ audience: AdminEmailAudienceDefinition; recipients: AdminEmailRecipient[] }> {
  const [practitioners, suppressions] = await Promise.all([
    loadEmailablePractitioners(),
    loadSuppressions()
  ]);
  const audience = getAudienceDefinition(audienceKey);
  const recipientsByEmail = new Map<string, AdminEmailRecipient>();

  for (const practitioner of practitioners) {
    if (!audience.statuses.includes(practitioner.status)) continue;

    const email = normalizeEmail(practitioner.email);
    if (!email || suppressions.has(email) || recipientsByEmail.has(email)) continue;

    recipientsByEmail.set(email, {
      practitionerId: practitioner.id,
      slug: normalizeText(practitioner.slug),
      firstName: normalizeText(practitioner.first_name),
      lastName: normalizeText(practitioner.last_name),
      email,
      city: normalizeText(practitioner.city),
      status: practitioner.status
    });
  }

  return {
    audience,
    recipients: [...recipientsByEmail.values()].sort((left, right) =>
      left.email.localeCompare(right.email, "fr")
    )
  };
}

export async function loadMarketingEmailDashboardData(): Promise<MarketingEmailDashboardData> {
  const supabase = getSupabaseAdminClient();
  const audiences = await listAdminEmailAudienceSummaries();

  const { data: campaigns, error: campaignsError } = await supabase
    .from("marketing_email_campaigns")
    .select(
      "id, audience_key, audience_label, name, from_email, subject_template, status, total_recipients, last_error, send_started_at, send_completed_at, sent_at, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(30);

  if (campaignsError) {
    throw campaignsError;
  }

  const campaignRows = (campaigns ?? []) as MarketingEmailCampaignRow[];
  const campaignIds = campaignRows.map((campaign) => campaign.id);

  const recipientRows =
    campaignIds.length === 0
      ? []
      : await fetchAllSupabaseRows<MarketingEmailRecipientRow>((from, to) =>
          supabase
            .from("marketing_email_recipients")
            .select(
              "campaign_id, status, sent_at, delivered_at, opened_at, clicked_at, bounced_at, complained_at, failed_at, unsubscribed_at"
            )
            .in("campaign_id", campaignIds)
            .order("created_at", { ascending: true })
            .range(from, to)
        );

  const recipientsByCampaign = new Map<string, MarketingEmailRecipientRow[]>();
  for (const row of recipientRows) {
    const list = recipientsByCampaign.get(row.campaign_id) ?? [];
    list.push(row);
    recipientsByCampaign.set(row.campaign_id, list);
  }

  const summaries = campaignRows.map((campaign) => {
    const rows = recipientsByCampaign.get(campaign.id) ?? [];
    return {
      id: campaign.id,
      audienceKey: campaign.audience_key,
      audienceLabel: campaign.audience_label,
      name: campaign.name,
      fromEmail: campaign.from_email,
      subject: campaign.subject_template,
      status: campaign.status,
      totalRecipients: campaign.total_recipients,
      sentCount: rows.filter((row) => row.sent_at).length,
      deliveredCount: rows.filter((row) => row.delivered_at).length,
      openedCount: rows.filter((row) => row.opened_at).length,
      clickedCount: rows.filter((row) => row.clicked_at).length,
      bouncedCount: rows.filter((row) => row.bounced_at).length,
      complainedCount: rows.filter((row) => row.complained_at).length,
      failedCount: rows.filter((row) => row.failed_at || row.status === "failed").length,
      unsubscribedCount: rows.filter((row) => row.unsubscribed_at).length,
      lastError: campaign.last_error,
      createdAt: campaign.created_at,
      sendStartedAt: campaign.send_started_at,
      sendCompletedAt: campaign.send_completed_at,
      sentAt: campaign.sent_at
    } satisfies AdminEmailCampaignSummary;
  });

  return {
    audiences,
    campaigns: summaries,
    resendConfigured: Boolean(normalizeText(process.env.RESEND_API_KEY)),
    webhookConfigured: Boolean(normalizeText(process.env.RESEND_WEBHOOK_SECRET)),
    defaultFromEmail: getDefaultFromEmail()
  };
}

async function sendBatchEmails(params: {
  apiKey: string;
  batchPayload: unknown[];
  idempotencyKey: string;
}) {
  const response = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": params.idempotencyKey
    },
    body: JSON.stringify(params.batchPayload)
  });

  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      details = await response.text();
    }

    return {
      ok: false as const,
      error: `Batch Resend error (${response.status})`,
      details
    };
  }

  const data = (await response.json()) as { data?: Array<{ id?: string }> };
  return { ok: true as const, ids: (data.data ?? []).map((item) => normalizeText(item.id)) };
}

async function sendSingleEmail(params: {
  apiKey: string;
  payload: unknown;
  idempotencyKey: string;
}) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": params.idempotencyKey
    },
    body: JSON.stringify(params.payload)
  });

  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      details = await response.text();
    }

    return {
      ok: false as const,
      error: `Send Resend error (${response.status})`,
      details
    };
  }

  const data = (await response.json()) as { id?: string };
  return { ok: true as const, id: normalizeText(data.id) };
}

export async function createAndSendAdminEmailCampaign(params: {
  request: Request;
  audienceKey: string;
  name: string;
  fromEmail: string;
  subjectTemplate: string;
  htmlTemplate: string;
  textTemplate: string;
}) {
  const apiKey = normalizeText(process.env.RESEND_API_KEY);
  if (!apiKey) {
    throw new Error("RESEND_API_KEY manquant.");
  }

  const audienceResult = await resolveAdminEmailAudienceRecipients(params.audienceKey);
  if (audienceResult.recipients.length === 0) {
    throw new Error("Aucun destinataire disponible pour cette audience.");
  }

  const name = normalizeText(params.name);
  const fromEmail = normalizeText(params.fromEmail) || getDefaultFromEmail();
  const subjectTemplate = normalizeText(params.subjectTemplate);
  const htmlTemplate = params.htmlTemplate.trim();
  const textTemplate = params.textTemplate.trim();

  if (!name) throw new Error("Nom de campagne manquant.");
  if (!subjectTemplate) throw new Error("Objet d’email manquant.");
  if (!htmlTemplate && !textTemplate) {
    throw new Error("Ajoute au moins une version HTML ou texte.");
  }

  const now = new Date().toISOString();
  const campaignId = randomUUID();
  const supabase = getSupabaseAdminClient();

  const campaignInsert = {
    id: campaignId,
    audience_key: audienceResult.audience.key,
    audience_label: audienceResult.audience.label,
    name,
    from_email: fromEmail,
    subject_template: subjectTemplate,
    html_template: htmlTemplate || `<pre>${textTemplate}</pre>`,
    text_template: textTemplate,
    status: "sending" as MarketingEmailCampaignStatus,
    total_recipients: audienceResult.recipients.length,
    send_started_at: now,
    created_at: now,
    updated_at: now
  };

  const { error: campaignInsertError } = await supabase
    .from("marketing_email_campaigns")
    .insert(campaignInsert);

  if (campaignInsertError) {
    throw campaignInsertError;
  }

  const recipientRows: Array<{
    id: string;
    campaign_id: string;
    practitioner_id: string;
    slug: string;
    recipient_email: string;
    recipient_first_name: string;
    recipient_last_name: string;
    city: string;
    unsubscribe_token: string;
    status: MarketingEmailRecipientStatus;
    tags: Record<string, string>;
    created_at: string;
    updated_at: string;
  }> = audienceResult.recipients.map((recipient) => ({
    id: randomUUID(),
    campaign_id: campaignId,
    practitioner_id: recipient.practitionerId,
    slug: recipient.slug,
    recipient_email: recipient.email,
    recipient_first_name: recipient.firstName,
    recipient_last_name: recipient.lastName,
    city: recipient.city,
    unsubscribe_token: randomUUID(),
    status: "pending",
    tags: {},
    created_at: now,
    updated_at: now
  }));

  for (const row of recipientRows) {
    row.tags = {
      campaign_id: sanitizeTagValue(campaignId),
      recipient_id: sanitizeTagValue(row.id),
      practitioner_id: sanitizeTagValue(row.practitioner_id || "none")
    };
  }

  const { error: recipientInsertError } = await supabase
    .from("marketing_email_recipients")
    .insert(recipientRows);

  if (recipientInsertError) {
    await supabase
      .from("marketing_email_campaigns")
      .update({
        status: "failed",
        last_error: recipientInsertError.message,
        updated_at: new Date().toISOString(),
        send_completed_at: new Date().toISOString()
      })
      .eq("id", campaignId);
    throw recipientInsertError;
  }

  let sentCount = 0;
  let failedCount = 0;
  let lastError: string | null = null;

  for (const [batchIndex, batch] of chunkArray(recipientRows, RESEND_BATCH_SIZE).entries()) {
    const batchPayload = batch.map((recipient) => {
      const variables = buildTemplateVariables({
        request: params.request,
        recipient: {
          firstName: recipient.recipient_first_name || "",
          lastName: recipient.recipient_last_name || "",
          email: recipient.recipient_email,
          city: recipient.city || "",
          slug: recipient.slug || "",
          unsubscribeToken: recipient.unsubscribe_token
        }
      });

      const renderedHtml = renderTemplate(htmlTemplate || `<pre>${textTemplate}</pre>`, variables);
      const renderedText = renderTemplate(textTemplate || stripHtml(renderedHtml), variables);

      return {
        from: fromEmail,
        to: [recipient.recipient_email],
        subject: renderTemplate(subjectTemplate, variables),
        html: ensureHtmlUnsubscribeFooter(renderedHtml, variables.unsubscribe_url),
        text: ensureTextUnsubscribeFooter(renderedText, variables.unsubscribe_url),
        tags: [
          {
            name: "campaign_id",
            value: sanitizeTagValue(campaignId)
          },
          {
            name: "recipient_id",
            value: sanitizeTagValue(recipient.id)
          },
          {
            name: "practitioner_id",
            value: sanitizeTagValue(recipient.practitioner_id || "none")
          }
        ]
      };
    });

    const batchResult = await sendBatchEmails({
      apiKey,
      batchPayload,
      idempotencyKey: `marketing-${campaignId}-${batchIndex}`
    });

    if (batchResult.ok && batchResult.ids.length === batch.length) {
      const updateRows = batch.map((recipient, index) => ({
        id: recipient.id,
        provider_email_id: batchResult.ids[index],
        status: "sent" as MarketingEmailRecipientStatus,
        sent_at: new Date().toISOString(),
        last_error: null,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from("marketing_email_recipients").upsert(updateRows);
      if (error) {
        throw error;
      }

      sentCount += batch.length;
      continue;
    }

    lastError = batchResult.ok ? "Réponse batch Resend incomplète." : JSON.stringify(batchResult.details);

    for (const [offset, recipient] of batch.entries()) {
      const variables = buildTemplateVariables({
        request: params.request,
        recipient: {
          firstName: recipient.recipient_first_name || "",
          lastName: recipient.recipient_last_name || "",
          email: recipient.recipient_email,
          city: recipient.city || "",
          slug: recipient.slug || "",
          unsubscribeToken: recipient.unsubscribe_token
        }
      });
      const renderedHtml = renderTemplate(htmlTemplate || `<pre>${textTemplate}</pre>`, variables);
      const renderedText = renderTemplate(textTemplate || stripHtml(renderedHtml), variables);

      const singleResult = await sendSingleEmail({
        apiKey,
        idempotencyKey: `marketing-${campaignId}-${batchIndex}-${offset}`,
        payload: {
          from: fromEmail,
          to: [recipient.recipient_email],
          subject: renderTemplate(subjectTemplate, variables),
          html: ensureHtmlUnsubscribeFooter(renderedHtml, variables.unsubscribe_url),
          text: ensureTextUnsubscribeFooter(renderedText, variables.unsubscribe_url),
          tags: [
            {
              name: "campaign_id",
              value: sanitizeTagValue(campaignId)
            },
            {
              name: "recipient_id",
              value: sanitizeTagValue(recipient.id)
            },
            {
              name: "practitioner_id",
              value: sanitizeTagValue(recipient.practitioner_id || "none")
            }
          ]
        }
      });

      if (singleResult.ok && singleResult.id) {
        sentCount += 1;
        const { error } = await supabase
          .from("marketing_email_recipients")
          .update({
            provider_email_id: singleResult.id,
            status: "sent",
            sent_at: new Date().toISOString(),
            last_error: null,
            updated_at: new Date().toISOString()
          })
          .eq("id", recipient.id);

        if (error) throw error;
      } else {
        failedCount += 1;
        lastError = singleResult.ok ? lastError : JSON.stringify(singleResult.details);
        const { error } = await supabase
          .from("marketing_email_recipients")
          .update({
            status: "failed",
            failed_at: new Date().toISOString(),
            last_error: singleResult.ok ? "Échec d’envoi." : JSON.stringify(singleResult.details),
            updated_at: new Date().toISOString()
          })
          .eq("id", recipient.id);

        if (error) throw error;
      }
    }
  }

  const completedAt = new Date().toISOString();
  const finalStatus: MarketingEmailCampaignStatus =
    failedCount === 0 ? "sent" : sentCount > 0 ? "partially_failed" : "failed";

  const { error: campaignUpdateError } = await supabase
    .from("marketing_email_campaigns")
    .update({
      status: finalStatus,
      last_error: lastError,
      sent_at: sentCount > 0 ? completedAt : null,
      send_completed_at: completedAt,
      updated_at: completedAt
    })
    .eq("id", campaignId);

  if (campaignUpdateError) {
    throw campaignUpdateError;
  }

  return {
    campaignId,
    sentCount,
    failedCount,
    totalRecipients: recipientRows.length,
    status: finalStatus
  };
}

function getMergedRecipientStatus(
  current: string,
  next: MarketingEmailRecipientStatus
): MarketingEmailRecipientStatus {
  const currentStatus = (current || "pending") as MarketingEmailRecipientStatus;
  return RECIPIENT_STATUS_PRIORITY[next] >= RECIPIENT_STATUS_PRIORITY[currentStatus]
    ? next
    : currentStatus;
}

function mapWebhookEventToRecipientStatus(eventType: string): MarketingEmailRecipientStatus | null {
  switch (eventType) {
    case "email.sent":
      return "sent";
    case "email.delivered":
      return "delivered";
    case "email.opened":
      return "opened";
    case "email.clicked":
      return "clicked";
    case "email.delivery_delayed":
      return "delivery_delayed";
    case "email.bounced":
      return "bounced";
    case "email.complained":
      return "complained";
    case "email.failed":
      return "failed";
    case "email.suppressed":
      return "suppressed";
    default:
      return null;
  }
}

export async function ingestResendEmailWebhook(params: {
  svixId: string;
  event: ResendWebhookEvent;
}) {
  const supabase = getSupabaseAdminClient();

  const { data: existing } = await supabase
    .from("marketing_email_events")
    .select("svix_id")
    .eq("svix_id", params.svixId)
    .maybeSingle();

  if (existing) {
    return { duplicate: true as const };
  }

  const data = params.event.data ?? {};
  const tags = data.tags ?? {};
  const providerEmailId = normalizeText(data.email_id);
  const recipientEmail = normalizeEmail(data.to?.[0]);
  const campaignId = normalizeText(tags.campaign_id) || null;
  const recipientId = normalizeText(tags.recipient_id) || null;
  const practitionerId =
    normalizeText(tags.practitioner_id) && tags.practitioner_id !== "none"
      ? normalizeText(tags.practitioner_id)
      : null;
  const occurredAt = normalizeText(data.click?.timestamp) || normalizeText(params.event.created_at);

  const { error: insertEventError } = await supabase.from("marketing_email_events").insert({
    svix_id: params.svixId,
    campaign_id: campaignId,
    recipient_id: recipientId,
    practitioner_id: practitionerId,
    provider_email_id: providerEmailId || null,
    event_type: params.event.type,
    recipient_email: recipientEmail || null,
    link_url: data.click?.link ?? null,
    occurred_at: occurredAt,
    payload: params.event
  });

  if (insertEventError) {
    throw insertEventError;
  }

  let recipient: MarketingEmailWebhookRecipientRow | null = null;

  if (recipientId) {
    const result = await supabase
      .from("marketing_email_recipients")
      .select(
        "id, campaign_id, practitioner_id, recipient_email, status, sent_at, delivered_at, opened_at, clicked_at, bounced_at, complained_at, failed_at, unsubscribed_at"
      )
      .eq("id", recipientId)
      .maybeSingle<MarketingEmailWebhookRecipientRow>();
    recipient = result.data ?? null;
  }

  if (!recipient && providerEmailId) {
    const result = await supabase
      .from("marketing_email_recipients")
      .select(
        "id, campaign_id, practitioner_id, recipient_email, status, sent_at, delivered_at, opened_at, clicked_at, bounced_at, complained_at, failed_at, unsubscribed_at"
      )
      .eq("provider_email_id", providerEmailId)
      .maybeSingle<MarketingEmailWebhookRecipientRow>();
    recipient = result.data ?? null;
  }

  if (!recipient && campaignId && recipientEmail) {
    const result = await supabase
      .from("marketing_email_recipients")
      .select(
        "id, campaign_id, practitioner_id, recipient_email, status, sent_at, delivered_at, opened_at, clicked_at, bounced_at, complained_at, failed_at, unsubscribed_at"
      )
      .eq("campaign_id", campaignId)
      .eq("recipient_email", recipientEmail)
      .maybeSingle<MarketingEmailWebhookRecipientRow>();
    recipient = result.data ?? null;
  }

  if (!recipient) {
    return { duplicate: false as const, recipientFound: false as const };
  }

  const nextStatus = mapWebhookEventToRecipientStatus(params.event.type);
  const updatePatch: Record<string, string | null> = {
    updated_at: new Date().toISOString(),
    last_event_at: occurredAt
  };

  if (providerEmailId) {
    updatePatch.provider_email_id = providerEmailId;
  }

  if (nextStatus) {
    updatePatch.status = getMergedRecipientStatus(recipient.status, nextStatus);
  }

  switch (params.event.type) {
    case "email.sent":
      updatePatch.sent_at = recipient.sent_at ?? occurredAt;
      break;
    case "email.delivered":
      updatePatch.delivered_at = recipient.delivered_at ?? occurredAt;
      break;
    case "email.opened":
      updatePatch.opened_at = recipient.opened_at ?? occurredAt;
      break;
    case "email.clicked":
      updatePatch.clicked_at = recipient.clicked_at ?? occurredAt;
      break;
    case "email.bounced":
      updatePatch.bounced_at = recipient.bounced_at ?? occurredAt;
      updatePatch.last_error = data.bounce?.message ?? "Bounce Resend";
      break;
    case "email.complained":
      updatePatch.complained_at = recipient.complained_at ?? occurredAt;
      updatePatch.last_error = "Destinataire a signalé l’email comme spam.";
      break;
    case "email.failed":
      updatePatch.failed_at = recipient.failed_at ?? occurredAt;
      updatePatch.last_error = "Échec Resend.";
      break;
    case "email.suppressed":
      updatePatch.last_error = "Adresse supprimée par la suppression list Resend.";
      break;
    default:
      break;
  }

  const { error: updateRecipientError } = await supabase
    .from("marketing_email_recipients")
    .update(updatePatch)
    .eq("id", recipient.id);

  if (updateRecipientError) {
    throw updateRecipientError;
  }

  if (
    recipientEmail &&
    (params.event.type === "email.bounced" ||
      params.event.type === "email.complained" ||
      params.event.type === "email.suppressed")
  ) {
    const reason =
      params.event.type === "email.bounced"
        ? "bounced"
        : params.event.type === "email.complained"
          ? "complained"
          : "suppressed";

    const { error: suppressionError } = await supabase
      .from("marketing_email_suppressions")
      .upsert({
        email: recipientEmail,
        reason,
        source: "resend_webhook",
        campaign_id: recipient.campaign_id,
        practitioner_id: recipient.practitioner_id,
        details: params.event,
        updated_at: new Date().toISOString()
      });

    if (suppressionError) {
      throw suppressionError;
    }
  }

  return { duplicate: false as const, recipientFound: true as const };
}

export async function unsubscribeMarketingEmailByToken(token: string) {
  const supabase = getSupabaseAdminClient();
  const normalizedToken = normalizeText(token);

  if (!normalizedToken) {
    return { ok: false as const, code: "missing_token" as const };
  }

  const { data: recipient, error } = await supabase
    .from("marketing_email_recipients")
    .select("id, campaign_id, practitioner_id, recipient_email, unsubscribed_at")
    .eq("unsubscribe_token", normalizedToken)
    .maybeSingle<{
      id: string;
      campaign_id: string;
      practitioner_id: string | null;
      recipient_email: string;
      unsubscribed_at: string | null;
    }>();

  if (error) {
    throw error;
  }

  if (!recipient) {
    return { ok: false as const, code: "not_found" as const };
  }

  const email = normalizeEmail(recipient.recipient_email);
  const now = recipient.unsubscribed_at ?? new Date().toISOString();

  const { error: updateRecipientsError } = await supabase
    .from("marketing_email_recipients")
    .update({
      status: "unsubscribed",
      unsubscribed_at: now,
      updated_at: new Date().toISOString()
    })
    .eq("recipient_email", email)
    .is("unsubscribed_at", null);

  if (updateRecipientsError) {
    throw updateRecipientsError;
  }

  const { error: suppressionError } = await supabase
    .from("marketing_email_suppressions")
    .upsert({
      email,
      reason: "unsubscribed",
      source: "unsubscribe_page",
      campaign_id: recipient.campaign_id,
      practitioner_id: recipient.practitioner_id,
      details: { unsubscribe_token: normalizedToken },
      updated_at: new Date().toISOString()
    });

  if (suppressionError) {
    throw suppressionError;
  }

  return { ok: true as const, email };
}
