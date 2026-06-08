import { createClient } from "@supabase/supabase-js";

const LOGIN_EMAIL = "clara.cornaert.naturopathe@gmail.com";
const TARGET_SLUGS = ["clara-cornaert-pantin", "clara-cornaert-paris-10"];

const APPLY = process.argv.includes("apply");
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase credentials in environment.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

function normalize(value) {
  return (value ?? "").trim().toLowerCase();
}

async function listAllUsersByEmail(email) {
  const matches = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;

    const users = data?.users ?? [];
    for (const user of users) {
      if (normalize(user.email) === normalize(email)) {
        matches.push(user);
      }
    }

    if (users.length < 200) break;
    page += 1;
  }

  return matches;
}

async function ensureAuthUser(email) {
  const matches = await listAllUsersByEmail(email);
  if (matches[0]?.id) {
    return { userId: matches[0].id, created: false };
  }

  if (!APPLY) {
    return { userId: null, created: false };
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true
  });

  if (error || !data.user?.id) {
    throw error ?? new Error("Failed to create auth user.");
  }

  return { userId: data.user.id, created: true };
}

function buildSecondaryAuthEmail(index) {
  const [localPart, domain] = LOGIN_EMAIL.split("@");
  return `${localPart}+cabinet-${index + 1}@${domain}`;
}

async function loadTargetPractitioners() {
  const { data, error } = await supabase
    .from("practitioners")
    .select("id, slug, first_name, last_name, email, phone, adresse, postal_code, city, status")
    .in("slug", TARGET_SLUGS);

  if (error) throw error;

  const practitioners = data ?? [];
  if (practitioners.length !== TARGET_SLUGS.length) {
    throw new Error(`Expected ${TARGET_SLUGS.length} target practitioners, found ${practitioners.length}.`);
  }

  return TARGET_SLUGS.map((slug) => practitioners.find((row) => row.slug === slug)).filter(Boolean);
}

async function loadRelevantAccounts(params) {
  const practitionerIds = params.practitionerIds.join(",");
  const authCondition = params.userId ? `auth_user_id.eq.${params.userId}` : null;
  const conditions = [
    `practitioner_id.in.(${practitionerIds})`,
    `email.ilike.${LOGIN_EMAIL}`,
    authCondition
  ].filter(Boolean);

  const { data, error } = await supabase
    .from("practitioner_accounts")
    .select(
      "id, auth_user_id, practitioner_id, email, plan, contact_slot, stripe_customer_id, stripe_subscription_status, login_count, last_login_at, created_at, updated_at"
    )
    .or(conditions.join(","))
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

function buildFallbackAccountEmail(index) {
  const [localPart, domain] = LOGIN_EMAIL.split("@");
  return `${localPart}+cabinet${index + 1}@${domain}`;
}

async function insertAccount(payload, fallbackIndex) {
  let { data, error } = await supabase
    .from("practitioner_accounts")
    .insert(payload)
    .select("id")
    .maybeSingle();

  if (!error && data?.id) {
    return { id: data.id, usedFallbackEmail: false };
  }

  if (!APPLY) {
    return { id: null, usedFallbackEmail: false, simulatedError: error?.message ?? "dry_run" };
  }

  const fallbackEmail = buildFallbackAccountEmail(fallbackIndex);
  ({ data, error } = await supabase
    .from("practitioner_accounts")
    .insert({ ...payload, email: fallbackEmail })
    .select("id")
    .maybeSingle());

  if (error || !data?.id) {
    throw error ?? new Error("Failed to insert practitioner account.");
  }

  return { id: data.id, usedFallbackEmail: true, fallbackEmail };
}

async function main() {
  const practitioners = await loadTargetPractitioners();
  const primaryAuthUser = await ensureAuthUser(LOGIN_EMAIL);
  const userId = primaryAuthUser.userId;
  const secondaryAuthUsers = new Map();

  for (const [index] of practitioners.entries()) {
    if (index === 0) continue;

    const authEmail = buildSecondaryAuthEmail(index);
    secondaryAuthUsers.set(index, {
      authEmail,
      ...(await ensureAuthUser(authEmail))
    });
  }

  const existingAccounts = await loadRelevantAccounts({
    practitionerIds: practitioners.map((row) => row.id),
    userId
  });

  const accountsByPractitionerId = new Map(
    existingAccounts
      .filter((row) => row.practitioner_id)
      .map((row) => [row.practitioner_id, row])
  );
  const reusableAccounts = existingAccounts.filter(
    (row) => !row.practitioner_id && row.auth_user_id !== userId
  );
  const operations = [];
  const insertedAccountIds = [];
  let fallbackEmailCount = 0;

  for (const [index, practitioner] of practitioners.entries()) {
    const ownerUserId =
      index === 0 ? userId : (secondaryAuthUsers.get(index)?.userId ?? null);
    const ownerAuthEmail =
      index === 0 ? LOGIN_EMAIL : (secondaryAuthUsers.get(index)?.authEmail ?? null);
    const existingLinkedAccount = accountsByPractitionerId.get(practitioner.id) ?? null;

    if (existingLinkedAccount) {
      operations.push({
        type: "link_existing_account",
        practitioner: practitioner.slug,
        account_id: existingLinkedAccount.id,
        auth_user_id: ownerUserId,
        auth_email: ownerAuthEmail,
        email: LOGIN_EMAIL
      });

      if (APPLY && ownerUserId) {
        const { error } = await supabase
          .from("practitioner_accounts")
          .update({
            auth_user_id: ownerUserId,
            email: LOGIN_EMAIL,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingLinkedAccount.id);

        if (error) {
          throw error;
        }
      }

      continue;
    }

    const reusableAccount = reusableAccounts.shift() ?? null;

    if (reusableAccount) {
      operations.push({
        type: "reuse_unlinked_account",
        practitioner: practitioner.slug,
        account_id: reusableAccount.id,
        auth_user_id: ownerUserId,
        auth_email: ownerAuthEmail,
        email: LOGIN_EMAIL
      });

      if (APPLY && ownerUserId) {
        const { error } = await supabase
          .from("practitioner_accounts")
          .update({
            auth_user_id: ownerUserId,
            practitioner_id: practitioner.id,
            email: LOGIN_EMAIL,
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
      auth_user_id: ownerUserId,
      auth_email: ownerAuthEmail,
      email: LOGIN_EMAIL
    });

    if (APPLY && ownerUserId) {
      const result = await insertAccount(
        {
          auth_user_id: ownerUserId,
          practitioner_id: practitioner.id,
          email: LOGIN_EMAIL,
          contact_slot: "email",
          login_count: 0,
          updated_at: new Date().toISOString()
        },
        fallbackEmailCount
      );

      if (result.id) {
        insertedAccountIds.push(result.id);
      }

      if (result.usedFallbackEmail) {
        fallbackEmailCount += 1;
        operations.push({
          type: "fallback_email_used",
          practitioner: practitioner.slug,
          email: result.fallbackEmail
        });
      }
    }
  }

  const finalAccounts =
    APPLY && userId
      ? await loadRelevantAccounts({
          practitionerIds: practitioners.map((row) => row.id),
          userId
        })
      : existingAccounts;

  console.log(
    JSON.stringify(
      {
        apply: APPLY,
        login_email: LOGIN_EMAIL,
        auth_user: primaryAuthUser,
        secondary_auth_users: [...secondaryAuthUsers.entries()].map(([index, authUser]) => ({
          practitioner: practitioners[index]?.slug ?? index,
          ...authUser
        })),
        practitioners,
        existing_accounts: existingAccounts,
        operations,
        inserted_account_ids: insertedAccountIds,
        final_accounts: finalAccounts
      },
      null,
      2
    )
  );
}

main().catch(async (error) => {
  console.error(error);
  process.exitCode = 1;
});
