import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("apply");

const DASHBOARD_LOGIN_EMAIL = "lcincinelli@osezone.com";
const DASHBOARD_SECONDARY_AUTH_EMAIL = "lcincinelli+cabinet-2@osezone.com";
const CLAIM_TEST_EMAIL = "lcincinelli+claim@naturocarte.test";

const DASHBOARD_PRACTITIONERS = [
  {
    slug: "lucas-cincinelli-dashboard-paris-17",
    first_name: "Lucas",
    last_name: "CINCINELLI",
    email: DASHBOARD_LOGIN_EMAIL,
    phone: "0600001701",
    adresse: "126 Rue de Tocqueville",
    postal_code: "75017",
    city: "Paris",
    lat: 48.8879,
    lng: 2.3084,
    siret: "10000000000001",
    status: "published"
  },
  {
    slug: "lucas-cincinelli-dashboard-saint-ouen",
    first_name: "Lucas",
    last_name: "CINCINELLI",
    email: DASHBOARD_LOGIN_EMAIL,
    phone: "0600009301",
    adresse: "18 Rue des Rosiers",
    postal_code: "93400",
    city: "Saint-Ouen-sur-Seine",
    lat: 48.9116,
    lng: 2.3345,
    siret: "10000000000002",
    status: "published"
  }
];

const CLAIM_PRACTITIONERS = [
  {
    slug: "lucas-cincinelli-claim-paris-10",
    first_name: "Lucas",
    last_name: "CINCINELLI",
    email: CLAIM_TEST_EMAIL,
    phone: "0600001001",
    adresse: "12 Rue du Faubourg Saint-Denis",
    postal_code: "75010",
    city: "Paris",
    lat: 48.8727,
    lng: 2.3559,
    siret: "10000000000003",
    status: "hidden_pending_contact"
  },
  {
    slug: "lucas-cincinelli-claim-pantin",
    first_name: "Lucas",
    last_name: "CINCINELLI",
    email: CLAIM_TEST_EMAIL,
    phone: "0600009350",
    adresse: "44 Avenue Jean Lolive",
    postal_code: "93500",
    city: "Pantin",
    lat: 48.8947,
    lng: 2.4011,
    siret: "10000000000004",
    status: "hidden_pending_contact"
  }
];

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

async function upsertPractitioner(definition) {
  const { data: existing, error: lookupError } = await supabase
    .from("practitioners")
    .select("id, slug, status, email")
    .eq("slug", definition.slug)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (existing?.id) {
    if (APPLY) {
      const { error: updateError } = await supabase
        .from("practitioners")
        .update({
          first_name: definition.first_name,
          last_name: definition.last_name,
          email: definition.email,
          phone: definition.phone,
          adresse: definition.adresse,
          postal_code: definition.postal_code,
          city: definition.city,
          lat: definition.lat,
          lng: definition.lng,
          siret: definition.siret,
          status: definition.status
        })
        .eq("id", existing.id);

      if (updateError) {
        throw updateError;
      }
    }

    return { id: existing.id, slug: definition.slug, created: false };
  }

  if (!APPLY) {
    return { id: null, slug: definition.slug, created: false };
  }

  const { data: created, error: createError } = await supabase
    .from("practitioners")
    .insert({
      first_name: definition.first_name,
      last_name: definition.last_name,
      slug: definition.slug,
      email: definition.email,
      phone: definition.phone,
      adresse: definition.adresse,
      postal_code: definition.postal_code,
      city: definition.city,
      lat: definition.lat,
      lng: definition.lng,
      siret: definition.siret,
      status: definition.status
    })
    .select("id")
    .maybeSingle();

  if (createError || !created?.id) {
    throw createError ?? new Error(`Failed to create practitioner ${definition.slug}.`);
  }

  return { id: created.id, slug: definition.slug, created: true };
}

async function ensurePractitionerAccount(params) {
  const { practitionerId, practitionerEmail, authUserId, contactSlot = "email" } = params;
  const { data: existingByPractitioner, error: lookupError } = await supabase
    .from("practitioner_accounts")
    .select(
      "id, auth_user_id, practitioner_id, email, plan, contact_slot, stripe_customer_id, stripe_subscription_status, login_count"
    )
    .eq("practitioner_id", practitionerId)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  const { data: existingByAuth, error: authLookupError } = await supabase
    .from("practitioner_accounts")
    .select(
      "id, auth_user_id, practitioner_id, email, plan, contact_slot, stripe_customer_id, stripe_subscription_status, login_count"
    )
    .eq("auth_user_id", authUserId)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (authLookupError) {
    throw authLookupError;
  }

  const reusableAccount =
    existingByPractitioner?.id
      ? existingByPractitioner
      : existingByAuth?.id && (!existingByAuth.practitioner_id || existingByAuth.practitioner_id === practitionerId)
        ? existingByAuth
        : null;

  if (reusableAccount?.id) {
    if (APPLY) {
      const { error: updateError } = await supabase
        .from("practitioner_accounts")
        .update({
          auth_user_id: authUserId,
          practitioner_id: practitionerId,
          email: practitionerEmail,
          contact_slot: contactSlot,
          updated_at: new Date().toISOString()
        })
        .eq("id", reusableAccount.id);

      if (updateError) {
        throw updateError;
      }
    }

    return {
      id: reusableAccount.id,
      practitioner_id: practitionerId,
      auth_user_id: authUserId,
      email: practitionerEmail,
      created: false
    };
  }

  if (!APPLY) {
    return {
      id: null,
      practitioner_id: practitionerId,
      auth_user_id: authUserId,
      email: practitionerEmail,
      created: false
    };
  }

  const { data: created, error: createError } = await supabase
    .from("practitioner_accounts")
    .insert({
      auth_user_id: authUserId,
      practitioner_id: practitionerId,
      email: practitionerEmail,
      contact_slot: contactSlot,
      plan: "presence",
      login_count: 0,
      updated_at: new Date().toISOString()
    })
    .select("id")
    .maybeSingle();

  if (createError || !created?.id) {
    throw createError ?? new Error(`Failed to create practitioner account for ${practitionerId}.`);
  }

  return {
    id: created.id,
    practitioner_id: practitionerId,
    auth_user_id: authUserId,
    email: practitionerEmail,
    created: true
  };
}

async function loadCurrentState() {
  const targetSlugs = [
    ...DASHBOARD_PRACTITIONERS.map((item) => item.slug),
    ...CLAIM_PRACTITIONERS.map((item) => item.slug)
  ];

  const [{ data: practitioners, error: practitionersError }, { data: accounts, error: accountsError }] =
    await Promise.all([
      supabase
        .from("practitioners")
        .select("id, slug, first_name, last_name, email, status, adresse, postal_code, city")
        .in("slug", targetSlugs)
        .order("slug", { ascending: true }),
      supabase
        .from("practitioner_accounts")
        .select(
          "id, auth_user_id, practitioner_id, email, plan, contact_slot, stripe_customer_id, stripe_subscription_status, created_at, updated_at"
        )
        .or(`email.eq.${DASHBOARD_LOGIN_EMAIL},email.eq.${CLAIM_TEST_EMAIL}`)
    ]);

  if (practitionersError) throw practitionersError;
  if (accountsError) throw accountsError;

  return {
    practitioners: practitioners ?? [],
    practitioner_accounts: accounts ?? []
  };
}

async function main() {
  const existingBefore = await loadCurrentState();
  const dashboardPrimaryAuth = await ensureAuthUser(DASHBOARD_LOGIN_EMAIL);
  const dashboardSecondaryAuth = await ensureAuthUser(DASHBOARD_SECONDARY_AUTH_EMAIL);
  const claimAuth = await ensureAuthUser(CLAIM_TEST_EMAIL);

  const createdPractitioners = [];
  const createdAccounts = [];

  for (const practitioner of DASHBOARD_PRACTITIONERS) {
    const result = await upsertPractitioner(practitioner);
    createdPractitioners.push({
      scope: "dashboard",
      slug: practitioner.slug,
      ...result
    });
  }

  for (const practitioner of CLAIM_PRACTITIONERS) {
    const result = await upsertPractitioner(practitioner);
    createdPractitioners.push({
      scope: "claim",
      slug: practitioner.slug,
      ...result
    });
  }

  const dashboardPractitionerBySlug = new Map(createdPractitioners.map((item) => [item.slug, item.id]));

  for (const [index, practitioner] of DASHBOARD_PRACTITIONERS.entries()) {
    const practitionerId = dashboardPractitionerBySlug.get(practitioner.slug);
    const authUserId =
      index === 0 ? dashboardPrimaryAuth.userId : dashboardSecondaryAuth.userId;

    if (!practitionerId || !authUserId) {
      continue;
    }

    const account = await ensurePractitionerAccount({
      practitionerId,
      practitionerEmail: DASHBOARD_LOGIN_EMAIL,
      authUserId
    });

    createdAccounts.push({
      scope: "dashboard",
      slug: practitioner.slug,
      ...account
    });
  }

  const existingAfter = APPLY ? await loadCurrentState() : existingBefore;

  console.log(
    JSON.stringify(
      {
        apply: APPLY,
        dashboard_login_email: DASHBOARD_LOGIN_EMAIL,
        dashboard_secondary_auth_email: DASHBOARD_SECONDARY_AUTH_EMAIL,
        claim_test_email: CLAIM_TEST_EMAIL,
        auth_users: {
          dashboard_primary: dashboardPrimaryAuth,
          dashboard_secondary: dashboardSecondaryAuth,
          claim_test: claimAuth
        },
        practitioners: {
          dashboard: DASHBOARD_PRACTITIONERS,
          claim: CLAIM_PRACTITIONERS
        },
        operations: {
          practitioners: createdPractitioners,
          practitioner_accounts: createdAccounts
        },
        before: existingBefore,
        after: existingAfter
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
