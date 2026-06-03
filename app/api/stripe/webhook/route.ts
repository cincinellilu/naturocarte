import { NextResponse } from "next/server";
import { recordProductEvent } from "@/lib/product-events-server";
import { PRACTITIONER_PLAN_PRESENCE, PRACTITIONER_PLAN_VISIBILITY } from "@/lib/practitioner-plans";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getStripeVisibilityPriceId, verifyStripeWebhookSignature } from "@/lib/stripe";

export const dynamic = "force-dynamic";

type StripeEvent = {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
};

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function getAccountIdFromObject(object: Record<string, unknown>): string | null {
  const metadata = object.metadata;
  if (!metadata || typeof metadata !== "object") return null;
  return asString((metadata as Record<string, unknown>).practitioner_account_id);
}

function getSubscriptionPriceId(subscription: Record<string, unknown>): string | null {
  const items = subscription.items;
  if (!items || typeof items !== "object") return null;
  const data = (items as Record<string, unknown>).data;
  if (!Array.isArray(data)) return null;
  const firstItem = data[0];
  if (!firstItem || typeof firstItem !== "object") return null;
  const price = (firstItem as Record<string, unknown>).price;
  if (!price || typeof price !== "object") return null;
  return asString((price as Record<string, unknown>).id);
}

function getInvoiceSubscriptionId(invoice: Record<string, unknown>): string | null {
  return asString(invoice.subscription);
}

function getInvoiceLinePriceId(invoice: Record<string, unknown>): string | null {
  const lines = invoice.lines;
  if (!lines || typeof lines !== "object") return null;
  const data = (lines as Record<string, unknown>).data;
  if (!Array.isArray(data)) return null;
  const firstLine = data[0];
  if (!firstLine || typeof firstLine !== "object") return null;
  const price = (firstLine as Record<string, unknown>).price;
  if (!price || typeof price !== "object") return null;
  return asString((price as Record<string, unknown>).id);
}

function getInvoiceLinePeriodEnd(invoice: Record<string, unknown>): string | null {
  const lines = invoice.lines;
  if (!lines || typeof lines !== "object") return null;
  const data = (lines as Record<string, unknown>).data;
  if (!Array.isArray(data)) return null;
  const firstLine = data[0];
  if (!firstLine || typeof firstLine !== "object") return null;
  const period = (firstLine as Record<string, unknown>).period;
  if (!period || typeof period !== "object") return null;
  const value = (period as Record<string, unknown>).end;
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return new Date(value * 1000).toISOString();
}

function getSubscriptionCurrentPeriodEnd(subscription: Record<string, unknown>): string | null {
  const value = subscription.current_period_end;
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return new Date(value * 1000).toISOString();
}

function isVisibilitySubscriptionStatus(status: string | null): boolean {
  return status === "active" || status === "trialing";
}

async function updateAccountFromSubscription(subscription: Record<string, unknown>) {
  const subscriptionId = asString(subscription.id);
  const customerId = asString(subscription.customer);
  const status = asString(subscription.status);
  const priceId = getSubscriptionPriceId(subscription);
  const visibilityPriceId = getStripeVisibilityPriceId();
  const accountId = getAccountIdFromObject(subscription);
  const periodEnd = getSubscriptionCurrentPeriodEnd(subscription);
  const plan =
    priceId && visibilityPriceId && priceId === visibilityPriceId && isVisibilitySubscriptionStatus(status)
      ? PRACTITIONER_PLAN_VISIBILITY
      : PRACTITIONER_PLAN_PRESENCE;

  if (!subscriptionId && !accountId) return;

  const supabase = getSupabaseAdminClient();
  const updatePayload = {
    plan,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    stripe_subscription_status: status,
    stripe_price_id: priceId,
    stripe_current_period_end: periodEnd,
    updated_at: new Date().toISOString()
  };

  let query = supabase.from("practitioner_accounts").update(updatePayload);

  if (accountId) {
    query = query.eq("id", accountId);
  } else {
    query = query.eq("stripe_subscription_id", subscriptionId);
  }

  const { error } = await query;
  if (error) {
    throw error;
  }

  await recordProductEvent({
    eventName:
      plan === PRACTITIONER_PLAN_VISIBILITY
        ? "stripe_subscription_active"
        : "stripe_subscription_inactive",
    practitionerAccountId: accountId,
    metadata: {
      stripe_subscription_id: subscriptionId,
      stripe_status: status,
      plan
    }
  }).catch(() => {});
}

async function updateAccountFromInvoice(invoice: Record<string, unknown>, paymentStatus: "paid" | "failed") {
  const subscriptionId = getInvoiceSubscriptionId(invoice);
  const customerId = asString(invoice.customer);
  const priceId = getInvoiceLinePriceId(invoice);
  const visibilityPriceId = getStripeVisibilityPriceId();
  const periodEnd = getInvoiceLinePeriodEnd(invoice);
  const isVisibilityInvoice = Boolean(priceId && visibilityPriceId && priceId === visibilityPriceId);

  if (!subscriptionId || !isVisibilityInvoice) return;

  const plan = paymentStatus === "paid" ? PRACTITIONER_PLAN_VISIBILITY : PRACTITIONER_PLAN_PRESENCE;
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("practitioner_accounts")
    .update({
      plan,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      stripe_subscription_status: paymentStatus === "paid" ? "active" : "past_due",
      stripe_price_id: priceId,
      stripe_current_period_end: periodEnd,
      updated_at: new Date().toISOString()
    })
    .eq("stripe_subscription_id", subscriptionId);

  if (error) {
    throw error;
  }

  await recordProductEvent({
    eventName: paymentStatus === "paid" ? "stripe_invoice_paid" : "stripe_invoice_payment_failed",
    metadata: {
      stripe_invoice_id: asString(invoice.id),
      stripe_subscription_id: subscriptionId,
      stripe_status: paymentStatus,
      plan
    }
  }).catch(() => {});
}

async function updateAccountFromCheckoutSession(session: Record<string, unknown>) {
  const accountId = getAccountIdFromObject(session) ?? asString(session.client_reference_id);
  const customerId = asString(session.customer);
  const subscriptionId = asString(session.subscription);

  if (!accountId) return;

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("practitioner_accounts")
    .update({
      plan: PRACTITIONER_PLAN_VISIBILITY,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      stripe_subscription_status: "active",
      stripe_price_id: getStripeVisibilityPriceId(),
      updated_at: new Date().toISOString()
    })
    .eq("id", accountId);

  if (error) {
    throw error;
  }

  await recordProductEvent({
    eventName: "checkout_completed",
    practitionerAccountId: accountId,
    metadata: {
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      plan: PRACTITIONER_PLAN_VISIBILITY
    }
  }).catch(() => {});
}

export async function POST(request: Request) {
  const payload = await request.text();
  const isValidSignature = verifyStripeWebhookSignature({
    payload,
    signatureHeader: request.headers.get("stripe-signature"),
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  });

  if (!isValidSignature) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const event = JSON.parse(payload) as StripeEvent;

  try {
    if (event.type === "checkout.session.completed") {
      await updateAccountFromCheckoutSession(event.data.object);
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await updateAccountFromSubscription(event.data.object);
    }

    if (event.type === "invoice.paid") {
      await updateAccountFromInvoice(event.data.object, "paid");
    }

    if (event.type === "invoice.payment_failed") {
      await updateAccountFromInvoice(event.data.object, "failed");
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("stripe webhook error", error);
    return NextResponse.json({ error: "webhook_processing_failed" }, { status: 500 });
  }
}
