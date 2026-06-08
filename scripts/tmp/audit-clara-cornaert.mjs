import { createClient } from "@supabase/supabase-js";

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

async function listAllUsers() {
  const users = [];
  let page = 1;

  while (true) {
    const result = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (result.error) {
      throw result.error;
    }

    const batch = result.data?.users ?? [];
    users.push(...batch);

    if (batch.length < 200) {
      break;
    }

    page += 1;
  }

  return users;
}

async function main() {
  const practitionerQueries = await Promise.all([
    supabase
      .from("practitioners")
      .select("id, slug, first_name, last_name, email, phone, adresse, postal_code, city, status")
      .ilike("last_name", "%cornaert%")
      .order("created_at", { ascending: false }),
    supabase
      .from("practitioners")
      .select("id, slug, first_name, last_name, email, phone, adresse, postal_code, city, status")
      .ilike("first_name", "%clara%")
      .order("created_at", { ascending: false }),
    supabase
      .from("practitioners")
      .select("id, slug, first_name, last_name, email, phone, adresse, postal_code, city, status")
      .or("slug.ilike.%cornaert%,email.ilike.%clara%")
      .order("created_at", { ascending: false })
  ]);

  const practitionerMap = new Map();

  for (const result of practitionerQueries) {
    if (result.error) {
      throw result.error;
    }

    for (const row of result.data ?? []) {
      practitionerMap.set(row.id, row);
    }
  }

  const practitioners = [...practitionerMap.values()].filter((row) => {
    const firstName = normalize(row.first_name);
    const lastName = normalize(row.last_name);
    const slug = normalize(row.slug);
    const email = normalize(row.email);

    return (
      firstName.includes("clara") ||
      lastName.includes("cornaert") ||
      slug.includes("cornaert") ||
      email.includes("clara")
    );
  });

  const practitionerIds = practitioners.map((row) => row.id);

  const { data: accounts, error: accountsError } = practitionerIds.length
    ? await supabase
        .from("practitioner_accounts")
        .select(
          "id, auth_user_id, practitioner_id, email, plan, contact_slot, stripe_customer_id, stripe_subscription_status, created_at, updated_at"
        )
        .or(
          `practitioner_id.in.(${practitionerIds.join(",")}),email.ilike.%clara%,email.ilike.%cornaert%`
        )
        .order("updated_at", { ascending: false })
    : await supabase
        .from("practitioner_accounts")
        .select(
          "id, auth_user_id, practitioner_id, email, plan, contact_slot, stripe_customer_id, stripe_subscription_status, created_at, updated_at"
        )
        .or("email.ilike.%clara%,email.ilike.%cornaert%")
        .order("updated_at", { ascending: false });

  if (accountsError) {
    throw accountsError;
  }

  let authUsers = [];

  try {
    authUsers = (await listAllUsers()).filter((user) => {
      const email = normalize(user.email);
      return email.includes("clara") || email.includes("cornaert");
    });
  } catch (error) {
    authUsers = [{ authLookupError: error instanceof Error ? error.message : String(error) }];
  }

  console.log(
    JSON.stringify(
      {
        practitioners,
        practitioner_accounts: accounts ?? [],
        auth_users: authUsers
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
