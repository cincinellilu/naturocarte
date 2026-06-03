import { PRACTITIONER_PLAN_VISIBILITY } from "@/lib/practitioner-plans";

export type PractitionerAccountPlanRow = {
  plan?: string | null;
  stripe_subscription_status?: string | null;
};

export function isPartnerAccount(
  account: PractitionerAccountPlanRow | null | undefined
): boolean {
  return account?.plan === PRACTITIONER_PLAN_VISIBILITY;
}

export function getPartnerAccount(
  accounts:
    | PractitionerAccountPlanRow
    | PractitionerAccountPlanRow[]
    | null
    | undefined
): PractitionerAccountPlanRow | null {
  if (Array.isArray(accounts)) {
    return accounts.find((account) => isPartnerAccount(account)) ?? null;
  }

  if (!accounts) {
    return null;
  }

  return isPartnerAccount(accounts) ? accounts : null;
}
