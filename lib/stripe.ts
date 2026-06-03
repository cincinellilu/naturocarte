import crypto from "crypto";

export const STRIPE_API_VERSION = "2026-02-25.clover";

type StripeObject = Record<string, unknown>;

function getStripeSecretKey(): string | null {
  return process.env.STRIPE_SECRET_KEY?.trim() || null;
}

export function getStripeVisibilityPriceId(): string | null {
  return process.env.STRIPE_VISIBILITY_PRICE_ID?.trim() || null;
}

export function isStripeBillingConfigured(): boolean {
  return Boolean(getStripeSecretKey() && getStripeVisibilityPriceId());
}

function toFormBody(params: Record<string, string | number | boolean | null | undefined>) {
  const body = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    body.set(key, String(value));
  }

  return body;
}

async function stripeRequest<T extends StripeObject>(
  path: string,
  params: Record<string, string | number | boolean | null | undefined>
): Promise<T> {
  const secretKey = getStripeSecretKey();
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }

  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": STRIPE_API_VERSION
    },
    body: toFormBody(params),
    cache: "no-store"
  });

  const payload = (await response.json()) as T & {
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(payload.error?.message || `Stripe request failed: ${response.status}`);
  }

  return payload;
}

async function stripeGet<T extends StripeObject>(
  path: string,
  params: Record<string, string | number | boolean | null | undefined>
): Promise<T> {
  const secretKey = getStripeSecretKey();
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }

  const query = toFormBody(params).toString();
  const url = `https://api.stripe.com/v1${path}${query ? `?${query}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Stripe-Version": STRIPE_API_VERSION
    },
    cache: "no-store"
  });

  const payload = (await response.json()) as T & {
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(payload.error?.message || `Stripe request failed: ${response.status}`);
  }

  return payload;
}

export async function createStripeCustomer(params: {
  email: string;
  practitionerAccountId: string;
}) {
  return stripeRequest<{
    id: string;
  }>("/customers", {
    email: params.email,
    "metadata[practitioner_account_id]": params.practitionerAccountId
  });
}

export async function createVisibilityCheckoutSession(params: {
  customerId: string;
  practitionerAccountId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const priceId = getStripeVisibilityPriceId();
  if (!priceId) {
    throw new Error("Missing STRIPE_VISIBILITY_PRICE_ID.");
  }

  return stripeRequest<{
    id: string;
    url: string | null;
  }>("/checkout/sessions", {
    mode: "subscription",
    customer: params.customerId,
    client_reference_id: params.practitionerAccountId,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": 1,
    "metadata[practitioner_account_id]": params.practitionerAccountId,
    "subscription_data[metadata][practitioner_account_id]": params.practitionerAccountId
  });
}

export async function createBillingPortalSession(params: {
  customerId: string;
  returnUrl: string;
}) {
  return stripeRequest<{
    id: string;
    url: string | null;
  }>("/billing_portal/sessions", {
    customer: params.customerId,
    return_url: params.returnUrl
  });
}

export type StripeInvoiceSummary = {
  id: string;
  number: string | null;
  status: string | null;
  amountPaid: number;
  amountDue: number;
  currency: string | null;
  createdAt: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
};

function asStripeString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function asStripeNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toIsoFromUnix(value: unknown): string | null {
  const timestamp = asStripeNumber(value);
  return timestamp ? new Date(timestamp * 1000).toISOString() : null;
}

function getInvoicePeriod(invoice: StripeObject): { start: string | null; end: string | null } {
  const lines = invoice.lines;
  const data =
    lines && typeof lines === "object" && Array.isArray((lines as StripeObject).data)
      ? ((lines as StripeObject).data as unknown[])
      : [];
  const firstLine = data[0];
  const period =
    firstLine && typeof firstLine === "object"
      ? ((firstLine as StripeObject).period as StripeObject | undefined)
      : undefined;

  return {
    start: toIsoFromUnix(period?.start ?? invoice.period_start),
    end: toIsoFromUnix(period?.end ?? invoice.period_end)
  };
}

export async function listStripeCustomerInvoices(params: {
  customerId: string;
  subscriptionId?: string | null;
  limit?: number;
}): Promise<StripeInvoiceSummary[]> {
  const payload = await stripeGet<{
    data?: StripeObject[];
  }>("/invoices", {
    customer: params.customerId,
    subscription: params.subscriptionId || undefined,
    limit: params.limit ?? 12
  });

  return (payload.data ?? []).map((invoice) => {
    const period = getInvoicePeriod(invoice);

    return {
      id: asStripeString(invoice.id) ?? "",
      number: asStripeString(invoice.number),
      status: asStripeString(invoice.status),
      amountPaid: asStripeNumber(invoice.amount_paid) ?? 0,
      amountDue: asStripeNumber(invoice.amount_due) ?? 0,
      currency: asStripeString(invoice.currency),
      createdAt: toIsoFromUnix(invoice.created),
      periodStart: period.start,
      periodEnd: period.end,
      hostedInvoiceUrl: asStripeString(invoice.hosted_invoice_url),
      invoicePdf: asStripeString(invoice.invoice_pdf)
    };
  });
}

function safeCompare(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyStripeWebhookSignature(params: {
  payload: string;
  signatureHeader: string | null;
  webhookSecret: string | undefined;
}): boolean {
  const secret = params.webhookSecret?.trim();
  if (!secret || !params.signatureHeader) return false;

  const parts = params.signatureHeader.split(",");
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));

  if (!timestamp || signatures.length === 0) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${params.payload}`, "utf8")
    .digest("hex");

  return signatures.some((signature) => safeCompare(signature, expected));
}
