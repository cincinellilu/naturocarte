#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";

function printUsage() {
  console.log(`
Usage:
  node scripts/link-practitioner-cabinets.mjs --email client@cabinet.fr --slug fiche-1 --slug fiche-2 [--slug fiche-3] [--apply]

Exemples:
  node scripts/link-practitioner-cabinets.mjs --email clara.cornaert.naturopathe@gmail.com --slug clara-cornaert-pantin --slug clara-cornaert-paris-10
  node scripts/link-practitioner-cabinets.mjs --email clara.cornaert.naturopathe@gmail.com --slug clara-cornaert-pantin --slug clara-cornaert-paris-10 --apply

Comportement:
  - Sans --apply: dry-run, aucune ecriture.
  - Avec --apply: rattache les fiches au meme praticien.
  - La 1re fiche utilise le vrai compte de connexion du client.
  - Les fiches suivantes utilisent des comptes auth techniques internes.
  - Le forfait et les donnees Stripe sont recopies sur toutes les fiches rattachees.
`.trim());
}

function parseArgs(argv) {
  const args = {
    apply: false,
    email: null,
    slugs: [],
    help: false
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      args.help = true;
      continue;
    }

    if (arg === "--apply") {
      args.apply = true;
      continue;
    }

    if (arg === "--email") {
      args.email = argv[index + 1]?.trim() ?? null;
      index += 1;
      continue;
    }

    if (arg === "--slug") {
      const slug = argv[index + 1]?.trim();
      if (slug) {
        args.slugs.push(slug);
      }
      index += 1;
      continue;
    }

    if (arg === "--slugs") {
      const rawValue = argv[index + 1] ?? "";
      args.slugs.push(
        ...rawValue
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      );
      index += 1;
      continue;
    }

    throw new Error(`Argument non reconnu: ${arg}`);
  }

  args.slugs = [...new Set(args.slugs)];
  return args;
}

function normalize(value) {
  return (value ?? "").trim().toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildSecondaryAuthEmail(loginEmail, cabinetPosition) {
  const [localPart, domain] = loginEmail.split("@");
  return `${localPart}+cabinet-${cabinetPosition}@${domain}`;
}

function getBillingPriority(account) {
  if (account.plan === "visibilite_plus") return 0;
  if (account.stripe_subscription_id) return 1;
  if (account.stripe_customer_id) return 2;
  return 3;
}

function compareBillingAccounts(left, right) {
  const leftPriority = getBillingPriority(left);
  const rightPriority = getBillingPriority(right);

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

const cli = parseArgs(process.argv);

if (cli.help) {
  printUsage();
  process.exit(0);
}

if (!cli.email || !isValidEmail(cli.email)) {
  printUsage();
  throw new Error("Passez un email valide avec --email.");
}

if (cli.slugs.length < 2) {
  printUsage();
  throw new Error("Passez au minimum 2 slugs avec --slug.");
}

const APPLY = cli.apply;
const LOGIN_EMAIL = cli.email.toLowerCase();
const TARGET_SLUGS = cli.slugs;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase credentials in environment.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

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
    throw error ?? new Error(`Failed to create auth user for ${email}.`);
  }

  return { userId: data.user.id, created: true };
}

async function loadTargetPractitioners() {
  const { data, error } = await supabase
    .from("practitioners")
    .select("id, slug, first_name, last_name, email, phone, adresse, postal_code, city, status")
    .in("slug", TARGET_SLUGS);

  if (error) throw error;

  const practitioners = data ?? [];
  if (practitioners.length !== TARGET_SLUGS.length) {
    const foundSlugs = new Set(practitioners.map((row) => row.slug));
    const missingSlugs = TARGET_SLUGS.filter((slug) => !foundSlugs.has(slug));
    throw new Error(`Slugs introuvables: ${missingSlugs.join(", ")}`);
  }

  return TARGET_SLUGS.map((slug) => practitioners.find((row) => row.slug === slug)).filter(Boolean);
}

async function loadRelevantAccounts(params) {
  const practitionerIdChunks = [];

  if (params.practitionerIds.length > 0) {
    practitionerIdChunks.push(
      await supabase
        .from("practitioner_accounts")
        .select(
          "id, auth_user_id, practitioner_id, email, plan, contact_slot, stripe_customer_id, stripe_subscription_id, stripe_subscription_status, stripe_price_id, stripe_current_period_end, login_count, last_login_at, created_at, updated_at"
        )
        .in("practitioner_id", params.practitionerIds)
        .order("created_at", { ascending: true })
    );
  }

  const emailChunk = await supabase
    .from("practitioner_accounts")
    .select(
      "id, auth_user_id, practitioner_id, email, plan, contact_slot, stripe_customer_id, stripe_subscription_id, stripe_subscription_status, stripe_price_id, stripe_current_period_end, login_count, last_login_at, created_at, updated_at"
    )
    .ilike("email", params.loginEmail)
    .order("created_at", { ascending: true });

  const authChunk =
    params.authUserIds.length > 0
      ? await supabase
          .from("practitioner_accounts")
          .select(
            "id, auth_user_id, practitioner_id, email, plan, contact_slot, stripe_customer_id, stripe_subscription_id, stripe_subscription_status, stripe_price_id, stripe_current_period_end, login_count, last_login_at, created_at, updated_at"
          )
          .in("auth_user_id", params.authUserIds)
          .order("created_at", { ascending: true })
      : { data: [], error: null };

  const results = [...practitionerIdChunks, emailChunk, authChunk];

  for (const result of results) {
    if (result.error) {
      throw result.error;
    }
  }

  const accounts = new Map();

  for (const result of results) {
    for (const account of result.data ?? []) {
      accounts.set(account.id, account);
    }
  }

  return [...accounts.values()];
}

function pickReusableAccount(params) {
  return (
    params.accounts.find(
      (account) =>
        !params.usedAccountIds.has(account.id) &&
        account.auth_user_id === params.authUserId &&
        !account.practitioner_id
    ) ?? null
  );
}

function syncBillingFromLeader(accounts) {
  const leader = [...accounts].sort(compareBillingAccounts)[0] ?? null;

  if (!leader) {
    return {
      plan: "presence",
      stripe_customer_id: null,
      stripe_subscription_id: null,
      stripe_subscription_status: null,
      stripe_price_id: null,
      stripe_current_period_end: null
    };
  }

  return {
    plan: leader.plan ?? "presence",
    stripe_customer_id: leader.stripe_customer_id ?? null,
    stripe_subscription_id: leader.stripe_subscription_id ?? null,
    stripe_subscription_status: leader.stripe_subscription_status ?? null,
    stripe_price_id: leader.stripe_price_id ?? null,
    stripe_current_period_end: leader.stripe_current_period_end ?? null
  };
}

async function propagateBillingGroup(loginEmail) {
  const { data: accounts, error } = await supabase
    .from("practitioner_accounts")
    .select(
      "id, auth_user_id, practitioner_id, email, plan, contact_slot, stripe_customer_id, stripe_subscription_id, stripe_subscription_status, stripe_price_id, stripe_current_period_end, login_count, last_login_at, created_at, updated_at"
    )
    .ilike("email", loginEmail)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const billingState = syncBillingFromLeader(accounts ?? []);
  const { error: updateError } = await supabase
    .from("practitioner_accounts")
    .update({
      ...billingState,
      updated_at: new Date().toISOString()
    })
    .ilike("email", loginEmail);

  if (updateError) {
    throw updateError;
  }

  return billingState;
}

async function main() {
  const practitioners = await loadTargetPractitioners();
  const primaryAuthUser = await ensureAuthUser(LOGIN_EMAIL);
  const secondaryAuthUsers = new Map();

  for (const [index] of practitioners.entries()) {
    if (index === 0) continue;

    const authEmail = buildSecondaryAuthEmail(LOGIN_EMAIL, index + 1);
    secondaryAuthUsers.set(index, {
      authEmail,
      ...(await ensureAuthUser(authEmail))
    });
  }

  const ownerUserIds = [
    primaryAuthUser.userId,
    ...[...secondaryAuthUsers.values()].map((item) => item.userId)
  ].filter(Boolean);

  const existingAccounts = await loadRelevantAccounts({
    practitionerIds: practitioners.map((row) => row.id),
    loginEmail: LOGIN_EMAIL,
    authUserIds: ownerUserIds
  });

  const targetPractitionerIds = new Set(practitioners.map((row) => row.id));
  const accountsByPractitionerId = new Map(
    existingAccounts
      .filter((row) => row.practitioner_id)
      .map((row) => [row.practitioner_id, row])
  );
  const usedAccountIds = new Set();
  const operations = [];
  const conflicts = [];

  for (const [index, practitioner] of practitioners.entries()) {
    const ownerUserId =
      index === 0 ? primaryAuthUser.userId : secondaryAuthUsers.get(index)?.userId ?? null;
    const ownerAuthEmail =
      index === 0 ? LOGIN_EMAIL : secondaryAuthUsers.get(index)?.authEmail ?? null;

    if (!ownerUserId) {
      conflicts.push({
        practitioner: practitioner.slug,
        reason: "missing_auth_user",
        auth_email: ownerAuthEmail
      });
      continue;
    }

    const ownedAccount = existingAccounts.find((account) => account.auth_user_id === ownerUserId) ?? null;

    if (
      ownedAccount?.practitioner_id &&
      ownedAccount.practitioner_id !== practitioner.id &&
      !targetPractitionerIds.has(ownedAccount.practitioner_id)
    ) {
      conflicts.push({
        practitioner: practitioner.slug,
        reason: "auth_user_already_linked_elsewhere",
        auth_email: ownerAuthEmail,
        auth_user_id: ownerUserId,
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
        auth_user_id: ownerUserId,
        auth_email: ownerAuthEmail,
        email: LOGIN_EMAIL
      });

      if (APPLY) {
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

    const reusableAccount = pickReusableAccount({
      accounts: existingAccounts,
      usedAccountIds,
      authUserId: ownerUserId
    });

    if (reusableAccount) {
      usedAccountIds.add(reusableAccount.id);
      operations.push({
        type: "reuse_unlinked_account",
        practitioner: practitioner.slug,
        account_id: reusableAccount.id,
        auth_user_id: ownerUserId,
        auth_email: ownerAuthEmail,
        email: LOGIN_EMAIL
      });

      if (APPLY) {
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

    if (APPLY) {
      const { data, error } = await supabase
        .from("practitioner_accounts")
        .insert({
          auth_user_id: ownerUserId,
          practitioner_id: practitioner.id,
          email: LOGIN_EMAIL,
          contact_slot: "email",
          login_count: 0,
          updated_at: new Date().toISOString()
        })
        .select("id")
        .maybeSingle();

      if (error || !data?.id) {
        throw error ?? new Error(`Failed to create practitioner account for ${practitioner.slug}.`);
      }

      usedAccountIds.add(data.id);
    }
  }

  if (conflicts.length > 0) {
    console.log(
      JSON.stringify(
        {
          apply: APPLY,
          login_email: LOGIN_EMAIL,
          practitioners,
          existing_accounts: existingAccounts,
          conflicts,
          operations
        },
        null,
        2
      )
    );
    process.exitCode = 1;
    return;
  }

  let sharedBilling = null;
  let finalAccounts = existingAccounts;

  if (APPLY) {
    sharedBilling = await propagateBillingGroup(LOGIN_EMAIL);
    finalAccounts = await loadRelevantAccounts({
      practitionerIds: practitioners.map((row) => row.id),
      loginEmail: LOGIN_EMAIL,
      authUserIds: ownerUserIds
    });
  }

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
        shared_billing: sharedBilling,
        final_accounts: finalAccounts
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
