import { NextResponse } from "next/server";
import { createAndSendAdminEmailCampaign } from "@/lib/admin-emailing";
import { hasAdminProspectsAccess } from "@/lib/admin-prospects-auth";

function getRedirectUrl(request: Request): URL {
  return new URL("/admin/emailing", request.url);
}

function normalizeText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const hasAccess = await hasAdminProspectsAccess();
  const redirectUrl = getRedirectUrl(request);

  if (!hasAccess) {
    redirectUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  try {
    const formData = await request.formData();
    const audienceKey = normalizeText(formData.get("audience_key"));
    const name = normalizeText(formData.get("name"));
    const fromEmail = normalizeText(formData.get("from_email"));
    const subjectTemplate = normalizeText(formData.get("subject_template"));
    const htmlTemplate = normalizeText(formData.get("html_template"));
    const textTemplate = normalizeText(formData.get("text_template"));

    const result = await createAndSendAdminEmailCampaign({
      request,
      audienceKey,
      name,
      fromEmail,
      subjectTemplate,
      htmlTemplate,
      textTemplate
    });

    redirectUrl.searchParams.set("notice", "campaign_sent");
    redirectUrl.searchParams.set("campaign", result.campaignId);
    return NextResponse.redirect(redirectUrl, { status: 303 });
  } catch (error) {
    redirectUrl.searchParams.set("error", "send_failed");
    if (error instanceof Error && error.message) {
      redirectUrl.searchParams.set("message", error.message.slice(0, 240));
    }
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }
}
