import { NextResponse } from "next/server";
import { createAppUrl } from "@/lib/app-url";
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
};

export async function POST(request: Request) {
  const session = await getCurrentPractitionerSession();
  if (!session) {
    return NextResponse.redirect(createAppUrl("/praticiens?auth=required", request), {
      status: 303
    });
  }

  const formData = await request.formData();
  const rawPlan = formData.get("plan");
  const plan = typeof rawPlan === "string" ? rawPlan.trim() : "";
  const redirectUrl = createAppUrl("/praticiens/dashboard", request);

  if (!isPractitionerPlanId(plan)) {
    redirectUrl.searchParams.set("error", "invalid_plan");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const supabase = getSupabaseAdminClient();
  const { data: account, error: accountError } = await supabase
    .from("practitioner_accounts")
    .select("id, email, plan, stripe_customer_id")
    .eq("auth_user_id", session.userId)
    .maybeSingle<PractitionerAccountBilling>();

  if (accountError || !account) {
    redirectUrl.searchParams.set("error", "missing_account");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  if (plan === PRACTITIONER_PLAN_PRESENCE) {
    if (account.stripe_customer_id) {
      try {
        await recordProductEvent({
          eventName: "billing_portal_opened",
          request,
          metadata: { target_plan: plan }
        }).catch(() => {});
        const portal = await createBillingPortalSession({
          customerId: account.stripe_customer_id,
          returnUrl: createAppUrl("/praticiens/dashboard", request).toString()
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
    let customerId = account.stripe_customer_id;

    if (!customerId) {
      const customer = await createStripeCustomer({
        email: account.email,
        practitionerAccountId: account.id
      });

      customerId = customer.id;

      const { error: customerUpdateError } = await supabase
        .from("practitioner_accounts")
        .update({
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString()
        })
        .eq("id", account.id);

      if (customerUpdateError) {
        throw customerUpdateError;
      }
    }

    const checkout = await createVisibilityCheckoutSession({
      customerId,
      practitionerAccountId: account.id,
      successUrl: createAppUrl("/praticiens/dashboard?billing=success", request).toString(),
      cancelUrl: createAppUrl("/praticiens/dashboard?plans=open", request).toString()
    });

    if (!checkout.url) {
      throw new Error("Stripe Checkout did not return a URL.");
    }

    await recordProductEvent({
      eventName: "checkout_started",
      request,
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
