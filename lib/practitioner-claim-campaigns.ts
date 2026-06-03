import { getSiteUrl } from "@/lib/site";

export const PRACTITIONER_CLAIM_CAMPAIGN_IDS = [
  "A1",
  "A2",
  "A3",
  "A4",
  "A5",
  "B1",
  "B2",
  "B3",
  "B4",
  "B5",
  "C1",
  "C2",
  "C3",
  "C4",
  "C5"
] as const;

export type PractitionerClaimCampaignId = (typeof PRACTITIONER_CLAIM_CAMPAIGN_IDS)[number];
export type PractitionerClaimCampaignVersion = "A" | "B" | "C";

export type PractitionerClaimCampaignDefinition = {
  campaignId: PractitionerClaimCampaignId;
  version: PractitionerClaimCampaignVersion;
  subjectVariant: 1 | 2 | 3 | 4 | 5;
};

export type PractitionerClaimCampaignContext = {
  campaignId: PractitionerClaimCampaignId;
  trackingToken: string | null;
};

export const PRACTITIONER_CLAIM_CAMPAIGN_STORAGE_KEY =
  "naturocarte_practitioner_claim_campaign";

const PRACTITIONER_CLAIM_CAMPAIGN_DEFINITIONS: Record<
  PractitionerClaimCampaignId,
  PractitionerClaimCampaignDefinition
> = Object.fromEntries(
  PRACTITIONER_CLAIM_CAMPAIGN_IDS.map((campaignId) => [
    campaignId,
    {
      campaignId,
      version: campaignId[0] as PractitionerClaimCampaignVersion,
      subjectVariant: Number(campaignId[1]) as 1 | 2 | 3 | 4 | 5
    }
  ])
) as Record<PractitionerClaimCampaignId, PractitionerClaimCampaignDefinition>;

export function normalizePractitionerClaimCampaignId(
  value: string | null | undefined
): PractitionerClaimCampaignId | null {
  const normalized = value?.trim().toUpperCase();
  if (!normalized) return null;
  return PRACTITIONER_CLAIM_CAMPAIGN_IDS.includes(normalized as PractitionerClaimCampaignId)
    ? (normalized as PractitionerClaimCampaignId)
    : null;
}

export function getPractitionerClaimCampaignDefinition(
  value: string | null | undefined
): PractitionerClaimCampaignDefinition | null {
  const campaignId = normalizePractitionerClaimCampaignId(value);
  if (!campaignId) return null;

  return PRACTITIONER_CLAIM_CAMPAIGN_DEFINITIONS[campaignId];
}

export function buildPractitionerClaimCampaignUrl(params: {
  campaignId: PractitionerClaimCampaignId;
  trackingToken?: string | null;
}): string {
  const url = new URL("/revendiquer", getSiteUrl());
  url.searchParams.set("campaign", params.campaignId);

  if (params.trackingToken?.trim()) {
    url.searchParams.set("tracking", params.trackingToken.trim());
  }

  return url.toString();
}

