import type { SupabaseClient } from "@supabase/supabase-js";

export type PractitionerAccountRecord = {
  id: string;
  auth_user_id: string | null;
  practitioner_id: string | null;
  email: string;
  plan: string;
  contact_slot: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id?: string | null;
  stripe_subscription_status: string | null;
  stripe_price_id?: string | null;
  stripe_current_period_end?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  last_login_at?: string | null;
  login_count?: number | null;
};

type AdminClient = SupabaseClient;

const PRACTITIONER_ACCOUNT_SELECT =
  "id, auth_user_id, practitioner_id, email, plan, contact_slot, stripe_customer_id, stripe_subscription_id, stripe_subscription_status, stripe_price_id, stripe_current_period_end, created_at, updated_at, last_login_at, login_count";

function comparePractitionerAccounts(
  left: PractitionerAccountRecord,
  right: PractitionerAccountRecord,
  authUserId: string
): number {
  const leftPriority = left.auth_user_id === authUserId ? 0 : 1;
  const rightPriority = right.auth_user_id === authUserId ? 0 : 1;

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

export async function listPractitionerAccountsForSession(
  admin: AdminClient,
  params: { authUserId: string; email: string }
): Promise<PractitionerAccountRecord[]> {
  const normalizedEmail = params.email.trim().toLowerCase();
  const { data, error } = await admin
    .from("practitioner_accounts")
    .select(PRACTITIONER_ACCOUNT_SELECT)
    .or(`auth_user_id.eq.${params.authUserId},email.eq.${normalizedEmail}`)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false, nullsFirst: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as PractitionerAccountRecord[]).sort((left, right) =>
    comparePractitionerAccounts(left, right, params.authUserId)
  );
}

export function getManagedPractitionerAccounts(
  accounts: PractitionerAccountRecord[]
): PractitionerAccountRecord[] {
  return accounts.filter((account) => Boolean(account.practitioner_id));
}

export function getDefaultPractitionerAccount(
  accounts: PractitionerAccountRecord[]
): PractitionerAccountRecord | null {
  return getManagedPractitionerAccounts(accounts)[0] ?? accounts[0] ?? null;
}

export function getPractitionerAccountById(
  accounts: PractitionerAccountRecord[],
  accountId: string | null | undefined
): PractitionerAccountRecord | null {
  const normalizedId = accountId?.trim();
  if (!normalizedId) return null;
  return accounts.find((account) => account.id === normalizedId) ?? null;
}

export function getSelectedPractitionerAccount(
  accounts: PractitionerAccountRecord[],
  accountId: string | null | undefined
): PractitionerAccountRecord | null {
  return getPractitionerAccountById(accounts, accountId) ?? getDefaultPractitionerAccount(accounts);
}
