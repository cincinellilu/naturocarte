import { NextResponse } from "next/server";
import { recordPractitionerClaimCampaignClick } from "@/lib/practitioner-claim-campaigns-server";
import { normalizePractitionerClaimCampaignId } from "@/lib/practitioner-claim-campaigns";

type ClickPayload = {
  campaign?: unknown;
  tracking?: unknown;
  tracking_token?: unknown;
};

function normalizeToken(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as ClickPayload;
  const campaignId = normalizePractitionerClaimCampaignId(
    typeof payload.campaign === "string" ? payload.campaign : null
  );
  const trackingToken = normalizeToken(payload.tracking) || normalizeToken(payload.tracking_token);

  if (!campaignId || !trackingToken) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  try {
    const result = await recordPractitionerClaimCampaignClick({ trackingToken });
    if (!result.ok) {
      return NextResponse.json({ ok: true, status: "not_found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      status: result.status,
      clicked_at: result.clickedAt
    });
  } catch (error) {
    console.error("practitioner claim campaign click failed", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

