import { randomUUID } from "node:crypto";
import { getPractitionerClaimCampaignDefinition } from "@/lib/practitioner-claim-campaigns";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export type PractitionerClaimCampaignEmailRow = {
  id: string;
  campaign_id: string;
  campaign_version: string;
  subject_variant: number;
  recipient_email: string;
  practitioner_id: string | null;
  tracking_token: string;
  sent_at: string;
  clicked_at: string | null;
  claimed_at: string | null;
  status: string;
};

export function createPractitionerClaimCampaignTrackingToken(): string {
  return randomUUID();
}

export async function recordPractitionerClaimCampaignSend(params: {
  campaignId: string;
  recipientEmail: string;
  practitionerId?: string | null;
  trackingToken?: string;
  sentAt?: string;
}) {
  const definition = getPractitionerClaimCampaignDefinition(params.campaignId);
  if (!definition) {
    throw new Error(`Invalid practitioner claim campaign id: ${params.campaignId}`);
  }

  const supabase = getSupabaseAdminClient();
  const payload = {
    campaign_id: definition.campaignId,
    campaign_version: definition.version,
    subject_variant: definition.subjectVariant,
    recipient_email: params.recipientEmail.trim().toLowerCase(),
    practitioner_id: params.practitionerId ?? null,
    tracking_token: params.trackingToken ?? createPractitionerClaimCampaignTrackingToken(),
    sent_at: params.sentAt ?? new Date().toISOString(),
    status: "sent"
  };

  const { error } = await supabase.from("practitioner_claim_campaign_emails").upsert(payload, {
    onConflict: "campaign_id,recipient_email",
    ignoreDuplicates: true
  });

  if (error) {
    throw error;
  }

  return payload;
}

export async function recordPractitionerClaimCampaignClick(params: {
  trackingToken: string;
}) {
  const supabase = getSupabaseAdminClient();
  const now = new Date().toISOString();

  const { data: emailRow, error: fetchError } = await supabase
    .from("practitioner_claim_campaign_emails")
    .select("id, clicked_at, claimed_at, status")
    .eq("tracking_token", params.trackingToken)
    .maybeSingle<{ id: string; clicked_at: string | null; claimed_at: string | null; status: string }>();

  if (fetchError) {
    throw fetchError;
  }

  if (!emailRow) {
    return { ok: false as const, status: "not_found" as const };
  }

  if (emailRow.clicked_at) {
    return { ok: true as const, status: emailRow.status, clickedAt: emailRow.clicked_at };
  }

  const nextStatus = emailRow.claimed_at ? "claimed" : "clicked";
  const { error: updateError } = await supabase
    .from("practitioner_claim_campaign_emails")
    .update({
      clicked_at: now,
      status: nextStatus,
      updated_at: now
    })
    .eq("id", emailRow.id);

  if (updateError) {
    throw updateError;
  }

  return { ok: true as const, status: nextStatus, clickedAt: now };
}

export async function recordPractitionerClaimCampaignClaim(params: {
  campaignId?: string | null;
  recipientEmail: string;
  practitionerId: string;
  trackingToken?: string | null;
}) {
  const supabase = getSupabaseAdminClient();
  const now = new Date().toISOString();
  const email = params.recipientEmail.trim().toLowerCase();

  const { data: emailRowByToken, error: tokenError } = params.trackingToken?.trim()
    ? await supabase
        .from("practitioner_claim_campaign_emails")
        .select("id, clicked_at, claimed_at, status")
        .eq("tracking_token", params.trackingToken.trim())
        .maybeSingle<{
          id: string;
          clicked_at: string | null;
          claimed_at: string | null;
          status: string;
        }>()
    : { data: null, error: null };

  if (tokenError) {
    throw tokenError;
  }

  const { data: emailRowByCampaign, error: campaignError } = !emailRowByToken
    ? params.campaignId?.trim()
      ? await supabase
          .from("practitioner_claim_campaign_emails")
          .select("id, clicked_at, claimed_at, status")
          .eq("campaign_id", params.campaignId.trim())
          .eq("recipient_email", email)
          .maybeSingle<{
            id: string;
            clicked_at: string | null;
            claimed_at: string | null;
            status: string;
          }>()
      : { data: null, error: null }
    : { data: null, error: null };

  if (campaignError) {
    throw campaignError;
  }

  const emailRow = emailRowByToken ?? emailRowByCampaign;

  if (!emailRow) {
    return { ok: false as const, status: "not_found" as const };
  }

  const nextStatus = "claimed";
  const { error: updateError } = await supabase
    .from("practitioner_claim_campaign_emails")
    .update({
      practitioner_id: params.practitionerId,
      claimed_at: emailRow.claimed_at ?? now,
      status: nextStatus,
      updated_at: now
    })
    .eq("id", emailRow.id);

  if (updateError) {
    throw updateError;
  }

  return { ok: true as const, status: nextStatus, claimedAt: emailRow.claimed_at ?? now };
}
