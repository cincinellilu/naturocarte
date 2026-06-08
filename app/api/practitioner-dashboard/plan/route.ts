import { NextResponse } from "next/server";
import { createAppUrl } from "@/lib/app-url";
import {
  getDefaultPractitionerAccount,
  getPractitionerAccountById,
  listPractitionerAccountsForSession
} from "@/lib/practitioner-accounts";
import {
  getEffectivePractitionerPlan,
  getPractitionerBillingLeader,
  syncPractitionerBillingGroup
} from "@/lib/practitioner-billing";
import { recordProductEvent } from "@/lib/product-events-server";
import { getCurrentPractitionerSession } from "@/lib/practitioner-auth";
import {
  isPractitionerPlanId,
  PRACTITIONER_PLAN_PRESENCE,
  PRACTITIONER_PLAN_VISIBILITY
} from "@/lib/practitioner-plans";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  createBillingPortalSession,
  createStripeCustomer,
  createVisibilityCheckoutSession,
  isStripeBillingConfigured
} from "@/lib/stripe";

type PractitionerAccountBilling = {
  id: string;
  email: string;
  plan: string;
  stripe_customer_id: string | null;
  stripe_subscription_id?: string | null;
  stripe_subscription_status?: string | null;
  stripe_price_id?: string | null;
  stripe_current_period_end?: string | null;
};

function normalizeAccountId(value: FormDataEntryValue | null): string | null {
  return typeof value === "string" ? value.trim() || null : null;
}

export async function POST(request: Request) {
  const session = await getCurrentPractitionerSession();
  if (!session) {
    return NextResponse.redirect(createAppUrl("/praticiens?auth=required", request), {
      status: 303
    });
  }

  const formData = await request.formData();
  const rawPlan = formData.get("plan");
  const requestedAccountId = normalizeAccountId(formData.get("account_id"));
  const plan = typeof rawPlan === "string" ? rawPlan.trim() : "";
  const redirectUrl = createAppUrl("/praticiens/dashboard", request);

  if (requestedAccountId) {
    redirectUrl.searchParams.set("cabinet", requestedAccountId);
  }

  if (!isPractitionerPlanId(plan)) {
    redirectUrl.searchParams.set("error", "invalid_plan");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const supabase = getSupabaseAdminClient();
  let accounts;

  try {
    accounts = await listPractitionerAccountsForSession(supabase, {
      authUserId: session.userId,
      email: session.email
    });
  } catch {
    redirectUrl.searchParams.set("error", "missing_account");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const account = requestedAccountId
    ? getPractitionerAccountById(accounts, requestedAccountId)
    : getDefaultPractitionerAccount(accounts);
  const billingAccount = getPractitionerBillingLeader(accounts) ?? account;
  const currentPlan = getEffectivePractitionerPlan(accounts);

  if ((requestedAccountId && !account) || !account) {
    redirectUrl.searchParams.set("error", "missing_account");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  if (plan === PRACTITIONER_PLAN_PRESENCE) {
    if (billingAccount?.stripe_customer_id) {
      try {
        await recordProductEvent({
          eventName: "billing_portal_opened",
          request,
          practitionerAccountId: billingAccount.id,
          practitionerId: account.practitioner_id,
          metadata: { target_plan: plan }
        }).catch(() => {});
        const portal = await createBillingPortalSession({
          customerId: billingAccount.stripe_customer_id,
          returnUrl: redirectUrl.toString()
        });

        if (portal.url) {
          return NextResponse.redirect(portal.url, { status: 303 });
        }
      } catch (error) {
        console.error("stripe portal creation error", error);
        redirectUrl.searchParams.set("error", "portal_failed");
        return NextResponse.redirect(redirectUrl, { status: 303 });
      }
    }

    redirectUrl.searchParams.set("saved", "plan");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  if (plan !== PRACTITIONER_PLAN_VISIBILITY) {
    redirectUrl.searchParams.set("error", "invalid_plan");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  if (!isStripeBillingConfigured()) {
    redirectUrl.searchParams.set("error", "stripe_not_configured");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  try {
    let customerId = billingAccount?.stripe_customer_id ?? account.stripe_customer_id;

    if (!customerId) {
      const customer = await createStripeCustomer({
        email: account.email,
        practitionerAccountId: account.id
      });

      customerId = customer.id;

      await syncPractitionerBillingGroup(supabase, {
        email: account.email,
        billing: {
          plan: currentPlan,
          stripe_customer_id: customerId,
          stripe_subscription_id: billingAccount?.stripe_subscription_id ?? null,
          stripe_subscription_status: billingAccount?.stripe_subscription_status ?? null,
          stripe_price_id: billingAccount?.stripe_price_id ?? null,
          stripe_current_period_end: billingAccount?.stripe_current_period_end ?? null
        }
      });
    }

    const checkout = await createVisibilityCheckoutSession({
      customerId,
      practitionerAccountId: account.id,
      successUrl: createAppUrl(
        `/praticiens/dashboard?${new URLSearchParams(
          Object.fromEntries(
            Object.entries({
              cabinet: requestedAccountId,
              billing: "success"
            }).filter(([, value]) => Boolean(value))
          ) as Record<string, string>
        ).toString()}`,
        request
      ).toString(),
      cancelUrl: createAppUrl(
        `/praticiens/dashboard?${new URLSearchParams(
          Object.fromEntries(
            Object.entries({
              cabinet: requestedAccountId,
              plans: "open"
            }).filter(([, value]) => Boolean(value))
          ) as Record<string, string>
        ).toString()}`,
        request
      ).toString()
    });

    if (!checkout.url) {
      throw new Error("Stripe Checkout did not return a URL.");
    }

    await recordProductEvent({
      eventName: "checkout_started",
      request,
      practitionerAccountId: account.id,
      practitionerId: account.practitioner_id,
      metadata: {
        target_plan: plan
      }
    }).catch(() => {});

    return NextResponse.redirect(checkout.url, { status: 303 });
  } catch (error) {
    console.error("stripe checkout creation error", error);
    redirectUrl.searchParams.set("error", "plan_failed");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }
}
