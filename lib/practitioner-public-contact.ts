import { getPartnerAccount, type PractitionerAccountPlanRow } from "@/lib/practitioner-partner";
import { PRACTITIONER_PLAN_VISIBILITY } from "@/lib/practitioner-plans";

export type PractitionerPublicContactInput = {
  phone?: string | null;
  email?: string | null;
  booking_url?: string | null;
  website?: string | null;
};

export type PractitionerPublicAccountInput = Partial<PractitionerAccountPlanRow> & {
  id?: string | null;
  contact_slot?: string | null;
};

export type PractitionerPublicContact = {
  type: "booking_url" | "phone" | "email" | "website";
  value: string;
};

function hasText(value: string | null | undefined): value is string {
  return Boolean(value?.trim());
}

function normalizeAccounts(
  accounts:
    | PractitionerPublicAccountInput
    | PractitionerPublicAccountInput[]
    | null
    | undefined
): PractitionerPublicAccountInput[] {
  if (Array.isArray(accounts)) return accounts;
  return accounts ? [accounts] : [];
}

export function isPractitionerClaimed(
  accounts:
    | PractitionerPublicAccountInput
    | PractitionerPublicAccountInput[]
    | null
    | undefined
): boolean {
  return normalizeAccounts(accounts).some((account) => Boolean(account.id));
}

export function getPriorityContact(
  practitioner: PractitionerPublicContactInput
): PractitionerPublicContact | null {
  if (hasText(practitioner.booking_url)) {
    return { type: "booking_url", value: practitioner.booking_url.trim() };
  }

  if (hasText(practitioner.phone)) {
    return { type: "phone", value: practitioner.phone.trim() };
  }

  if (hasText(practitioner.email)) {
    return { type: "email", value: practitioner.email.trim() };
  }

  if (hasText(practitioner.website)) {
    return { type: "website", value: practitioner.website.trim() };
  }

  return null;
}

export function getVisiblePublicContacts(params: {
  practitioner: PractitionerPublicContactInput;
  accounts:
    | PractitionerPublicAccountInput
    | PractitionerPublicAccountInput[]
    | null
    | undefined;
}): PractitionerPublicContact[] {
  const partnerAccount = getPartnerAccount(params.accounts);

  if (partnerAccount?.plan === PRACTITIONER_PLAN_VISIBILITY) {
    return [
      hasText(params.practitioner.booking_url)
        ? { type: "booking_url" as const, value: params.practitioner.booking_url.trim() }
        : null,
      hasText(params.practitioner.phone)
        ? { type: "phone" as const, value: params.practitioner.phone.trim() }
        : null,
      hasText(params.practitioner.email)
        ? { type: "email" as const, value: params.practitioner.email.trim() }
        : null,
      hasText(params.practitioner.website)
        ? { type: "website" as const, value: params.practitioner.website.trim() }
        : null
    ].filter((contact): contact is PractitionerPublicContact => Boolean(contact));
  }

  const account = normalizeAccounts(params.accounts)[0] ?? null;

  if (account?.contact_slot === "booking_url" && hasText(params.practitioner.booking_url)) {
    return [{ type: "booking_url", value: params.practitioner.booking_url.trim() }];
  }

  if (account?.contact_slot === "phone" && hasText(params.practitioner.phone)) {
    return [{ type: "phone", value: params.practitioner.phone.trim() }];
  }

  if (account?.contact_slot === "email" && hasText(params.practitioner.email)) {
    return [{ type: "email", value: params.practitioner.email.trim() }];
  }

  const priorityContact = getPriorityContact(params.practitioner);
  return priorityContact ? [priorityContact] : [];
}

export function getDefaultContactSlot(practitioner: PractitionerPublicContactInput): string {
  const priorityContact = getPriorityContact(practitioner);

  if (
    priorityContact?.type === "booking_url" ||
    priorityContact?.type === "phone" ||
    priorityContact?.type === "email"
  ) {
    return priorityContact.type;
  }

  return "phone";
}
