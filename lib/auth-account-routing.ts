import type { SupabaseClient } from "@supabase/supabase-js";

type PractitionerAccountRow = {
  id: string;
  practitioner_id: string | null;
};

type PractitionerRow = {
  id: string;
};

type UserAccountRow = {
  id: string;
};

type AdminClient = SupabaseClient;

export async function ensureUserAccount(
  admin: AdminClient,
  params: { authUserId: string; email: string }
): Promise<{ ok: true } | { ok: false; error: unknown }> {
  const normalizedEmail = params.email.toLowerCase();
  const now = new Date().toISOString();

  const { data: existingByAuth, error: authLookupError } = await admin
    .from("user_accounts")
    .select("id")
    .eq("auth_user_id", params.authUserId)
    .maybeSingle<UserAccountRow>();

  if (authLookupError) return { ok: false, error: authLookupError };

  if (existingByAuth?.id) {
    const { error } = await admin
      .from("user_accounts")
      .update({ email: normalizedEmail, updated_at: now })
      .eq("id", existingByAuth.id);

    return error ? { ok: false, error } : { ok: true };
  }

  const { data: existingByEmail, error: emailLookupError } = await admin
    .from("user_accounts")
    .select("id")
    .ilike("email", normalizedEmail)
    .limit(1)
    .maybeSingle<UserAccountRow>();

  if (emailLookupError) return { ok: false, error: emailLookupError };

  if (existingByEmail?.id) {
    const { error } = await admin
      .from("user_accounts")
      .update({ auth_user_id: params.authUserId, email: normalizedEmail, updated_at: now })
      .eq("id", existingByEmail.id);

    return error ? { ok: false, error } : { ok: true };
  }

  const { error } = await admin.from("user_accounts").insert({
    auth_user_id: params.authUserId,
    email: normalizedEmail
  });

  return error ? { ok: false, error } : { ok: true };
}

export async function ensurePractitionerAccount(
  admin: AdminClient,
  params: { authUserId: string; email: string }
): Promise<{ ok: true; accountId: string } | { ok: false; error: unknown }> {
  const normalizedEmail = params.email.toLowerCase();
  const now = new Date().toISOString();

  const { data: existingByAuth, error: authLookupError } = await admin
    .from("practitioner_accounts")
    .select("id")
    .eq("auth_user_id", params.authUserId)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (authLookupError) return { ok: false, error: authLookupError };

  if (existingByAuth?.id) {
    const { error } = await admin
      .from("practitioner_accounts")
      .update({ email: normalizedEmail, updated_at: now })
      .eq("id", existingByAuth.id);

    return error ? { ok: false, error } : { ok: true, accountId: existingByAuth.id };
  }

  const { data, error } = await admin
    .from("practitioner_accounts")
    .insert({
      auth_user_id: params.authUserId,
      email: normalizedEmail,
      updated_at: now
    })
    .select("id")
    .single<{ id: string }>();

  return error || !data?.id ? { ok: false, error } : { ok: true, accountId: data.id };
}

export async function resolvePractitionerAccount(
  admin: AdminClient,
  params: { authUserId: string; email: string }
): Promise<
  | { isPractitioner: true; accountId: string }
  | { isPractitioner: false }
  | { isPractitioner: false; error: unknown }
> {
  const normalizedEmail = params.email.toLowerCase();
  const now = new Date().toISOString();

  const { data: existingByAuth, error: authLookupError } = await admin
    .from("practitioner_accounts")
    .select("id, practitioner_id")
    .eq("auth_user_id", params.authUserId)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle<PractitionerAccountRow>();

  if (authLookupError) return { isPractitioner: false, error: authLookupError };

  if (existingByAuth?.id) {
    const { error } = await admin
      .from("practitioner_accounts")
      .update({ email: normalizedEmail, updated_at: now })
      .eq("id", existingByAuth.id);

    if (error) return { isPractitioner: false, error };
    return { isPractitioner: true, accountId: existingByAuth.id };
  }

  const { data: existingByEmail, error: accountEmailLookupError } = await admin
    .from("practitioner_accounts")
    .select("id, practitioner_id")
    .ilike("email", normalizedEmail)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle<PractitionerAccountRow>();

  if (accountEmailLookupError) return { isPractitioner: false, error: accountEmailLookupError };

  if (existingByEmail?.id) {
    const { error } = await admin
      .from("practitioner_accounts")
      .update({ auth_user_id: params.authUserId, email: normalizedEmail, updated_at: now })
      .eq("id", existingByEmail.id);

    if (error) return { isPractitioner: false, error };
    return { isPractitioner: true, accountId: existingByEmail.id };
  }

  const { data: practitioner, error: practitionerLookupError } = await admin
    .from("practitioners")
    .select("id")
    .ilike("email", normalizedEmail)
    .limit(1)
    .maybeSingle<PractitionerRow>();

  if (practitionerLookupError) return { isPractitioner: false, error: practitionerLookupError };
  if (!practitioner?.id) return { isPractitioner: false };

  const { data: existingByPractitioner, error: practitionerAccountLookupError } = await admin
    .from("practitioner_accounts")
    .select("id, practitioner_id")
    .eq("practitioner_id", practitioner.id)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle<PractitionerAccountRow>();

  if (practitionerAccountLookupError) {
    return { isPractitioner: false, error: practitionerAccountLookupError };
  }

  if (existingByPractitioner?.id) {
    const { error } = await admin
      .from("practitioner_accounts")
      .update({ auth_user_id: params.authUserId, email: normalizedEmail, updated_at: now })
      .eq("id", existingByPractitioner.id);

    if (error) return { isPractitioner: false, error };
    return { isPractitioner: true, accountId: existingByPractitioner.id };
  }

  const { data: createdAccount, error: createError } = await admin
    .from("practitioner_accounts")
    .insert({
      auth_user_id: params.authUserId,
      practitioner_id: practitioner.id,
      email: normalizedEmail,
      updated_at: now
    })
    .select("id")
    .single<{ id: string }>();

  if (createError) return { isPractitioner: false, error: createError };
  if (!createdAccount?.id) return { isPractitioner: false, error: new Error("missing_account_id") };

  return { isPractitioner: true, accountId: createdAccount.id };
}

export async function markPractitionerAccountLogin(
  admin: AdminClient,
  params: { accountId: string }
): Promise<{ ok: true } | { ok: false; error: unknown }> {
  const now = new Date().toISOString();

  const { data: account, error: lookupError } = await admin
    .from("practitioner_accounts")
    .select("id, login_count")
    .eq("id", params.accountId)
    .maybeSingle<{ id: string; login_count: number | null }>();

  if (lookupError) return { ok: false, error: lookupError };
  if (!account?.id) return { ok: false, error: new Error("account_not_found") };

  const { error } = await admin
    .from("practitioner_accounts")
    .update({
      last_login_at: now,
      login_count: (account.login_count ?? 0) + 1,
      updated_at: now
    })
    .eq("id", account.id);

  return error ? { ok: false, error } : { ok: true };
}
