import type { SupabaseClient } from "@supabase/supabase-js";
import {
  PRACTITIONER_PLAN_PRESENCE,
  PRACTITIONER_PLAN_VISIBILITY
} from "@/lib/practitioner-plans";

type AdminClient = SupabaseClient;

export type PractitionerBillingAccount = {
  id: string;
  email: string;
  plan: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  stripe_subscription_status?: string | null;
  stripe_price_id?: string | null;
  stripe_current_period_end?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type PractitionerBillingState = {
  plan: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  stripe_subscription_status?: string | null;
  stripe_price_id?: string | null;
  stripe_current_period_end?: string | null;
};

function hasText(value: string | null | undefined): value is string {
  return Boolean(value?.trim());
}

function getAccountPriority(account: PractitionerBillingAccount): number {
  if (account.plan === PRACTITIONER_PLAN_VISIBILITY) return 0;
  if (hasText(account.stripe_subscription_id)) return 1;
  if (hasText(account.stripe_customer_id)) return 2;
  return 3;
}

function compareAccounts(
  left: PractitionerBillingAccount,
  right: PractitionerBillingAccount
): number {
  const leftPriority = getAccountPriority(left);
  const rightPriority = getAccountPriority(right);

  if (leftPriority !== rightPriority) {
    return leftPriority - rightPriority;
  }

  const leftUpdated = left.updated_at ?? left.created_at ?? "";
  const rightUpdated = right.updated_at ?? right.created_at ?? "";
  const updatedCompare = rightUpdated.localeCompare(leftUpdated);

  if (updatedCompare !== 0) {
    return updatedCompare;
  }

  return right.id.localeCompare(left.id);
}

export function normalizePractitionerBillingEmail(
  value: string | null | undefined
): string | null {
  const normalized = value?.trim().toLowerCase() ?? "";
  return normalized || null;
}

export function getPractitionerBillingLeader(
  accounts: PractitionerBillingAccount[]
): PractitionerBillingAccount | null {
  if (accounts.length === 0) return null;
  return [...accounts].sort(compareAccounts)[0] ?? null;
}

export function getEffectivePractitionerPlan(
  accounts: PractitionerBillingAccount[]
): string {
  return getPractitionerBillingLeader(accounts)?.plan ?? PRACTITIONER_PLAN_PRESENCE;
}

export async function syncPractitionerBillingGroup(
  admin: AdminClient,
  params: {
    billing: PractitionerBillingState;
    email?: string | null;
    accountId?: string | null;
  }
): Promise<string | null> {
  let normalizedEmail = normalizePractitionerBillingEmail(params.email);

  if (!normalizedEmail && params.accountId) {
    const { data, error } = await admin
      .from("practitioner_accounts")
      .select("email")
      .eq("id", params.accountId)
      .maybeSingle<{ email: string | null }>();

    if (error) {
      throw error;
    }

    normalizedEmail = normalizePractitionerBillingEmail(data?.email);
  }

  if (!normalizedEmail) {
    return null;
  }

  const now = new Date().toISOString();
  const { error } = await admin
    .from("practitioner_accounts")
    .update({
      plan: params.billing.plan ?? PRACTITIONER_PLAN_PRESENCE,
      stripe_customer_id: params.billing.stripe_customer_id ?? null,
      stripe_subscription_id: params.billing.stripe_subscription_id ?? null,
      stripe_subscription_status: params.billing.stripe_subscription_status ?? null,
      stripe_price_id: params.billing.stripe_price_id ?? null,
      stripe_current_period_end: params.billing.stripe_current_period_end ?? null,
      updated_at: now
    })
    .eq("email", normalizedEmail);

  if (error) {
    throw error;
  }

  return normalizedEmail;
}
