import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createAppUrl } from "@/lib/app-url";
import {
  createPractitionerSessionCookieValue,
  getPractitionerSessionCookieOptions,
  PRACTITIONER_SESSION_COOKIE_NAME
} from "@/lib/practitioner-auth";
import { recordProductEvent } from "@/lib/product-events-server";
import {
  normalizePractitionerClaimCampaignId
} from "@/lib/practitioner-claim-campaigns";
import { recordPractitionerClaimCampaignClaim } from "@/lib/practitioner-claim-campaigns-server";
import {
  PRACTITIONER_STATUS_HIDDEN_CONTACTED,
  PRACTITIONER_STATUS_PUBLISHED,
  PRACTITIONER_STATUS_PUBLISHED_CONTACTED,
  MANAGED_PROSPECT_STATUSES
} from "@/lib/practitioner-status";
import { getDefaultContactSlot, isPractitionerClaimed } from "@/lib/practitioner-public-contact";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { USER_SESSION_COOKIE_NAME } from "@/lib/user-auth";

type ClaimPayload = {
  practitioner_id?: unknown;
  first_name?: unknown;
  last_name?: unknown;
  email?: unknown;
  campaign?: unknown;
  tracking?: unknown;
  tracking_token?: unknown;
};

type PractitionerClaimRow = {
  id: string;
  slug: string;
  first_name: string | null;
  last_name: string | null;
  status: string | null;
  phone: string | null;
  email: string | null;
  booking_url: string | null;
  website: string | null;
  practitioner_accounts: PractitionerClaimAccount[] | PractitionerClaimAccount | null;
};

type PractitionerClaimAccount = {
  id: string;
  auth_user_id: string | null;
  practitioner_id: string | null;
  email: string | null;
  login_count: number | null;
};

type PractitionerAccountRow = {
  id: string;
  practitioner_id: string | null;
  login_count: number | null;
};

function normalizeText(value: unknown): string {
  return typeof value === "string"
    ? value
        .trim()
        .replace(/[%_]/g, "")
        .replace(/\s+/g, " ")
        .slice(0, 120)
    : "";
}

function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase().slice(0, 180) : "";
}

function normalizeTrackingToken(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, 120) : "";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeName(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isSamePerson(params: {
  practitioner: PractitionerClaimRow;
  firstName: string;
  lastName: string;
  email: string;
}): boolean {
  const practitionerFirst = normalizeName(params.practitioner.first_name);
  const practitionerLast = normalizeName(params.practitioner.last_name);
  const inputFirst = normalizeName(params.firstName);
  const inputLast = normalizeName(params.lastName);
  const directNameMatch = practitionerFirst === inputFirst && practitionerLast === inputLast;
  const swappedNameMatch = practitionerFirst === inputLast && practitionerLast === inputFirst;
  const emailMatch =
    Boolean(params.practitioner.email?.trim()) &&
    params.practitioner.email!.trim().toLowerCase() === params.email;

  return directNameMatch || swappedNameMatch || emailMatch;
}

function getPublishedStatus(currentStatus: string | null): string {
  return currentStatus === PRACTITIONER_STATUS_HIDDEN_CONTACTED
    ? PRACTITIONER_STATUS_PUBLISHED_CONTACTED
    : PRACTITIONER_STATUS_PUBLISHED;
}

function normalizeAccounts(
  accounts: PractitionerClaimAccount[] | PractitionerClaimAccount | null
): PractitionerClaimAccount[] {
  if (Array.isArray(accounts)) return accounts;
  return accounts ? [accounts] : [];
}

function getClaimedAccountForEmail(params: {
  accounts: PractitionerClaimAccount[] | PractitionerClaimAccount | null;
  email: string;
}): PractitionerClaimAccount | null {
  return (
    normalizeAccounts(params.accounts).find(
      (account) => account.email?.trim().toLowerCase() === params.email
    ) ?? null
  );
}

function createClaimSuccessResponse(params: {
  authUserId: string;
  email: string;
}): NextResponse {
  const response = NextResponse.json({
    ok: true,
    redirectTo: "/praticiens/dashboard?saved=claimed"
  });
  response.cookies.set({
    name: PRACTITIONER_SESSION_COOKIE_NAME,
    value: createPractitionerSessionCookieValue({
      userId: params.authUserId,
      email: params.email
    }),
    ...getPractitionerSessionCookieOptions()
  });
  response.cookies.delete(USER_SESSION_COOKIE_NAME);

  return response;
}

async function createSuccessFromExistingLink(params: {
  supabase: ReturnType<typeof getSupabaseAdminClient>;
  request: Request;
  practitioner: PractitionerClaimRow;
  email: string;
}): Promise<NextResponse | null> {
  const linkedAccounts = normalizeAccounts(params.practitioner.practitioner_accounts);
  const linkedAccount =
    linkedAccounts.find((account) => account.email?.trim().toLowerCase() === params.email) ??
    (params.practitioner.email?.trim().toLowerCase() === params.email
      ? linkedAccounts[0] ?? null
      : null);

  if (!linkedAccount) return null;

  const authUserId =
    linkedAccount.auth_user_id ??
    (await getOrCreateAuthUserId({
      email: params.email,
      request: params.request,
      supabase: params.supabase
    }));

  if (!authUserId) return null;

  const now = new Date().toISOString();
  await params.supabase
    .from("practitioner_accounts")
    .update({
      auth_user_id: authUserId,
      email: params.email,
      last_login_at: now,
      login_count: (linkedAccount.login_count ?? 0) + 1,
      updated_at: now
    })
    .eq("id", linkedAccount.id);

  return createClaimSuccessResponse({
    authUserId,
    email: params.email
  });
}

async function getOrCreateAuthUserId(params: {
  email: string;
  request: Request;
  supabase: ReturnType<typeof getSupabaseAdminClient>;
}): Promise<string | null> {
  const redirectTo = createAppUrl("/praticiens/auth/callback", params.request).toString();
  const link = await params.supabase.auth.admin.generateLink({
    type: "magiclink",
    email: params.email,
    options: { redirectTo }
  });

  if (link.data.user?.id) return link.data.user.id;

  const created = await params.supabase.auth.admin.createUser({
    email: params.email,
    email_confirm: true
  });

  if (created.data.user?.id) return created.data.user.id;

  const retry = await params.supabase.auth.admin.generateLink({
    type: "magiclink",
    email: params.email,
    options: { redirectTo }
  });

  return retry.data.user?.id ?? null;
}

async function ensureUserAccount(params: {
  authUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  supabase: ReturnType<typeof getSupabaseAdminClient>;
}) {
  const now = new Date().toISOString();
  const { data: existingByAuth } = await params.supabase
    .from("user_accounts")
    .select("id")
    .eq("auth_user_id", params.authUserId)
    .maybeSingle<{ id: string }>();

  if (existingByAuth?.id) {
    await params.supabase
      .from("user_accounts")
      .update({
        email: params.email,
        first_name: params.firstName,
        last_name: params.lastName,
        updated_at: now
      })
      .eq("id", existingByAuth.id);
    return;
  }

  const { data: existingByEmail } = await params.supabase
    .from("user_accounts")
    .select("id")
    .ilike("email", params.email)
    .maybeSingle<{ id: string }>();

  if (existingByEmail?.id) {
    await params.supabase
      .from("user_accounts")
      .update({
        auth_user_id: params.authUserId,
        email: params.email,
        first_name: params.firstName,
        last_name: params.lastName,
        updated_at: now
      })
      .eq("id", existingByEmail.id);
    return;
  }

  await params.supabase.from("user_accounts").insert({
    auth_user_id: params.authUserId,
    email: params.email,
    first_name: params.firstName,
    last_name: params.lastName
  });
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as ClaimPayload;
  const practitionerId = normalizeText(payload.practitioner_id);
  const firstName = normalizeText(payload.first_name);
  const lastName = normalizeText(payload.last_name);
  const email = normalizeEmail(payload.email);
  const campaignId = normalizePractitionerClaimCampaignId(
    typeof payload.campaign === "string" ? payload.campaign : null
  );
  const trackingToken =
    normalizeTrackingToken(payload.tracking) || normalizeTrackingToken(payload.tracking_token);

  if (!practitionerId || !firstName || !lastName || !isValidEmail(email)) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const { data: practitioner, error: practitionerError } = await supabase
    .from("practitioners")
    .select(
      "id, slug, first_name, last_name, status, phone, email, booking_url, website, practitioner_accounts(id, auth_user_id, practitioner_id, email, login_count)"
    )
    .eq("id", practitionerId)
    .in("status", [...MANAGED_PROSPECT_STATUSES])
    .maybeSingle<PractitionerClaimRow>();

  if (practitionerError || !practitioner) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (!isSamePerson({ practitioner, firstName, lastName, email })) {
    return NextResponse.json({ error: "identity_mismatch" }, { status: 403 });
  }

  const claimedAccountForEmail = getClaimedAccountForEmail({
    accounts: practitioner.practitioner_accounts,
    email
  });

  if (isPractitionerClaimed(practitioner.practitioner_accounts) && !claimedAccountForEmail) {
    const existingLinkSuccess = await createSuccessFromExistingLink({
      supabase,
      request,
      practitioner,
      email
    });

    if (existingLinkSuccess) {
      return existingLinkSuccess;
    }

    return NextResponse.json({ error: "already_claimed" }, { status: 409 });
  }

  const authUserId =
    claimedAccountForEmail?.auth_user_id ?? (await getOrCreateAuthUserId({ email, request, supabase }));
  if (!authUserId) {
    return NextResponse.json({ error: "auth_user_failed" }, { status: 500 });
  }

  const { data: accountByAuth, error: accountByAuthError } = await supabase
    .from("practitioner_accounts")
    .select("id, practitioner_id, login_count")
    .eq("auth_user_id", authUserId)
    .maybeSingle<PractitionerAccountRow>();

  if (accountByAuthError) {
    return NextResponse.json({ error: "account_lookup_failed" }, { status: 500 });
  }

  if (accountByAuth?.practitioner_id && accountByAuth.practitioner_id !== practitioner.id) {
    return NextResponse.json({ error: "account_already_linked" }, { status: 409 });
  }

  const { data: accountByEmail, error: accountByEmailError } = await supabase
    .from("practitioner_accounts")
    .select("id, practitioner_id, login_count")
    .ilike("email", email)
    .maybeSingle<PractitionerAccountRow>();

  if (accountByEmailError) {
    return NextResponse.json({ error: "account_lookup_failed" }, { status: 500 });
  }

  if (accountByEmail?.practitioner_id && accountByEmail.practitioner_id !== practitioner.id) {
    return NextResponse.json({ error: "account_already_linked" }, { status: 409 });
  }

  const now = new Date().toISOString();
  const contactSlot = getDefaultContactSlot(practitioner);
  const account =
    claimedAccountForEmail ??
    accountByAuth ??
    accountByEmail ??
    null;
  const accountId = account?.id ?? null;

  if (accountId) {
    const nextLoginCount = (account?.login_count ?? 0) + 1;
    const { error: accountUpdateError } = await supabase
      .from("practitioner_accounts")
      .update({
        auth_user_id: authUserId,
        practitioner_id: practitioner.id,
        email,
        contact_slot: contactSlot,
        last_login_at: now,
        login_count: nextLoginCount,
        updated_at: now
      })
      .eq("id", accountId);

    if (accountUpdateError) {
      return NextResponse.json({ error: "account_update_failed" }, { status: 500 });
    }
  } else {
    const { error: accountInsertError } = await supabase.from("practitioner_accounts").insert({
      auth_user_id: authUserId,
      practitioner_id: practitioner.id,
      email,
      contact_slot: contactSlot,
      last_login_at: now,
      login_count: 1,
      updated_at: now
    });

    if (accountInsertError) {
      return NextResponse.json({ error: "account_creation_failed" }, { status: 500 });
    }
  }

  const { error: practitionerUpdateError } = await supabase
    .from("practitioners")
    .update({
      email: practitioner.email ?? email,
      status: getPublishedStatus(practitioner.status),
      updated_at: now
    })
    .eq("id", practitioner.id);

  if (practitionerUpdateError) {
    console.warn("practitioner claim profile update failed after account link", practitionerUpdateError);
  }

  await supabase.auth.admin
    .updateUserById(authUserId, {
      user_metadata: {
        practitioner_first_name: firstName,
        practitioner_last_name: lastName,
        claimed_practitioner_id: practitioner.id
      }
    })
    .catch((error) => {
      console.warn("practitioner claim auth metadata update failed", error);
    });
  await ensureUserAccount({ authUserId, email, firstName, lastName, supabase }).catch((error) => {
    console.warn("practitioner claim user account sync failed", error);
  });

  revalidatePath(`/naturopathe/${practitioner.slug}`);
  revalidatePath("/carte");

  const response = createClaimSuccessResponse({ authUserId, email });

  await recordProductEvent({
    eventName: "practitioner_profile_claimed",
    request,
    practitionerId: practitioner.id,
    metadata: {
      contact_slot: contactSlot,
      campaign_id: campaignId,
      tracking_token: Boolean(trackingToken)
    }
  }).catch(() => {});

  if (campaignId || trackingToken) {
    await recordPractitionerClaimCampaignClaim({
      campaignId,
      recipientEmail: email,
      practitionerId: practitioner.id,
      trackingToken: trackingToken || null
    }).catch((error) => {
      console.warn("practitioner claim campaign claim tracking failed", error);
    });
  }

  return response;
}
