#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";

function printUsage() {
  console.log(`
Usage:
  node scripts/tmp/delete-practitioner-record.mjs --practitioner-id PRACTITIONER_ID [--account-id ACCOUNT_ID] [--apply]

Exemples:
  node scripts/tmp/delete-practitioner-record.mjs --practitioner-id b510d06a-e0e7-4d1d-bee4-0bb92628316d
  node scripts/tmp/delete-practitioner-record.mjs --practitioner-id b510d06a-e0e7-4d1d-bee4-0bb92628316d --account-id 765139b6-8dbf-4142-ac53-38659f6721db --apply

Comportement:
  - Sans --apply: audit uniquement, aucune suppression.
  - Avec --apply: supprime la fiche praticien et ses dependances directes.
  - Le compte auth Supabase n'est pas supprime.
`.trim());
}

function parseArgs(argv) {
  const args = {
    practitionerId: null,
    accountId: null,
    apply: false,
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

    if (arg === "--practitioner-id") {
      args.practitionerId = argv[index + 1]?.trim() ?? null;
      index += 1;
      continue;
    }

    if (arg === "--account-id") {
      args.accountId = argv[index + 1]?.trim() ?? null;
      index += 1;
      continue;
    }

    throw new Error(`Argument non reconnu: ${arg}`);
  }

  return args;
}

const cli = parseArgs(process.argv);

if (cli.help) {
  printUsage();
  process.exit(0);
}

if (!cli.practitionerId) {
  printUsage();
  throw new Error("Passez un practitioner id avec --practitioner-id.");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase credentials in environment.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const APPLY = cli.apply;
const TARGET_PRACTITIONER_ID = cli.practitionerId;
const TARGET_ACCOUNT_ID = cli.accountId;

const TABLES_BY_PRACTITIONER_ID = [
  "user_favorite_practitioners",
  "practitioner_reviews",
  "practitioner_profile_stats",
  "product_events",
  "practitioner_claim_campaign_emails",
  "marketing_email_events",
  "marketing_email_recipients",
  "marketing_email_suppressions"
];

async function loadPractitioner() {
  const { data, error } = await supabase
    .from("practitioners")
    .select("id, slug, first_name, last_name, email, phone, adresse, postal_code, city, status")
    .eq("id", TARGET_PRACTITIONER_ID)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function loadAccounts() {
  let query = supabase
    .from("practitioner_accounts")
    .select(
      "id, auth_user_id, practitioner_id, email, plan, contact_slot, stripe_customer_id, stripe_subscription_id, stripe_subscription_status, stripe_price_id, stripe_current_period_end, created_at, updated_at, last_login_at, login_count"
    )
    .eq("practitioner_id", TARGET_PRACTITIONER_ID)
    .order("created_at", { ascending: true });

  if (TARGET_ACCOUNT_ID) {
    query = query.eq("id", TARGET_ACCOUNT_ID);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

async function countByColumn(table, column, value) {
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq(column, value);

  if (error) throw error;
  return count ?? 0;
}

async function auditChildRows(accountIds) {
  const counts = {};

  for (const table of TABLES_BY_PRACTITIONER_ID) {
    counts[`${table}.practitioner_id`] = await countByColumn(
      table,
      "practitioner_id",
      TARGET_PRACTITIONER_ID
    );
  }

  for (const accountId of accountIds) {
    counts[`product_events.practitioner_account_id:${accountId}`] = await countByColumn(
      "product_events",
      "practitioner_account_id",
      accountId
    );
  }

  counts["practitioner_accounts.practitioner_id"] = accountIds.length;
  return counts;
}

async function deleteByColumn(table, column, value) {
  const { error } = await supabase.from(table).delete().eq(column, value);
  if (error) throw error;
}

async function main() {
  const practitioner = await loadPractitioner();

  if (!practitioner) {
    throw new Error(`Practitioner not found: ${TARGET_PRACTITIONER_ID}`);
  }

  const accounts = await loadAccounts();
  const accountIds = accounts.map((account) => account.id);
  const childCounts = await auditChildRows(accountIds);

  if (APPLY) {
    for (const table of TABLES_BY_PRACTITIONER_ID) {
      if ((childCounts[`${table}.practitioner_id`] ?? 0) > 0) {
        await deleteByColumn(table, "practitioner_id", TARGET_PRACTITIONER_ID);
      }
    }

    for (const accountId of accountIds) {
      if ((childCounts[`product_events.practitioner_account_id:${accountId}`] ?? 0) > 0) {
        await deleteByColumn("product_events", "practitioner_account_id", accountId);
      }
    }

    if (accountIds.length > 0) {
      const { error: accountDeleteError } = await supabase
        .from("practitioner_accounts")
        .delete()
        .in("id", accountIds);

      if (accountDeleteError) {
        throw accountDeleteError;
      }
    }

    const { error: practitionerDeleteError } = await supabase
      .from("practitioners")
      .delete()
      .eq("id", TARGET_PRACTITIONER_ID);

    if (practitionerDeleteError) {
      throw practitionerDeleteError;
    }
  }

  const practitionerAfter = APPLY ? await loadPractitioner() : practitioner;
  const accountsAfter = APPLY ? await loadAccounts() : accounts;
  const countsAfter = APPLY ? await auditChildRows(accountsAfter.map((account) => account.id)) : childCounts;

  console.log(
    JSON.stringify(
      {
        apply: APPLY,
        target: {
          practitioner_id: TARGET_PRACTITIONER_ID,
          account_id: TARGET_ACCOUNT_ID
        },
        before: {
          practitioner,
          accounts,
          child_counts: childCounts
        },
        after: {
          practitioner: practitionerAfter,
          accounts: accountsAfter,
          child_counts: countsAfter
        }
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
