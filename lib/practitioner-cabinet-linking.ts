import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getPractitionerBillingLeader,
  syncPractitionerBillingGroup,
  type PractitionerBillingAccount,
  type PractitionerBillingState
} from "@/lib/practitioner-billing";

type AdminClient = SupabaseClient;

const PRACTITIONER_ACCOUNT_SELECT =
  "id, auth_user_id, practitioner_id, email, plan, contact_slot, stripe_customer_id, stripe_subscription_id, stripe_subscription_status, stripe_price_id, stripe_current_period_end, login_count, last_login_at, created_at, updated_at";

export type PractitionerCabinetLinkPractitioner = {
  id: string;
  slug: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  adresse: string | null;
  postal_code: string | null;
  city: string | null;
  status: string | null;
};

export type PractitionerCabinetLinkAccount = {
  id: string;
  auth_user_id: string | null;
  practitioner_id: string | null;
  email: string;
  plan: string | null;
  contact_slot: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_subscription_status: string | null;
  stripe_price_id: string | null;
  stripe_current_period_end: string | null;
  login_count: number | null;
  last_login_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type PractitionerCabinetAuthUser = {
  authEmail: string;
  userId: string | null;
  created: boolean;
  wouldCreate: boolean;
};

export type PractitionerCabinetLinkOperation = {
  type: "link_existing_account" | "reuse_unlinked_account" | "create_account";
  practitioner: string;
  account_id?: string;
  auth_user_id: string | null;
  auth_email: string;
  email: string;
  would_create_auth_user?: boolean;
};

export type PractitionerCabinetLinkConflict = {
  practitioner: string;
  reason: "auth_user_already_linked_elsewhere";
  auth_email: string;
  auth_user_id: string;
  existing_practitioner_id: string;
};

export type PractitionerCabinetLinkResult = {
  apply: boolean;
  login_email: string;
  auth_user: Omit<PractitionerCabinetAuthUser, "authEmail"> & { authEmail: string };
  secondary_auth_users: Array<
    Omit<PractitionerCabinetAuthUser, "authEmail"> & {
      practitioner: string;
      authEmail: string;
    }
  >;
  practitioners: PractitionerCabinetLinkPractitioner[];
  existing_accounts: PractitionerCabinetLinkAccount[];
  conflicts: PractitionerCabinetLinkConflict[];
  operations: PractitionerCabinetLinkOperation[];
  shared_billing: PractitionerBillingState | null;
  final_accounts: PractitionerCabinetLinkAccount[];
};

function normalize(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function buildSecondaryAuthEmail(loginEmail: string, cabinetPosition: number): string {
  const [localPart, domain] = loginEmail.split("@");
  return `${localPart}+cabinet-${cabinetPosition}@${domain}`;
}

async function listAllUsersByEmail(
  admin: AdminClient,
  email: string
): Promise<Array<{ id: string; email?: string | null }>> {
  const matches: Array<{ id: string; email?: string | null }> = [];
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;

    const users = data?.users ?? [];
    for (const user of users) {
      if (normalize(user.email) === normalize(email)) {
        matches.push({ id: user.id, email: user.email });
      }
    }

    if (users.length < 200) break;
    page += 1;
  }

  return matches;
}

async function ensureAuthUser(
  admin: AdminClient,
  email: string,
  apply: boolean
): Promise<PractitionerCabinetAuthUser> {
  const matches = await listAllUsersByEmail(admin, email);
  if (matches[0]?.id) {
    return { authEmail: email, userId: matches[0].id, created: false, wouldCreate: false };
  }

  if (!apply) {
    return { authEmail: email, userId: null, created: false, wouldCreate: true };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true
  });

  if (error || !data.user?.id) {
    throw error ?? new Error(`Failed to create auth user for ${email}.`);
  }

  return { authEmail: email, userId: data.user.id, created: true, wouldCreate: false };
}

async function loadTargetPractitioners(
  admin: AdminClient,
  slugs: string[]
): Promise<PractitionerCabinetLinkPractitioner[]> {
  const { data, error } = await admin
    .from("practitioners")
    .select("id, slug, first_name, last_name, email, phone, adresse, postal_code, city, status")
    .in("slug", slugs);

  if (error) throw error;

  const practitioners = (data ?? []) as PractitionerCabinetLinkPractitioner[];

  if (practitioners.length !== slugs.length) {
    const foundSlugs = new Set(practitioners.map((row) => row.slug));
    const missingSlugs = slugs.filter((slug) => !foundSlugs.has(slug));
    throw new Error(`Slugs introuvables: ${missingSlugs.join(", ")}`);
  }

  return slugs
    .map((slug) => practitioners.find((row) => row.slug === slug) ?? null)
    .filter((row): row is PractitionerCabinetLinkPractitioner => Boolean(row));
}

async function loadRelevantAccounts(
  admin: AdminClient,
  params: {
    practitionerIds: string[];
    loginEmail: string;
    authUserIds: string[];
  }
): Promise<PractitionerCabinetLinkAccount[]> {
  const practitionerIdChunks = [];

  if (params.practitionerIds.length > 0) {
    practitionerIdChunks.push(
      await admin
        .from("practitioner_accounts")
        .select(PRACTITIONER_ACCOUNT_SELECT)
        .in("practitioner_id", params.practitionerIds)
        .order("created_at", { ascending: true })
    );
  }

  const emailChunk = await admin
    .from("practitioner_accounts")
    .select(PRACTITIONER_ACCOUNT_SELECT)
    .ilike("email", params.loginEmail)
    .order("created_at", { ascending: true });

  const authChunk =
    params.authUserIds.length > 0
      ? await admin
          .from("practitioner_accounts")
          .select(PRACTITIONER_ACCOUNT_SELECT)
          .in("auth_user_id", params.authUserIds)
          .order("created_at", { ascending: true })
      : { data: [], error: null };

  const results = [...practitionerIdChunks, emailChunk, authChunk];

  for (const result of results) {
    if (result.error) {
      throw result.error;
    }
  }

  const accounts = new Map<string, PractitionerCabinetLinkAccount>();

  for (const result of results) {
    for (const account of (result.data ?? []) as PractitionerCabinetLinkAccount[]) {
      accounts.set(account.id, account);
    }
  }

  return [...accounts.values()];
}

function pickReusableAccount(params: {
  accounts: PractitionerCabinetLinkAccount[];
  usedAccountIds: Set<string>;
  authUserId: string | null;
}): PractitionerCabinetLinkAccount | null {
  if (!params.authUserId) return null;

  return (
    params.accounts.find(
      (account) =>
        !params.usedAccountIds.has(account.id) &&
        account.auth_user_id === params.authUserId &&
        !account.practitioner_id
    ) ?? null
  );
}

function toBillingState(
  account: PractitionerBillingAccount | null
): PractitionerBillingState | null {
  if (!account) return null;

  return {
    plan: account.plan ?? null,
    stripe_customer_id: account.stripe_customer_id ?? null,
    stripe_subscription_id: account.stripe_subscription_id ?? null,
    stripe_subscription_status: account.stripe_subscription_status ?? null,
    stripe_price_id: account.stripe_price_id ?? null,
    stripe_current_period_end: account.stripe_current_period_end ?? null
  };
}

export async function linkPractitionerCabinets(
  admin: AdminClient,
  params: {
    loginEmail: string;
    slugs: string[];
    apply?: boolean;
  }
): Promise<PractitionerCabinetLinkResult> {
  const apply = Boolean(params.apply);
  const loginEmail = normalize(params.loginEmail);
  const targetSlugs = [...new Set(params.slugs.map((slug) => slug.trim()).filter(Boolean))];

  const practitioners = await loadTargetPractitioners(admin, targetSlugs);
  const primaryAuthUser = await ensureAuthUser(admin, loginEmail, apply);
  const secondaryAuthUsers = new Map<number, PractitionerCabinetAuthUser>();

  for (const [index] of practitioners.entries()) {
    if (index === 0) continue;

    const authEmail = buildSecondaryAuthEmail(loginEmail, index + 1);
    secondaryAuthUsers.set(index, await ensureAuthUser(admin, authEmail, apply));
  }

  const knownAuthUserIds = [
    primaryAuthUser.userId,
    ...[...secondaryAuthUsers.values()].map((item) => item.userId)
  ].filter((value): value is string => Boolean(value));

  const existingAccounts = await loadRelevantAccounts(admin, {
    practitionerIds: practitioners.map((row) => row.id),
    loginEmail,
    authUserIds: knownAuthUserIds
  });

  const targetPractitionerIds = new Set(practitioners.map((row) => row.id));
  const accountsByPractitionerId = new Map(
    existingAccounts
      .filter((row) => row.practitioner_id)
      .map((row) => [row.practitioner_id as string, row])
  );
  const usedAccountIds = new Set<string>();
  const operations: PractitionerCabinetLinkOperation[] = [];
  const conflicts: PractitionerCabinetLinkConflict[] = [];

  for (const [index, practitioner] of practitioners.entries()) {
    const owner =
      index === 0
        ? primaryAuthUser
        : secondaryAuthUsers.get(index) ?? {
            authEmail: buildSecondaryAuthEmail(loginEmail, index + 1),
            userId: null,
            created: false,
            wouldCreate: !apply
          };

    const ownedAccount =
      owner.userId
        ? existingAccounts.find((account) => account.auth_user_id === owner.userId) ?? null
        : null;

    if (
      owner.userId &&
      ownedAccount?.practitioner_id &&
      ownedAccount.practitioner_id !== practitioner.id &&
      !targetPractitionerIds.has(ownedAccount.practitioner_id)
    ) {
      conflicts.push({
        practitioner: practitioner.slug,
        reason: "auth_user_already_linked_elsewhere",
        auth_email: owner.authEmail,
        auth_user_id: owner.userId,
        existing_practitioner_id: ownedAccount.practitioner_id
      });
      continue;
    }

    const existingLinkedAccount = accountsByPractitionerId.get(practitioner.id) ?? null;

    if (existingLinkedAccount) {
      usedAccountIds.add(existingLinkedAccount.id);
      operations.push({
        type: "link_existing_account",
        practitioner: practitioner.slug,
        account_id: existingLinkedAccount.id,
        auth_user_id: owner.userId,
        auth_email: owner.authEmail,
        email: loginEmail,
        would_create_auth_user: owner.wouldCreate || undefined
      });

      if (apply) {
        const { error } = await admin
          .from("practitioner_accounts")
          .update({
            auth_user_id: owner.userId,
            email: loginEmail,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingLinkedAccount.id);

        if (error) {
          throw error;
        }
      }

      continue;
    }

    const reusableAccount = pickReusableAccount({
      accounts: existingAccounts,
      usedAccountIds,
      authUserId: owner.userId
    });

    if (reusableAccount) {
      usedAccountIds.add(reusableAccount.id);
      operations.push({
        type: "reuse_unlinked_account",
        practitioner: practitioner.slug,
        account_id: reusableAccount.id,
        auth_user_id: owner.userId,
        auth_email: owner.authEmail,
        email: loginEmail
      });

      if (apply) {
        const { error } = await admin
          .from("practitioner_accounts")
          .update({
            auth_user_id: owner.userId,
            practitioner_id: practitioner.id,
            email: loginEmail,
            contact_slot: reusableAccount.contact_slot ?? "email",
            updated_at: new Date().toISOString()
          })
          .eq("id", reusableAccount.id);

        if (error) {
          throw error;
        }
      }

      continue;
    }

    operations.push({
      type: "create_account",
      practitioner: practitioner.slug,
      auth_user_id: owner.userId,
      auth_email: owner.authEmail,
      email: loginEmail,
      would_create_auth_user: owner.wouldCreate || undefined
    });

    if (apply) {
      const { data, error } = await admin
        .from("practitioner_accounts")
        .insert({
          auth_user_id: owner.userId,
          practitioner_id: practitioner.id,
          email: loginEmail,
          contact_slot: "email",
          login_count: 0,
          updated_at: new Date().toISOString()
        })
        .select("id")
        .maybeSingle<{ id: string }>();

      if (error || !data?.id) {
        throw error ?? new Error(`Failed to create practitioner account for ${practitioner.slug}.`);
      }

      usedAccountIds.add(data.id);
    }
  }

  let finalAccounts = existingAccounts;
  let sharedBilling: PractitionerBillingState | null = null;

  if (apply && conflicts.length === 0) {
    finalAccounts = await loadRelevantAccounts(admin, {
      practitionerIds: practitioners.map((row) => row.id),
      loginEmail,
      authUserIds: [
        primaryAuthUser.userId,
        ...[...secondaryAuthUsers.values()].map((item) => item.userId)
      ].filter((value): value is string => Boolean(value))
    });

    const leader = getPractitionerBillingLeader(
      finalAccounts as unknown as PractitionerBillingAccount[]
    );
    const billingState = toBillingState(leader);

    if (billingState) {
      await syncPractitionerBillingGroup(admin, {
        email: loginEmail,
        billing: billingState
      });
      sharedBilling = billingState;

      finalAccounts = await loadRelevantAccounts(admin, {
        practitionerIds: practitioners.map((row) => row.id),
        loginEmail,
        authUserIds: [
          primaryAuthUser.userId,
          ...[...secondaryAuthUsers.values()].map((item) => item.userId)
        ].filter((value): value is string => Boolean(value))
      });
    }
  }

  return {
    apply,
    login_email: loginEmail,
    auth_user: primaryAuthUser,
    secondary_auth_users: [...secondaryAuthUsers.entries()].map(([index, authUser]) => ({
      practitioner: practitioners[index]?.slug ?? String(index),
      ...authUser
    })),
    practitioners,
    existing_accounts: existingAccounts,
    conflicts,
    operations,
    shared_billing: sharedBilling,
    final_accounts: finalAccounts
  };
}
