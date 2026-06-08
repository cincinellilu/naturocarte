import { NextResponse } from "next/server";
import { hasAdminProspectsAccess } from "@/lib/admin-prospects-auth";
import { overridePractitionerBillingPlan } from "@/lib/practitioner-billing";
import {
  PRACTITIONER_PLAN_PRESENCE,
  PRACTITIONER_PLAN_VISIBILITY
} from "@/lib/practitioner-plans";
import { recordProductEvent } from "@/lib/product-events-server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

function normalizeText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function getSafeAdminRedirect(request: Request, target: string): URL {
  const fallback = new URL("/admin/clients", request.url);

  if (!target.startsWith("/admin/clients")) {
    return fallback;
  }

  try {
    const url = new URL(target, request.url);
    if (url.origin !== fallback.origin) return fallback;
    return url;
  } catch {
    return fallback;
  }
}

export async function POST(request: Request) {
  const hasAccess = await hasAdminProspectsAccess();
  const formData = await request.formData();
  const redirectUrl = getSafeAdminRedirect(request, normalizeText(formData.get("next")));

  if (!hasAccess) {
    redirectUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const accountId = normalizeText(formData.get("account_id"));
  const targetPlan = normalizeText(formData.get("plan"));

  if (!accountId) {
    redirectUrl.searchParams.set("error", "missing_account");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  if (
    targetPlan !== PRACTITIONER_PLAN_VISIBILITY &&
    targetPlan !== PRACTITIONER_PLAN_PRESENCE
  ) {
    redirectUrl.searchParams.set("error", "invalid_plan");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const supabase = getSupabaseAdminClient();
  const { data: account, error: accountError } = await supabase
    .from("practitioner_accounts")
    .select("id, email, practitioner_id, plan")
    .eq("id", accountId)
    .maybeSingle<{
      id: string;
      email: string | null;
      practitioner_id: string | null;
      plan: string | null;
    }>();

  if (accountError || !account) {
    redirectUrl.searchParams.set("error", "missing_account");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  try {
    await overridePractitionerBillingPlan(supabase, {
      accountId: account.id,
      email: account.email,
      plan: targetPlan
    });

    await recordProductEvent({
      eventName:
        targetPlan === PRACTITIONER_PLAN_VISIBILITY
          ? "admin_client_plan_override_visibility"
          : "admin_client_plan_override_presence",
      request,
      practitionerAccountId: account.id,
      practitionerId: account.practitioner_id,
      metadata: {
        previous_plan: account.plan,
        target_plan: targetPlan
      }
    }).catch(() => {});

    redirectUrl.searchParams.set(
      "saved",
      targetPlan === PRACTITIONER_PLAN_VISIBILITY
        ? "manual_visibility_applied"
        : "manual_presence_applied"
    );
    return NextResponse.redirect(redirectUrl, { status: 303 });
  } catch (error) {
    console.error("admin client manual visibility apply failed", error);
    redirectUrl.searchParams.set(
      "error",
      targetPlan === PRACTITIONER_PLAN_VISIBILITY
        ? "manual_visibility_failed"
        : "manual_presence_failed"
    );
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }
}
