import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { ingestResendEmailWebhook } from "@/lib/admin-emailing";

function getRequiredHeader(request: Request, name: string): string {
  const value = request.headers.get(name)?.trim();
  if (!value) {
    throw new Error(`Missing header ${name}`);
  }

  return value;
}

export async function POST(request: Request) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    return NextResponse.json({ error: "missing_webhook_secret" }, { status: 500 });
  }

  try {
    const payload = await request.text();
    const svixId = getRequiredHeader(request, "svix-id");
    const svixTimestamp = getRequiredHeader(request, "svix-timestamp");
    const svixSignature = getRequiredHeader(request, "svix-signature");

    const webhook = new Webhook(webhookSecret);
    const event = webhook.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature
    }) as {
      type: string;
      created_at: string;
      data?: Record<string, unknown>;
    };

    const result = await ingestResendEmailWebhook({
      svixId,
      event
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("resend webhook error", error);
    return NextResponse.json({ error: "invalid_webhook" }, { status: 400 });
  }
}
